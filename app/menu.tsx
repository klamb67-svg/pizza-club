// app/menu.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Dimensions,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { handleAccountNavigation } from "../lib/authUtils";

const TABLE_URL =
  "https://bvmwcswddbepelgctybs.supabase.co/storage/v1/object/public/pizza/Table.png";

// Get screen dimensions for responsive design
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isTablet = screenWidth > 768;
const isMobile = screenWidth < 480;

const PIZZAS = [
  {
    id: "cheese",
    name: "Cheese",
    url: "https://bvmwcswddbepelgctybs.supabase.co/storage/v1/object/public/pizza/CPizza.png",
  },
  {
    id: "pepperoni",
    name: "Pepperoni",
    url: "https://bvmwcswddbepelgctybs.supabase.co/storage/v1/object/public/pizza/PPizza1.png",
  },
  {
    id: "sausage",
    name: "Sausage",
    url: "https://bvmwcswddbepelgctybs.supabase.co/storage/v1/object/public/pizza/SPizza.png",
  },
  {
    id: "special",
    name: "Special",
    url: "https://bvmwcswddbepelgctybs.supabase.co/storage/v1/object/public/pizza/LPizza.png",
  },
];

const TIMES = [
  "5:15",
  "5:30",
  "5:45",
  "6:00",
  "6:15",
  "6:30",
  "6:45",
  "7:00",
  "7:15",
  "7:30",
];

export default function Menu() {
  const [selectedPizza, setSelectedPizza] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { username } = useLocalSearchParams<{ username: string }>();
  
  // 🔧 TODO: replace username check with Supabase role check
  const isAdmin = username === "RobertP";

  const handleAdminPortal = () => {
    router.push("/admin/orders");
  };

  return (
    <ImageBackground source={{ uri: TABLE_URL }} style={styles.background}>
      {/* bottom gradient overlay */}
      <LinearGradient
        colors={["transparent", "rgba(255,255,255,0.08)"]}
        style={styles.gradientOverlay}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Choose Your Pizza</Text>

        <View style={styles.pizzaGrid}>
          {PIZZAS?.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.pizzaCard,
                selectedPizza === p.id && styles.selectedPizzaCard
              ]}
              onPress={() => {
                setSelectedPizza(p.id);
                setSelectedTime(null);
                setOpen(false);
              }}
              activeOpacity={0.8}
            >
              <View style={styles.pizzaImageContainer}>
                <Image
                  source={{ uri: p.url }}
                  style={styles.pizzaImage}
                  resizeMode="contain"
                />
                {selectedPizza === p.id && (
                  <View style={styles.selectionOverlay}>
                    <View style={styles.selectionGlow} />
                  </View>
                )}
              </View>
              <Text 
                style={[
                  styles.pizzaName,
                  selectedPizza === p.id && styles.selectedPizzaName
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {p.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedPizza && (
          <>
            <Text style={styles.subtitle}>Select a pick up time</Text>

            {/* Dropdown Box */}
            <TouchableOpacity
              style={styles.dropdownBox}
              onPress={() => setOpen(!open)}
            >
              <Text
                style={styles.dropdownText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {selectedTime ? `${selectedTime} PM` : "-- Select Time --"}
              </Text>
            </TouchableOpacity>

            {/* Expanded List */}
            {open && (
              <ScrollView
                style={styles.dropdownList}
                nestedScrollEnabled={true}
              >
                {TIMES?.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedTime(time);
                      setOpen(false);
                      // ✅ Pass pizza + time + user data to ticket page
                      router.push({
                        pathname: "/ticket",
                        params: {
                          pizza: selectedPizza,
                          time: time,
                          name: username || "",
                          phone: "555-123-4567", // TODO: Get from user profile
                          date: new Date().toLocaleDateString("en-US", { 
                            month: "2-digit", 
                            day: "2-digit", 
                            year: "2-digit" 
                          }),
                          pulocation: "Pickup at 123 Main St", // TODO: Get from user profile
                        },
                      });
                    }}
                  >
                    <Text style={styles.dropdownText}>{time} PM</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </>
        )}

        {/* Navigation buttons at bottom */}
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
          
          {/* FOH Navigation Links */}
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
              onPress={() => router.push("/contact")}
              activeOpacity={0.8}
            >
              <Text style={styles.navButtonText}>CONTACT</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.navButton} 
              onPress={() => router.push("/about")}
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
  
  // Enhanced pizza card styles
  pizzaCard: {
    width: "45%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "rgba(0, 255, 102, 0.3)",
    shadowColor: "#00FF66",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  selectedPizzaCard: {
    borderColor: "#00FF66",
    backgroundColor: "rgba(0, 255, 102, 0.1)",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    transform: [{ scale: 1.02 }],
  },
  
  pizzaImageContainer: {
    position: "relative",
    marginBottom: 8,
  },
  pizzaImage: { 
    width: isMobile ? 100 : 120, 
    height: isMobile ? 100 : 120,
    borderRadius: 8,
  },
  selectionOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 8,
    overflow: 'hidden',
  },
  selectionGlow: {
    flex: 1,
    backgroundColor: "rgba(0, 255, 102, 0.2)",
    borderRadius: 8,
  },
  
  pizzaName: {
    fontSize: isMobile ? 14 : 18,
    color: "#00FF66",
    fontFamily: "VT323_400Regular",
    textAlign: "center",
    textShadowColor: "#00aa44",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  selectedPizzaName: {
    color: "#00FF66",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: isMobile ? 18 : 22,
    color: "#00FF66",
    marginTop: 30,
    marginBottom: 15,
    fontFamily: "VT323_400Regular",
    textAlign: "center",
    textShadowColor: "#00aa44",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },

  // Enhanced dropdown styles
  dropdownBox: {
    borderWidth: 2,
    borderColor: "#00FF66",
    borderRadius: 8,
    marginTop: 10,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingVertical: isMobile ? 10 : 12,
    paddingHorizontal: isMobile ? 20 : 24,
    alignItems: "center",
    alignSelf: "center",
    minWidth: isMobile ? 140 : 160,
    shadowColor: "#00FF66",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  dropdownText: {
    color: "#00FF66",
    fontSize: isMobile ? 16 : 18,
    fontFamily: "VT323_400Regular",
    textAlign: "center",
    includeFontPadding: false,
    textAlignVertical: "center",
    textShadowColor: "#00aa44",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  dropdownList: {
    marginTop: 5,
    borderWidth: 2,
    borderColor: "#00FF66",
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    alignSelf: "center",
    minWidth: isMobile ? 140 : 160,
    maxHeight: 200,
    zIndex: 10,
    shadowColor: "#00FF66",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  dropdownItem: {
    paddingVertical: isMobile ? 8 : 10,
    width: "100%",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 255, 102, 0.2)",
  },
  
  // Enhanced admin button styles
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
  
  // Bottom navigation container
  bottomNavContainer: {
    marginTop: 30,
    alignItems: 'center',
    paddingTop: 20,
  },
  
  // Enhanced navigation styles
  navContainer: {
    marginTop: 15,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
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
});
