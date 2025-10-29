// app/orderConfirmation.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useResponsiveValues } from "../lib/responsive";
import { handleAccountNavigation } from "../lib/authUtils";

export default function OrderConfirmation() {
  const router = useRouter();
  const responsive = useResponsiveValues();
  
  // Get order data from navigation params
  const params = useLocalSearchParams();
  const name = Array.isArray(params.name) ? params.name[0] : params.name || "Member";
  const pizza = Array.isArray(params.pizza) ? params.pizza[0] : params.pizza || "Pizza";
  const time = Array.isArray(params.time) ? params.time[0] : params.time || "6:00 PM";
  const date = Array.isArray(params.date) ? params.date[0] : params.date || new Date().toLocaleDateString();
  const phone = Array.isArray(params.phone) ? params.phone[0] : params.phone || "555-123-4567";

  const styles = createStyles(responsive);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Message at top */}
      <Text style={styles.message}>✅ Your order has been placed!</Text>

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
