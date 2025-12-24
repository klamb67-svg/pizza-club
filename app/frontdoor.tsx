import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Image, Pressable, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFonts, VT323_400Regular } from "@expo-google-fonts/vt323";
import { useResponsiveValues } from "../lib/responsive";
import { TERMINAL_COLORS, TERMINAL_TEXT_SHADOW } from "../constants/TerminalStyles";
import BottomNav from "../components/BottomNav";

const green = TERMINAL_COLORS.green;
const bg = TERMINAL_COLORS.bg;

// Helper function for loading state styles
const getLoadingStyles = () => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
});

export default function FrontDoor() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const [fontsLoaded] = useFonts({ VT323_400Regular });
  const responsive = useResponsiveValues();
  
  // 🔧 TODO: replace username check with Supabase role check
  const isAdmin = username === "RobertP";

  // Show loading state instead of returning null - ensures elements are always in DOM
  if (!fontsLoaded) {
    const loadingStyles = getLoadingStyles();
    return (
      <SafeAreaView style={loadingStyles.screen}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: green, fontFamily: "VT323_400Regular", opacity: 0.5 }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Guard against missing username - redirect to login if not present
  if (!username) {
    console.log("⚠️ FrontDoor: Missing username parameter - redirecting to login");
    router.replace("/login");
    return null;
  }

  const handleAdminPortal = () => {
    router.push("/admin");
  };

  const styles = createStyles(responsive);

  return (
    <SafeAreaView style={styles.screen}>
      <Pressable onPress={() => router.push({ pathname: "/menu", params: { username } })} style={styles.pressable}>
        <Image
          source={require("../assets/images/frontdoor.png")}
          style={styles.image}
        />
      </Pressable>
      <Text style={styles.hint}>(tap the door to enter)</Text>
      
      {isAdmin && (
        <TouchableOpacity 
          style={styles.adminButton} 
          onPress={handleAdminPortal}
          activeOpacity={0.8}
        >
          <Text style={styles.adminButtonText}>ADMIN PORTAL</Text>
        </TouchableOpacity>
      )}

      {/* Bottom Navigation */}
      <BottomNav currentPage="home" username={username} />
    </SafeAreaView>
  );
}

const createStyles = (responsive: any) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: responsive.padding.md,
  },
  pressable: {
    width: "100%",
    maxWidth: responsive.isMobile ? 400 : responsive.isTablet ? 500 : 600,
    height: responsive.isMobile ? "70%" : "80%",
    aspectRatio: 1,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  hint: {
    marginTop: responsive.margin.sm,
    color: green,
    fontFamily: "VT323_400Regular",
    fontSize: responsive.fontSize.lg,
    opacity: 0.8,
    textAlign: "center",
    ...TERMINAL_TEXT_SHADOW,
  },
  adminButton: {
    marginTop: responsive.margin.lg,
    paddingVertical: responsive.padding.md,
    paddingHorizontal: responsive.padding.xl,
    borderWidth: 2,
    borderColor: green,
    backgroundColor: bg,
    borderRadius: 4,
    shadowColor: green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
    minHeight: responsive.touchTarget,
  },
  adminButtonText: {
    color: green,
    fontFamily: "VT323_400Regular",
    fontSize: responsive.fontSize.xl,
    fontWeight: "bold",
    textAlign: "center",
    ...TERMINAL_TEXT_SHADOW,
  },
});
