// app/orderConfirmation.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useResponsiveValues } from "../lib/responsive";
import { handleAccountNavigation } from "../lib/authUtils";
import { orderService, OrderData } from "../lib/orderService";

export default function OrderConfirmation() {
  const router = useRouter();
  const responsive = useResponsiveValues();
  const [orderCreated, setOrderCreated] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Get order data from navigation params
  const params = useLocalSearchParams();
  const name = Array.isArray(params.name) ? params.name[0] : params.name || "Member";
  const pizza = Array.isArray(params.pizza) ? params.pizza[0] : params.pizza || "Pizza";
  const time = Array.isArray(params.time) ? params.time[0] : params.time || "6:00 PM";
  const date = Array.isArray(params.date) ? params.date[0] : params.date || new Date().toLocaleDateString();
  const phone = Array.isArray(params.phone) ? params.phone[0] : params.phone || "555-123-4567";

  // Extract pizza price from pizza name (basic parsing)
  const pizzaPrice = pizza.includes('Margherita') ? 18.99 : 
                    pizza.includes('Pepperoni') ? 19.99 : 
                    pizza.includes('Hawaiian') ? 21.99 : 18.99;

  useEffect(() => {
    createOrder();
  }, []);

  const createOrder = async () => {
    try {
      setLoading(true);
      
      const orderData: OrderData = {
        member_id: "69149187-94af-4892-b24c-f169bac1e825", // Use actual member UUID
        pizza_name: pizza,
        pizza_price: pizzaPrice,
        time_slot: time,
        date: date,
        phone: phone,
        special_instructions: `Order for ${name}`
      };

      console.log('🍕 Creating order with data:', orderData);
      
      const result = await orderService.createOrder(orderData);
      
      if (result.success && result.orderId) {
        setOrderCreated(true);
        setOrderId(result.orderId);
        console.log('✅ Order created successfully:', result.orderId);
      } else {
        console.error('❌ Order creation failed:', result.error);
        Alert.alert('Order Error', result.error || 'Failed to create order');
      }
    } catch (error) {
      console.error('❌ Order creation error:', error);
      Alert.alert('Error', 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const styles = createStyles(responsive);

  if (loading) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.message}>🔄 Creating your order...</Text>
        <Text style={styles.loadingText}>Please wait while we process your order and send confirmation.</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Message at top */}
      <Text style={styles.message}>
        {orderCreated ? '✅ Your order has been placed!' : '❌ Order failed to process'}
      </Text>

      {orderCreated && orderId && (
        <View style={styles.orderIdCard}>
          <Text style={styles.orderIdText}>Order #{orderId}</Text>
        </View>
      )}

      {/* Order Details Card */}
      <View style={styles.orderCard}>
        <Text style={styles.cardTitle}>ORDER CONFIRMATION</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Full Name:</Text>
          <Text style={styles.detailValue}>{name}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Order:</Text>
          <Text style={styles.detailValue}>{pizza}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Price:</Text>
          <Text style={styles.detailValue}>${pizzaPrice}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Pickup Time:</Text>
          <Text style={styles.detailValue}>{time}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date:</Text>
          <Text style={styles.detailValue}>{date}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Pickup:</Text>
          <Text style={styles.detailValue}>349 Eagle Dr (Hot Box by mailbox)</Text>
        </View>
        
        {orderCreated && (
          <View style={styles.smsNotification}>
            <Text style={styles.smsText}>📱 SMS confirmation sent to {phone}</Text>
          </View>
        )}
      </View>

      {/* Menu buttons */}
      <View style={styles.menuBox}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => handleAccountNavigation(router, name)}
          >
            <Text style={styles.menuText}>Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => router.push("/history")}
          >
            <Text style={styles.menuText}>History</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => router.push("/contact")}
          >
            <Text style={styles.menuText}>Contact</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => router.push("/about")}
          >
            <Text style={styles.menuText}>About</Text>
          </TouchableOpacity>
        </View>
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
    paddingBottom: responsive.padding.xl,
  },
  message: {
    fontSize: responsive.fontSize.xxxl,
    color: "#00FF66",
    fontFamily: "VT323_400Regular",
    marginBottom: responsive.margin.lg,
    textAlign: "center",
  },
  loadingText: {
    fontSize: responsive.fontSize.lg,
    color: "#00FF66",
    fontFamily: "VT323_400Regular",
    textAlign: "center",
    opacity: 0.8,
  },
  orderIdCard: {
    backgroundColor: "#001a00",
    borderWidth: 2,
    borderColor: "#00FF66",
    padding: 12,
    marginBottom: responsive.margin.md,
    borderRadius: 4,
  },
  orderIdText: {
    fontSize: responsive.fontSize.xl,
    color: "#00FF66",
    fontFamily: "VT323_400Regular",
    textAlign: "center",
    fontWeight: "bold",
  },
  orderCard: {
    width: "100%",
    maxWidth: responsive.isMobile ? 320 : responsive.isTablet ? 400 : 450,
    borderWidth: 2,
    borderColor: "#00FF66",
    backgroundColor: "black",
    padding: 16,
    marginBottom: responsive.margin.lg,
    shadowColor: "#00FF66",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  cardTitle: {
    fontSize: responsive.fontSize.lg,
    color: "#00FF66",
    fontFamily: "VT323_400Regular",
    textAlign: "center",
    marginBottom: 12,
    textShadowColor: "#00aa44",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: responsive.fontSize.lg,
    color: "#00FF66",
    fontFamily: "VT323_400Regular",
    flex: 1,
  },
  detailValue: {
    fontSize: responsive.fontSize.lg,
    color: "#00FF66",
    fontFamily: "VT323_400Regular",
    flex: 2,
    textAlign: "right",
  },
  smsNotification: {
    marginTop: 12,
    padding: 8,
    backgroundColor: "#001a00",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#00aa44",
  },
  smsText: {
    fontSize: responsive.fontSize.md,
    color: "#00FF66",
    fontFamily: "VT323_400Regular",
    textAlign: "center",
  },
  menuBox: {
    width: "100%",
    maxWidth: responsive.isMobile ? 320 : responsive.isTablet ? 400 : 450,
    alignItems: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: responsive.margin.sm,
    gap: responsive.margin.sm,
  },
  menuButton: {
    borderWidth: 2,
    borderColor: "#00FF66",
    paddingVertical: responsive.padding.sm,
    paddingHorizontal: responsive.padding.md,
    flex: 1,
    alignItems: "center",
    backgroundColor: "black",
    minHeight: 40,
    justifyContent: "center",
  },
  menuText: {
    fontSize: responsive.isMobile ? responsive.fontSize.md : responsive.fontSize.lg,
    color: "#00FF66",
    fontFamily: "VT323_400Regular",
    textAlign: "center",
  },
});
