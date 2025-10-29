import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Image, Pressable, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFonts, VT323_400Regular } from "@expo-google-fonts/vt323";
import { useResponsiveValues } from "../lib/responsive";
import { handleAccountNavigation } from "../lib/authUtils";

const green = "#00FF66";
const bg = "#001a00";

export default function FrontDoor() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const [fontsLoaded] = useFonts({ VT323_400Regular });
  const responsive = useResponsiveValues();
  
  // 🔧 TODO: replace username check with Supabase role check
  const isAdmin = username === "RobertP";

  if (!fontsLoaded) return null;

  const handleAdminPortal = () => {
    router.push("/admin/orders");
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
  },
  navContainer: {
    marginTop: responsive.margin.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: responsive.margin.sm,
    paddingHorizontal: responsive.padding.sm,
  },
  navButton: {
    paddingVertical: responsive.padding.sm,
    paddingHorizontal: responsive.padding.md,
    borderWidth: 1,
    borderColor: green,
    backgroundColor: bg,
    borderRadius: 4,
    minWidth: responsive.isMobile ? 70 : 80,
    minHeight: responsive.touchTarget,
    justifyContent: "center",
  },
  navButtonText: {
    color: green,
    fontFamily: "VT323_400Regular",
    fontSize: responsive.fontSize.sm,
    fontWeight: "bold",
    textAlign: "center",
  },
});
