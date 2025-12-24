// app/ticket.tsx
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useResponsiveValues } from "../lib/responsive";
import { supabase } from "../lib/supabase";

// Helper: Title Case for names
function toTitleCase(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Helper: Convert 24-hour time (HH:MM) to 12-hour format (H:MM PM)
function formatTime12Hour(timeStr: string): string {
  if (!timeStr) return "6:00 PM";
  
  // Handle if already has AM/PM
  if (timeStr.toUpperCase().includes('AM') || timeStr.toUpperCase().includes('PM')) {
    return timeStr;
  }
  
  const [hoursStr, minutesStr] = timeStr.split(':');
  if (!hoursStr || !minutesStr) return timeStr;
  
  let hours = parseInt(hoursStr);
  const minutes = minutesStr.padStart(2, '0');
  
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  
  return `${displayHours}:${minutes} ${period}`;
}

// Helper: Convert time to HH:MM:SS format (add :00 if needed)
function formatTimeForDB(timeStr: string): string {
  if (!timeStr) return "17:00:00";
  
  // Remove AM/PM if present
  let cleanTime = timeStr.toUpperCase().replace(/[AP]M/i, '').trim();
  
  // If already has seconds, return as is
  if (cleanTime.split(':').length === 3) {
    return cleanTime;
  }
  
  // If has hours and minutes, add seconds
  if (cleanTime.split(':').length === 2) {
    return `${cleanTime}:00`;
  }
  
  return "17:00:00"; // fallback
}

// ✅ Global counter map (per pizza type)
const ticketCounters: Record<string, number> = {};

export default function Ticket() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const responsive = useResponsiveValues();

  // ✅ pull data passed from menu (pizza, time, name, phone, date, pulocation, username)
  const params = useLocalSearchParams();
  const pizzaParam = Array.isArray(params.pizza) ? params.pizza[0] : params.pizza || "";
  const timeParam = Array.isArray(params.time) ? params.time[0] : params.time || "";
  const nameParam = Array.isArray(params.name) ? params.name[0] : params.name || "";
  const phoneParam = Array.isArray(params.phone) ? params.phone[0] : params.phone || "";
  const dateParam = Array.isArray(params.date) ? params.date[0] : params.date || "";
  const usernameParam = Array.isArray(params.username) ? params.username[0] : params.username || "";
  const pickupDateParam = Array.isArray(params.pickup_date) ? params.pickup_date[0] : params.pickup_date || "";
  const pickupTimeParam = Array.isArray(params.pickup_time) ? params.pickup_time[0] : params.pickup_time || "";

  // Format pizza name → capitalized + " Pizza"
  const formattedPizza =
    pizzaParam ? (pizzaParam.charAt(0)?.toUpperCase() + pizzaParam.slice(1) + " Pizza") : "Pizza";

  // Format passenger name → Title Case with fallback
  const formattedName = nameParam ? toTitleCase(nameParam) : "Member";

  // Phone fallback
  const formattedPhone = phoneParam || "555-123-4567";

  // Date fallback
  const formattedDate = dateParam || "10/02/25";

  // Pickup location - FIXED: Use correct address
  const formattedPU = "349 Eagle Dr (Hot Box by mailbox)";

  // Format time to 12-hour format for display
  const formattedTime = formatTime12Hour(timeParam);

  // --- Ticket Number logic ---
  const pizzaPrefix = formattedPizza.slice(0, 2).toUpperCase();
  if (!ticketCounters[pizzaPrefix]) {
    ticketCounters[pizzaPrefix] = 1;
  } else {
    ticketCounters[pizzaPrefix] += 1;
  }
  const ticketNumber = `${pizzaPrefix}${String(ticketCounters[pizzaPrefix]).padStart(3, "0")}`;

  const createOrder = async () => {
    if (submitting) return;
    
    try {
      setSubmitting(true);
      setErrorMessage(null);
      
      console.log('🔍 Starting order creation...', { username: usernameParam, name: nameParam, pizza: formattedPizza, pickupDate: pickupDateParam, pickupTime: pickupTimeParam });
      
      // Look up member by username to get actual member_id and phone
      let memberId: string | number = "";
      let memberPhone: string = phoneParam;
      
      if (!usernameParam) {
        const errorMsg = 'You must be logged in to place an order. Please log in and try again.';
        console.error('❌ No username provided - cannot create order');
        setErrorMessage(errorMsg);
        setSubmitting(false);
        return;
      }
      
      console.log('🔍 Looking up member by username:', usernameParam);
      const { data: member, error: memberError } = await supabase
        .from('members')
        .select('id, phone')
        .eq('username', usernameParam)
        .single();
      
      if (memberError || !member) {
        const errorMsg = `Could not find your member account. Error: ${memberError?.message || 'Unknown error'}`;
        console.error('❌ Member lookup failed:', memberError);
        setErrorMessage(errorMsg);
        setSubmitting(false);
        return;
      }
      
      memberId = member.id;
      memberPhone = member.phone || phoneParam;
      console.log('✅ Found member:', { memberId, memberPhone, memberIdType: typeof memberId });
      
      // Validate we have required member data
      if (!memberId || !memberPhone || memberPhone === "555-123-4567") {
        const errorMsg = `Missing member information. Member ID: ${memberId ? 'found' : 'missing'}, Phone: ${memberPhone || 'missing'}`;
        console.error('❌ Invalid member data:', { memberId, memberPhone });
        setErrorMessage(errorMsg);
        setSubmitting(false);
        return;
      }

      // Validate we have pickup date and time
      if (!pickupDateParam || !pickupTimeParam) {
        const errorMsg = 'Pickup date or time is missing. Please go back to the menu and select a time slot.';
        console.error('❌ Missing pickup_date or pickup_time');
        setErrorMessage(errorMsg);
        setSubmitting(false);
        return;
      }
      
      // Look up pizza_id from pizzas table by name
      let pizzaNameBase = formattedPizza.trim();
      
      // Remove " Pizza" suffix (with space)
      if (pizzaNameBase.toLowerCase().endsWith(' pizza')) {
        pizzaNameBase = pizzaNameBase.slice(0, -6).trim();
      }
      // Remove "Pizza" suffix (no space)
      else if (pizzaNameBase.toLowerCase().endsWith('pizza')) {
        pizzaNameBase = pizzaNameBase.slice(0, -5).trim();
      }
      // Try regex as fallback
      else {
        pizzaNameBase = pizzaNameBase.replace(/\s+Pizza$/i, '').trim();
      }
      
      console.log('🔍 Pizza lookup:', {
        original: formattedPizza,
        stripped: pizzaNameBase,
      });
      
      // Fetch pizzas from database
      const { data: allPizzas, error: allPizzasError } = await supabase
        .from('pizzas')
        .select('id, name, is_active');
      
      if (allPizzasError) {
        console.error('❌ Error fetching pizzas:', allPizzasError);
        setErrorMessage(`Database error: Could not fetch pizzas. ${allPizzasError.message}`);
        setSubmitting(false);
        return;
      }
      
      if (!allPizzas || allPizzas.length === 0) {
        console.error('❌ No pizzas returned from query');
        setErrorMessage('No pizzas found in database. Please check pizzas table.');
        setSubmitting(false);
        return;
      }
      
      // Find best match
      let pizza = null;
      const searchName = pizzaNameBase.toLowerCase().trim();
      
      // Strategy 1: Exact match (case insensitive)
      pizza = allPizzas.find(p => {
        const dbName = p.name.toLowerCase().trim();
        return dbName === searchName && p.is_active;
      });
      
      if (!pizza) {
        // Strategy 2: Reverse contains
        pizza = allPizzas.find(p => {
          const dbName = p.name.toLowerCase().trim();
          return searchName.includes(dbName) && p.is_active;
        });
      }
      
      if (!pizza) {
        // Strategy 3: Pizza name contains search term
        pizza = allPizzas.find(p => {
          const dbName = p.name.toLowerCase().trim();
          return dbName.includes(searchName) && p.is_active;
        });
      }
      
      if (!pizza) {
        // Strategy 4: First word match
        const firstWord = searchName.split(' ')[0];
        pizza = allPizzas.find(p => {
          const dbName = p.name.toLowerCase().trim();
          return dbName === firstWord && p.is_active;
        });
      }
      
      if (!pizza) {
        console.error('❌ Pizza lookup completely failed');
        setErrorMessage(`Pizza "${formattedPizza}" not found. Available pizzas: ${allPizzas.map(p => p.name).join(', ')}`);
        setSubmitting(false);
        return;
      }
      
      console.log('✅ Found pizza:', { id: pizza.id, name: pizza.name });
      
      // Format time for database (HH:MM:SS)
      const dbTime = formatTimeForDB(pickupTimeParam);
      
      console.log('📝 Inserting order with schema:', {
        member_id: String(memberId),
        pizza_id: pizza.id,
        pickup_date: pickupDateParam,
        pickup_time: dbTime,
        delivery_or_pickup: 'pickup',
        status: 'pending',
      });
      
      // Insert order into orders table using pickup_date and pickup_time
      const { data: insertedOrder, error: insertError } = await supabase
        .from('orders')
        .insert([
          {
            member_id: String(memberId),
            pizza_id: pizza.id,
            pickup_date: pickupDateParam,
            pickup_time: dbTime,
            delivery_or_pickup: 'pickup',
            status: 'pending',
          },
        ])
        .select()
        .single();
      
      if (insertError) {
        console.error('❌ Order insert failed:', insertError);
        setErrorMessage(`Order creation failed: ${insertError.message} (Code: ${insertError.code})`);
        setSubmitting(false);
        return;
      }
      
      console.log('✅ Order created successfully in database:', insertedOrder);
      setOrderId(insertedOrder.id);
      setOrderCreated(true);
      setSubmitting(false);
      
    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to create order';
      console.error('❌ Order creation error:', error);
      setErrorMessage(errorMsg);
      setSubmitting(false);
    }
  };

  const handleSubmit = () => {
    createOrder();
  };

  const handleDone = () => {
    if (usernameParam) {
      router.push({ pathname: "/frontdoor", params: { username: usernameParam } });
    } else {
      router.push("/frontdoor");
    }
  };

  const styles = createStyles(responsive);

  // Show loading state while submitting
  if (submitting) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>PIZZA CLUB EXPRESS</Text>
        </View>
        <Text style={styles.prompt}>🔄 Creating your order...</Text>
        <Text style={styles.loadingText}>Please wait while we process your order.</Text>
      </ScrollView>
    );
  }

  // Show success state
  if (orderCreated && orderId) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>PIZZA CLUB EXPRESS</Text>
        </View>
        
        <View style={styles.orderCard}>
          <Text style={styles.cardTitle}>✅ Order Confirmed!</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabelSmall}>ORDER #:</Text>
            <Text style={styles.detailValueSmall}>{orderId}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabelSmall}>CUSTOMER:</Text>
            <Text style={styles.detailValueSmall}>{formattedName}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>PIZZA:</Text>
            <Text style={styles.detailValue}>{formattedPizza}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>DATE:</Text>
            <Text style={styles.detailValue}>{formattedDate}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>TIME:</Text>
            <Text style={styles.detailValue}>{formattedTime}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>PICKUP:</Text>
            <Text style={styles.detailValue}>{formattedPU}</Text>
          </View>
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.button, styles.yesButton]}
            onPress={handleDone}
          >
            <Text style={styles.buttonText}>DONE</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>PIZZA CLUB EXPRESS</Text>
      </View>

      {/* Error message display */}
      {errorMessage && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>ERROR:</Text>
          <Text style={styles.errorDetails}>{errorMessage}</Text>
        </View>
      )}

      {/* Order Details */}
      <View style={styles.orderCard}>
        <Text style={styles.cardTitle}>Order Confirmation</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabelSmall}>TICKET #:</Text>
          <Text style={styles.detailValueSmall}>{ticketNumber}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabelSmall}>CUSTOMER:</Text>
          <Text style={styles.detailValueSmall}>{formattedName}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>PHONE:</Text>
          <Text style={styles.detailValue}>{formattedPhone}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>DATE:</Text>
          <Text style={styles.detailValue}>{formattedDate}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>TIME:</Text>
          <Text style={styles.detailValue}>{formattedTime}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>CARGO:</Text>
          <Text style={styles.detailValue}>{formattedPizza}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>PICKUP:</Text>
          <Text style={styles.detailValue}>{formattedPU}</Text>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actionContainer}>
        {!orderCreated && (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.yesButton]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              <Text style={styles.buttonText}>SUBMIT ORDER</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.noButton]}
              onPress={() => router.push({ pathname: '/menu', params: { username: usernameParam } })}
            >
              <Text style={styles.buttonText}>BACK</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const createStyles = (responsive: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  contentContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: responsive.padding.xl,
    paddingHorizontal: responsive.padding.lg,
    paddingBottom: responsive.padding.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: responsive.margin.xl,
  },
  title: {
    fontSize: responsive.fontSize.xxxl,
    color: "#00FF66",
    fontFamily: "VT323_400Regular",
    textAlign: "center",
    textShadowColor: "#00aa44",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    marginBottom: responsive.margin.sm,
  },
  orderCard: {
    width: "100%",
    maxWidth: responsive.isMobile ? 320 : responsive.isTablet ? 400 : 450,
    borderWidth: 2,
    borderColor: "#00FF66",
    backgroundColor: "black",
    padding: responsive.padding.md,
    marginBottom: responsive.margin.xl,
    shadowColor: "#00FF66",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  cardTitle: {
    fontSize: responsive.fontSize.xl,
    color: "#00FF66",
    fontFamily: "VT323_400Regular",
    textAlign: "center",
    marginBottom: responsive.margin.lg,
    textShadowColor: "#00aa44",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: responsive.margin.sm,
    paddingVertical: responsive.padding.xs,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 255, 102, 0.2)",
  },
  detailLabel: {
    fontSize: responsive.fontSize.lg,
    color: "#00FF66",
    fontFamily: "VT323_400Regular",
    flex: 1,
    fontWeight: "bold",
  },
  detailValue: {
    fontSize: responsive.fontSize.lg,
    color: "#00FF66",
    fontFamily: "VT323_400Regular",
    flex: 2,
    textAlign: "right",
  },
  detailLabelSmall: {
    fontSize: responsive.fontSize.md,
    color: "#00FF66",
    fontFamily: "VT323_400Regular",
    flex: 1,
    fontWeight: "bold",
  },
  detailValueSmall: {
    fontSize: responsive.fontSize.md,
    color: "#00FF66",
    fontFamily: "VT323_400Regular",
    flex: 2,
    textAlign: "right",
  },
  actionContainer: {
    width: "100%",
    maxWidth: responsive.isMobile ? 280 : responsive.isTablet ? 350 : 400,
    alignItems: "center",
  },
  prompt: {
    fontSize: responsive.fontSize.xl,
    color: "#00FF66",
    marginBottom: responsive.margin.lg,
    fontFamily: "VT323_400Regular",
    textAlign: "center",
    textShadowColor: "#00aa44",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  loadingText: {
    fontSize: responsive.fontSize.lg,
    color: "#00FF66",
    fontFamily: "VT323_400Regular",
    textAlign: "center",
    opacity: 0.8,
  },
  buttonRow: {
    flexDirection: "row",
    gap: responsive.margin.lg,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  button: {
    paddingVertical: responsive.padding.sm,
    paddingHorizontal: responsive.padding.md,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#00FF66",
    minHeight: 45,
    justifyContent: "center",
    width: 120,
    backgroundColor: "black",
  },
  yesButton: {
    backgroundColor: "black",
  },
  noButton: {
    backgroundColor: "black",
  },
  buttonText: {
    fontSize: responsive.isMobile ? responsive.fontSize.md : responsive.fontSize.lg,
    fontFamily: "VT323_400Regular",
    color: "#00FF66",
    textAlign: "center",
    fontWeight: "bold",
  },
  errorBox: {
    backgroundColor: "#1a0000",
    borderWidth: 2,
    borderColor: "#ff6666",
    padding: 16,
    marginBottom: responsive.margin.md,
    borderRadius: 4,
    width: "100%",
    maxWidth: responsive.isMobile ? 320 : responsive.isTablet ? 400 : 450,
  },
  errorText: {
    fontSize: responsive.fontSize.lg,
    color: "#ff6666",
    fontFamily: "VT323_400Regular",
    fontWeight: "bold",
    marginBottom: 8,
    textShadowColor: "#ff0000",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  errorDetails: {
    fontSize: responsive.fontSize.md,
    color: "#ff9999",
    fontFamily: "VT323_400Regular",
    lineHeight: 20,
  },
});
