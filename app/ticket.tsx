// app/ticket.tsx
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useResponsiveValues } from "../lib/responsive";


// Helper: Title Case for names
function toTitleCase(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ✅ Global counter map (per pizza type)
const ticketCounters: Record<string, number> = {};

export default function Ticket() {
  const router = useRouter();
  const [confirmed, setConfirmed] = useState(false);
  const responsive = useResponsiveValues();

  // ✅ pull data passed from menu (pizza, time, name, phone, date, pulocation)
  const params = useLocalSearchParams();
  const pizzaParam = Array.isArray(params.pizza) ? params.pizza[0] : params.pizza || "";
  const timeParam = Array.isArray(params.time) ? params.time[0] : params.time || "";
  const nameParam = Array.isArray(params.name) ? params.name[0] : params.name || "";
  const phoneParam = Array.isArray(params.phone) ? params.phone[0] : params.phone || "";
  const dateParam = Array.isArray(params.date) ? params.date[0] : params.date || "";
  const pulocationParam = Array.isArray(params.pulocation) ? params.pulocation[0] : params.pulocation || "";

  // Format pizza name → capitalized + " Pizza"
  const formattedPizza =
    pizzaParam ? (pizzaParam.charAt(0)?.toUpperCase() + pizzaParam.slice(1) + " Pizza") : "Pizza";

  // Format passenger name → Title Case with fallback
  const formattedName = nameParam ? toTitleCase(nameParam) : "Member";

  // Phone fallback
  const formattedPhone = phoneParam || "555-123-4567";

  // Date fallback
  const formattedDate = dateParam || "10/02/25";

  // Pickup location fallback
  const formattedPU = pulocationParam || "Pickup at 123 Main St";

  // --- Ticket Number logic ---
  const pizzaPrefix = formattedPizza.slice(0, 2).toUpperCase();
  if (!ticketCounters[pizzaPrefix]) {
    ticketCounters[pizzaPrefix] = 1;
  } else {
    ticketCounters[pizzaPrefix] += 1;
  }
  const ticketNumber = `${pizzaPrefix}${String(ticketCounters[pizzaPrefix]).padStart(3, "0")}`;

  const styles = createStyles(responsive);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>PIZZA CLUB EXPRESS</Text>
      </View>

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
          <Text style={styles.detailValue}>{timeParam} PM</Text>
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
        {!confirmed && (
          <>
            <Text style={styles.prompt}>Is your order correct?</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.yesButton]}
                onPress={() => setConfirmed(true)}
              >
                <Text style={styles.buttonText}>YES</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.noButton]}
                onPress={() => router.push("/menu")}
              >
                <Text style={styles.buttonText}>NO</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {confirmed && (
          <>
            <Text style={styles.prompt}>Submit your order?</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.yesButton]}
                onPress={() => router.push({
                  pathname: "/orderConfirmation",
                  params: {
                    name: nameParam,
                    pizza: formattedPizza,
                    time: timeParam,
                    date: formattedDate,
                    phone: phoneParam,
                  }
                })}
              >
                <Text style={styles.buttonText}>SUBMIT</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.noButton]}
                onPress={() => setConfirmed(false)}
              >
                <Text style={styles.buttonText}>BACK</Text>
              </TouchableOpacity>
            </View>
          </>
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
  subtitle: {
    fontSize: responsive.fontSize.lg,
    color: "#00FF66",
    fontFamily: "VT323_400Regular",
    textAlign: "center",
    opacity: 0.8,
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
});
