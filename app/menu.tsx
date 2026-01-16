/// app/menu.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Platform,
  ActivityIndicator,
  Modal,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { handleAccountNavigation } from "../lib/authUtils";
import { supabase } from "../lib/supabase";

const TABLE_URL =
  "https://bvmwcswddbepelgctybs.supabase.co/storage/v1/object/public/pizza/Table.png";

const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

// Type declaration for window.sessionStorage (web only)
declare global {
  interface Window {
    sessionStorage?: Storage;
  }
}

const TIME_SLOTS = [
  "17:15",
  "17:30",
  "17:45",
  "18:00",
  "18:15",
  "18:30",
  "18:45",
  "19:00",
  "19:15",
  "19:30",
];

interface Pizza {
  id: string;
  name: string;
  image_url: string;
  is_active: boolean;
}

function formatTime12Hour(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

function getCurrentWeekend(): { date: string; dayOfWeek: string }[] {
  const now = new Date();
  const currentDay = now.getDay();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // If it's past Saturday 7:30pm (19:30), show next weekend
  const isSaturdayEvening = currentDay === 6 && (currentHour > 19 || (currentHour === 19 && currentMinute >= 30));
  const isPastWeekend = currentDay === 0; // Sunday
  
  const daysToAdd = (isSaturdayEvening || isPastWeekend) ? 
    (currentDay === 6 ? 6 : 5) : // If Sat evening, add 6 days to get to Friday. If Sunday, add 5 days
    0;
  
  const results: { date: string; dayOfWeek: string }[] = [];
  
  // Find the Friday and Saturday of the target weekend
  for (let i = 0; i < 14; i++) {
    const checkDate = new Date(now);
    checkDate.setDate(now.getDate() + daysToAdd + i);
    checkDate.setHours(0, 0, 0, 0);
    const dayOfWeek = checkDate.getDay();
    
    if (dayOfWeek === 5) { // Friday
      results.push({
        date: checkDate.toISOString().split('T')[0],
        dayOfWeek: 'Friday'
      });
    } else if (dayOfWeek === 6) { // Saturday
      results.push({
        date: checkDate.toISOString().split('T')[0],
        dayOfWeek: 'Saturday'
      });
      break; // Stop after finding Saturday
    }
  }
  
  return results;
}

function isTimeSlotPast(date: string, time: string): boolean {
  const now = new Date();
  const [hours, minutes] = time.split(':').map(Number);
  const slotDateTime = new Date(date + 'T' + time + ':00');
  
  return slotDateTime < now;
}

function isDayPast(date: string): boolean {
  const now = new Date();
  const dayDate = new Date(date + 'T23:59:59');
  
  return dayDate < now;
}

function formatNightDate(dateStr: string, dayOfWeek: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  return `${dayOfWeek}, ${month} ${day}`;
}

interface Night {
  date: string;
  dayOfWeek: string;
}

// Helper function to safely access sessionStorage (web only)
const getSessionStorageItem = (key: string): string | null => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.sessionStorage) {
    try {
      return window.sessionStorage.getItem(key);
    } catch (error) {
      console.error('Error accessing sessionStorage:', error);
      return null;
    }
  }
  return null;
};

const setSessionStorageItem = (key: string, value: string): void => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.sessionStorage) {
    try {
      window.sessionStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting sessionStorage:', error);
    }
  }
};

