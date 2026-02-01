// app/index.tsx - Closure message page
import React from "react";
import {
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFonts, VT323_400Regular } from "@expo-google-fonts/vt323";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { useResponsiveValues } from "../lib/responsive";

const PINK = "#FF6B9D";
const GREEN = "#00FF41";
const WEBSITE_URL = "https://www.pizzadojo2go.com";
const INSTAGRAM_URL = "https://www.instagram.com/pizzadojo2go/";

const openLink = async (url: string) => {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  } else {
    await WebBrowser.openBrowserAsync(url, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      createTask: false,
    });
  }
};

export default function Index() {
  const [fontsLoaded] = useFonts({ VT323_400Regular });
  const responsive = useResponsiveValues();

  if (!fontsLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={[styles.loadingText, { color: GREEN }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const stylesWithResponsive = createStyles(responsive);

  return (
    <SafeAreaView style={styles.container}>
      {/* TOP CENTER */}
      <View style={styles.topSection}>
        <Text style={stylesWithResponsive.topText}>
          TYLER'S NOT HERE. TYLER WENT AWAY. TYLER'S GONE.
        </Text>
      </View>

      {/* CENTER MIDDLE */}
      <View style={styles.centerSection}>
        <Text style={stylesWithResponsive.centerText}>
          PIZZA CLUB IS CLOSED. TO LEARN MORE ABOUT PIZZA DOJO PLEASE VISIT{" "}
          <Text
            style={stylesWithResponsive.link}
            onPress={() => openLink(WEBSITE_URL)}
          >
            WWW.PIZZADOJO2GO.COM
          </Text>{" "}
          OR FOLLOW US ON INSTAGRAM
        </Text>
        <Pressable
          onPress={() => openLink(INSTAGRAM_URL)}
          style={({ pressed }) => [
            styles.instagramButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          accessibilityLabel="Follow Pizza Dojo on Instagram"
        >
          <Ionicons name="logo-instagram" size={36} color={GREEN} />
        </Pressable>
      </View>

      {/* BOTTOM CENTER */}
      <View style={styles.bottomSection}>
        <Text style={stylesWithResponsive.bottomText}>END OF LINE...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  topSection: {
    flex: 1,
    justifyContent: "flex-start",
    paddingTop: 40,
    alignItems: "center",
  },
  centerSection: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
    maxWidth: 400,
  },
  bottomSection: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 40,
    alignItems: "center",
  },
  instagramButton: {
    marginTop: 16,
    padding: 8,
  },
  loadingText: {
    fontFamily: "VT323_400Regular",
    fontSize: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

const createStyles = (responsive: ReturnType<typeof useResponsiveValues>) =>
  StyleSheet.create({
    topText: {
      color: PINK,
      fontStyle: "italic",
      fontSize: responsive.fontSize.xxxxl,
      textAlign: "center",
      paddingHorizontal: 16,
    },
    centerText: {
      color: GREEN,
      fontFamily: "VT323_400Regular",
      fontSize: responsive.fontSize.lg,
      textAlign: "center",
      lineHeight: responsive.fontSize.lg * 1.5,
    },
    link: {
      color: GREEN,
      textDecorationLine: "underline",
      fontFamily: "VT323_400Regular",
    },
    bottomText: {
      color: GREEN,
      fontFamily: "VT323_400Regular",
      fontSize: responsive.fontSize.xl,
      textAlign: "center",
    },
  });