export default function Menu() {
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [loadingPizzas, setLoadingPizzas] = useState(true);
  const [selectedPizza, setSelectedPizza] = useState<string | null>(null);
  const [selectedNight, setSelectedNight] = useState<Night | null>(null);
  const [nights, setNights] = useState<Night[]>([]);
  const [takenSlots, setTakenSlots] = useState<Set<string>>(new Set());
  const [loadingSlots, setLoadingSlots] = useState(false);
  // Initialize from sessionStorage if available, otherwise default to false
  const [hasSeenRules, setHasSeenRules] = useState(() => {
    const stored = getSessionStorageItem('pizzaClub_hasSeenRules');
    return stored === 'true';
  });
  const router = useRouter();
  const { username } = useLocalSearchParams<{ username: string }>();

  // Load pizzas from database
  useEffect(() => {
    loadPizzas();
  }, []);

  const loadPizzas = async () => {
    try {
      setLoadingPizzas(true);
      const { data, error } = await supabase
        .from('pizzas')
        .select('id, name, image_url, is_active')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error loading pizzas:', error);
        return;
      }

      setPizzas(data || []);
    } catch (error) {
      console.error('Error in loadPizzas:', error);
    } finally {
      setLoadingPizzas(false);
    }
  };

  // Calculate nights on mount and refresh periodically
  useEffect(() => {
    const updateNights = () => {
      const currentWeekend = getCurrentWeekend();
      setNights(currentWeekend);
    };
    
    updateNights();
    
    // Refresh every minute to update grayed out slots
    const interval = setInterval(updateNights, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Fetch taken AND locked slots when night is selected
  const fetchTakenSlots = useCallback(async () => {
    if (!selectedNight) {
      setTakenSlots(new Set());
      return;
    }

    try {
      setLoadingSlots(true);

      // Fetch taken slots (orders)
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('pickup_time')
        .eq('pickup_date', selectedNight.date)
        .not('status', 'eq', 'cancelled');

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
      }

      // Fetch locked slots
      const { data: lockedSlots, error: lockedError } = await supabase
        .from('locked_slots')
        .select('pickup_time')
        .eq('pickup_date', selectedNight.date);

      if (lockedError) {
        console.error('Error fetching locked slots:', lockedError);
      }

      // Build set of taken times (format: "17:15:00" -> "17:15")
      const taken = new Set<string>();
      
      // Add ordered slots
      orders?.forEach(order => {
        if (order.pickup_time) {
          const timeShort = order.pickup_time.substring(0, 5);
          taken.add(timeShort);
        }
      });
      
      // Add locked slots
      lockedSlots?.forEach(slot => {
        if (slot.pickup_time) {
          const timeShort = slot.pickup_time.substring(0, 5);
          taken.add(timeShort);
        }
      });

      setTakenSlots(taken);
    } catch (error) {
      console.error('Error in fetchTakenSlots:', error);
      setTakenSlots(new Set());
    } finally {
      setLoadingSlots(false);
    }
  }, [selectedNight]);

  useEffect(() => {
    fetchTakenSlots();
  }, [fetchTakenSlots]);

  // Refetch slots when screen comes back into focus
  useFocusEffect(
    useCallback(() => {
      if (selectedNight) {
        fetchTakenSlots();
      }
    }, [selectedNight, fetchTakenSlots])
  );

  // Reload pizzas when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadPizzas();
    }, [])
  );

  if (!username) {
    console.log("⚠️ Menu: Missing username parameter - redirecting to login");
    router.replace("/login");
    return null;
  }

  const isAdmin = username === "rpaulson";

  const handleAdminPortal = () => {
    router.push("/admin");
  };

  const handleTimeSelect = (time: string) => {
    if (!selectedNight || !selectedPizza) return;
    
    // Find the selected pizza name
    const pizza = pizzas.find(p => p.id === selectedPizza);
    if (!pizza) return;
    
    router.push({
      pathname: "/ticket",
      params: {
        pizza: pizza.name,
        time: time,
        pickup_date: selectedNight.date,
        pickup_time: time,
        name: username || "",
        username: username || "",
        date: new Date(selectedNight.date + 'T12:00:00').toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "2-digit"
        }),
      },
    });
  };

  const handleAgreeToRules = () => {
    setHasSeenRules(true);
    setSessionStorageItem('pizzaClub_hasSeenRules', 'true');
  };

  const handleDonationLink = () => {
    Linking.openURL('https://www.amazon.com/hz/wishlist/ls/1LASTYI5W6HFO?ref_=wl_share');
  };

  return (
    <ImageBackground source={{ uri: TABLE_URL }} style={styles.background}>
      <LinearGradient
        colors={["transparent", "rgba(255,255,255,0.08)"]}
        style={styles.gradientOverlay}
      />

      <Modal
        visible={!hasSeenRules}
        transparent={true}
        animationType="fade"
        onRequestClose={handleAgreeToRules}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView contentContainerStyle={styles.modalScrollContent}>
              <Text style={styles.modalTitle}>RULES OF PIZZA CLUB</Text>
              
              <View style={styles.ruleItem}>
                <Text style={styles.ruleNumber}>1.</Text>
                <Text style={styles.ruleText}>First rule of Pizza Club is you don't talk about Pizza Club</Text>
              </View>

              <View style={styles.ruleItem}>
                <Text style={styles.ruleNumber}>2.</Text>
                <Text style={styles.ruleText}>The second rule of Pizza Club is you don't talk about Pizza Club</Text>
              </View>

              <View style={styles.ruleItem}>
                <Text style={styles.ruleNumber}>3.</Text>
                <Text style={styles.ruleText}>One pizza per order</Text>
              </View>

              <View style={styles.ruleItem}>
                <Text style={styles.ruleNumber}>4.</Text>
                <Text style={styles.ruleText}>If the number of members exceeds available time slots, a lottery system will be implemented</Text>
              </View>

              <View style={styles.ruleItem}>
                <Text style={styles.ruleNumber}>5.</Text>
                <Text style={styles.ruleText}>No payments accepted - consider a donation: {' '}
                  <TouchableOpacity onPress={handleDonationLink} style={styles.linkButton}>
                    <Text style={styles.donationLink}>Amazon Wish List</Text>
                  </TouchableOpacity>
                </Text>
              </View>

              <View style={styles.ruleItem}>
                <Text style={styles.ruleNumber}>6.</Text>
                <Text style={styles.ruleText}>Failure to pick up pizza revokes membership</Text>
              </View>

              <TouchableOpacity
                style={styles.agreeButton}
                onPress={handleAgreeToRules}
                activeOpacity={0.8}
              >
                <Text style={styles.agreeButtonText}>AGREE TO RULES</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Choose Your Pizza</Text>

        {loadingPizzas ? (
          <ActivityIndicator size="large" color="#00FF66" style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.pizzaGrid}>
            {pizzas.map((pizza) => {
              const isAvailable = pizza.is_active;
              return (
                <TouchableOpacity
                  key={pizza.id}
                  style={[
                    styles.pizzaCard,
                    selectedPizza === pizza.id && styles.selectedPizzaCard,
                    !isAvailable && styles.unavailablePizzaCard
                  ]}
                  onPress={() => {
                    if (isAvailable) {
                      setSelectedPizza(pizza.id);
                      setSelectedNight(null);
                      setTakenSlots(new Set());
                    }
                  }}
                  activeOpacity={isAvailable ? 0.8 : 1}
                  disabled={!isAvailable}
                >
                  <View style={styles.pizzaImageContainer}>
                    <Image
                      source={{ uri: pizza.image_url }}
                      style={[
                        styles.pizzaImage,
                        !isAvailable && styles.unavailablePizzaImage
                      ]}
                      resizeMode="contain"
                    />
                  </View>
                  <Text
                    style={[
                      styles.pizzaName,
                      selectedPizza === pizza.id && styles.selectedPizzaName,
                      !isAvailable && styles.unavailablePizzaName
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {pizza.name}
                  </Text>
                  {!isAvailable && (
                    <Text style={styles.soldOutText}>SOLD OUT</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {selectedPizza && (
          <View style={styles.selectionSection}>
            <Text style={styles.subtitle}>Pick a day</Text>

            {nights.length === 0 ? (
              <Text style={styles.noDataText}>No available days</Text>
            ) : (
              <View style={styles.radioGroup}>
                {nights.map((night) => {
                  const dayIsPast = isDayPast(night.date);
                  return (
                    <TouchableOpacity
                      key={night.date}
                      style={[
                        styles.radioButton,
                        selectedNight?.date === night.date && styles.radioButtonSelected,
                        dayIsPast && styles.radioButtonDisabled
                      ]}
                      onPress={() => !dayIsPast && setSelectedNight(night)}
                      activeOpacity={dayIsPast ? 1 : 0.8}
                      disabled={dayIsPast}
                    >
                      <View style={[
                        styles.radioCircle,
                        dayIsPast && styles.radioCircleDisabled
                      ]}>
                        {selectedNight?.date === night.date && !dayIsPast && (
                          <View style={styles.radioCircleFilled} />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.radioText,
                          selectedNight?.date === night.date && styles.radioTextSelected,
                          dayIsPast && styles.radioTextDisabled
                        ]}
                      >
                        {formatNightDate(night.date, night.dayOfWeek)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {selectedNight && (
          <View style={styles.selectionSection}>
            <Text style={styles.subtitle}>Pick a time</Text>

            {loadingSlots ? (
              <ActivityIndicator size="small" color="#00FF66" />
            ) : (
              <View style={styles.timeGrid}>
                {TIME_SLOTS.map((time) => {
                  const taken = takenSlots.has(time);
                  const isPast = isTimeSlotPast(selectedNight.date, time);
                  const isDisabled = taken || isPast;
                  
                  return (
                    <TouchableOpacity
                      key={time}
                      style={[
                        styles.timeButton,
                        isDisabled && styles.timeButtonTaken
                      ]}
                      onPress={() => !isDisabled && handleTimeSelect(time)}
                      activeOpacity={isDisabled ? 1 : 0.8}
                      disabled={isDisabled}
                    >
                      <Text
                        style={[
                          styles.timeButtonText,
                          isDisabled && styles.timeButtonTextTaken
                        ]}
                      >
                        {formatTime12Hour(time)}
                      </Text>
                      {taken && <Text style={styles.takenLabel}>TAKEN</Text>}
                      {!taken && isPast && <Text style={styles.takenLabel}>PAST</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}

        <View style={styles.specialMessageContainer}>
          <View style={styles.specialMessageWrapper}>
            <Text style={styles.specialMessageText} numberOfLines={1}>
              Today's Special: The WI - Meatballs and Cheese Curds!
            </Text>
          </View>
        </View>

        <View style={styles.bottomNavContainer}>
          {isAdmin && (
            <TouchableOpacity
              style={styles.adminButton}
              onPress={handleAdminPortal}
              activeOpacity={0.8}
            >
              <Text style={styles.adminButtonText}>ADMIN PORTAL</Text>
            </TouchableOpacity>
          )}

          <View style={styles.navContainer}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => handleAccountNavigation(router, username)}
              activeOpacity={0.8}
            >
              <Text style={styles.navButtonText}>ACCOUNT</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navButton}
              onPress={() => router.push({ pathname: "/history", params: { username } })}
              activeOpacity={0.8}
            >
              <Text style={styles.navButtonText}>HISTORY</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navButton}
              onPress={() => router.push({ pathname: "/contact", params: username ? { username } : undefined })}
              activeOpacity={0.8}
            >
              <Text style={styles.navButtonText}>CONTACT</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navButton}
              onPress={() => router.push({ pathname: "/about", params: username ? { username } : undefined })}
              activeOpacity={0.8}
            >
              <Text style={styles.navButtonText}>ABOUT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}


const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: "cover" },

  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    top: "70%",
  },

  content: {
    padding: isMobile ? 15 : 20,
    alignItems: "center",
    paddingBottom: isMobile ? 40 : 60,
  },

  title: {
    fontSize: isMobile ? 24 : 28,
    color: "#00FF66",
    marginBottom: 20,
    fontFamily: "VT323_400Regular",
    textShadowColor: "#00aa44",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },

  pizzaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    paddingHorizontal: 20,
  },

  pizzaCard: {
    width: isMobile ? "45%" : "45%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 12,
    padding: isMobile ? 12 : 16,
    borderWidth: 2,
    borderColor: "rgba(0, 255, 102, 0.3)",
    shadowColor: "#00FF66",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  selectedPizzaCard: {
    borderColor: "#FFD700",
    borderWidth: 3,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    shadowColor: "#FFD700",
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
    transform: [{ scale: 1.02 }],
  },

  unavailablePizzaCard: {
    opacity: 0.4,
    borderColor: "rgba(100, 100, 100, 0.3)",
  },

  pizzaImageContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },

  pizzaImage: {
    width: isMobile ? 80 : 120,
    height: isMobile ? 80 : 120,
    borderRadius: 8,
  },

  unavailablePizzaImage: {
    opacity: 0.5,
  },

  pizzaName: {
    fontSize: isMobile ? 16 : 18,
    color: "#00FF66",
    fontFamily: "VT323_400Regular",
    textAlign: "center",
    textShadowColor: "#00aa44",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
    marginTop: 8,
  },

  selectedPizzaName: {
    color: "#FFD700",
    fontWeight: "bold",
  },

  unavailablePizzaName: {
    color: "rgba(100, 100, 100, 0.7)",
  },

  soldOutText: {
    fontSize: isMobile ? 10 : 12,
    color: "#FF4444",
    fontFamily: "VT323_400Regular",
    textAlign: "center",
    marginTop: 4,
    fontWeight: "bold",
  },

  selectionSection: {
    marginTop: 30,
    alignItems: "center",
    width: "100%",
  },

  subtitle: {
    fontSize: isMobile ? 18 : 22,
    color: "#00FF66",
    marginBottom: 15,
    fontFamily: "VT323_400Regular",
    textAlign: "center",
    textShadowColor: "#00aa44",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },

  noDataText: {
    color: "#00FF66",
    fontSize: isMobile ? 14 : 16,
    fontFamily: "VT323_400Regular",
    opacity: 0.7,
  },

  radioGroup: {
    gap: 12,
    width: "100%",
    maxWidth: 300,
  },

  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: "rgba(0, 255, 102, 0.5)",
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },

  radioButtonSelected: {
    borderColor: "#FFD700",
    backgroundColor: "rgba(0, 0, 0, 0.85)",
  },

  radioButtonDisabled: {
    opacity: 0.4,
    borderColor: "rgba(100, 100, 100, 0.3)",
  },

  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#00FF66",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  radioCircleDisabled: {
    borderColor: "rgba(100, 100, 100, 0.5)",
  },

  radioCircleFilled: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFD700",
  },

  radioText: {
    color: "#00FF66",
    fontSize: isMobile ? 16 : 18,
    fontFamily: "VT323_400Regular",
    textShadowColor: "#00aa44",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },

  radioTextSelected: {
    color: "#FFD700",
  },

  radioTextDisabled: {
    color: "rgba(100, 100, 100, 0.7)",
    textShadowColor: "transparent",
  },

  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    maxWidth: 350,
  },

  timeButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: "#00FF66",
    borderRadius: 6,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    minWidth: 100,
    alignItems: "center",
  },

  timeButtonTaken: {
    borderColor: "rgba(100, 100, 100, 0.5)",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },

  timeButtonText: {
    color: "#00FF66",
    fontSize: isMobile ? 14 : 16,
    fontFamily: "VT323_400Regular",
    textShadowColor: "#00aa44",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },

  timeButtonTextTaken: {
    color: "rgba(100, 100, 100, 0.7)",
    textShadowColor: "transparent",
  },

  takenLabel: {
    color: "rgba(255, 100, 100, 0.7)",
    fontSize: isMobile ? 10 : 12,
    fontFamily: "VT323_400Regular",
    marginTop: 2,
  },

  specialMessageContainer: {
    marginTop: 30,
    marginBottom: 5,
    alignItems: "center",
    width: "100%",
    paddingHorizontal: isMobile ? 15 : 20,
  },

  specialMessageWrapper: {
    width: "100%",
    maxWidth: 450,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0, 255, 102, 0.5)",
    paddingVertical: 12,
    paddingHorizontal: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  specialMessageText: {
    color: "#00FF66",
    fontSize: isMobile ? 14 : 16,
    fontFamily: "VT323_400Regular",
    textShadowColor: "#00aa44",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
    textAlign: "center",
    flexShrink: 0,
  },

  bottomNavContainer: {
    marginTop: 5,
    alignItems: "center",
    paddingTop: 5,
  },

  adminButton: {
    marginBottom: 15,
    paddingVertical: isMobile ? 12 : 14,
    paddingHorizontal: isMobile ? 24 : 28,
    borderWidth: 2,
    borderColor: "#00FF66",
    backgroundColor: "rgba(0, 26, 0, 0.9)",
    borderRadius: 8,
    shadowColor: "#00FF66",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
    alignSelf: "center",
  },

  adminButtonText: {
    color: "#00FF66",
    fontFamily: "VT323_400Regular",
    fontSize: isMobile ? 16 : 18,
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: "#00aa44",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },

  navContainer: {
    marginTop: 15,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: isMobile ? 6 : 8,
    paddingHorizontal: isMobile ? 10 : 20,
  },

  navButton: {
    paddingVertical: isMobile ? 8 : 10,
    paddingHorizontal: isMobile ? 14 : 16,
    borderWidth: 1,
    borderColor: "rgba(0, 255, 102, 0.7)",
    backgroundColor: "rgba(0, 26, 0, 0.8)",
    borderRadius: 6,
    minWidth: isMobile ? 60 : 70,
    shadowColor: "#00FF66",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },

  navButtonText: {
    color: "#00FF66",
    fontFamily: "VT323_400Regular",
    fontSize: isMobile ? 10 : 12,
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: "#00aa44",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    padding: isMobile ? 20 : 40,
  },

  modalContent: {
    backgroundColor: "#001a00",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#00FF66",
    maxWidth: isMobile ? "100%" : 500,
    width: "100%",
    maxHeight: isMobile ? "90%" : "80%",
    shadowColor: "#00FF66",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },

  modalScrollContent: {
    padding: isMobile ? 20 : 30,
    alignItems: "center",
  },

  modalTitle: {
    fontSize: isMobile ? 24 : 28,
    color: "#00FF66",
    fontFamily: "VT323_400Regular",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    textShadowColor: "#00aa44",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },

  ruleItem: {
    flexDirection: "row",
    marginBottom: 15,
    width: "100%",
    flexWrap: "wrap",
  },

  ruleNumber: {
    color: "#00FF66",
    fontSize: isMobile ? 16 : 18,
    fontFamily: "VT323_400Regular",
    fontWeight: "bold",
    marginRight: 10,
    minWidth: 25,
  },

  ruleText: {
    color: "#00FF66",
    fontSize: isMobile ? 16 : 18,
    fontFamily: "VT323_400Regular",
    lineHeight: isMobile ? 22 : 26,
    flex: 1,
    opacity: 0.9,
    textShadowColor: "#00aa44",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },

  linkButton: {
    display: "inline",
  },

  donationLink: {
    color: "#FFD700",
    fontSize: isMobile ? 16 : 18,
    fontFamily: "VT323_400Regular",
    textDecorationLine: "underline",
    textShadowColor: "rgba(255, 215, 0, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },

  agreeButton: {
    marginTop: 20,
    paddingVertical: isMobile ? 14 : 16,
    paddingHorizontal: isMobile ? 30 : 40,
    borderWidth: 2,
    borderColor: "#00FF66",
    backgroundColor: "rgba(0, 26, 0, 0.9)",
    borderRadius: 8,
    shadowColor: "#00FF66",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
    alignSelf: "center",
  },

  agreeButtonText: {
    color: "#00FF66",
    fontFamily: "VT323_400Regular",
    fontSize: isMobile ? 18 : 20,
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: "#00aa44",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
});