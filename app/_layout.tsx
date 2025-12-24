import { Stack } from "expo-router";
import { useFonts, VT323_400Regular } from "@expo-google-fonts/vt323";
import { Platform } from "react-native";
import { useEffect } from "react";

export default function Layout() {
  const [fontsLoaded] = useFonts({ VT323_400Regular });

  // Load VT323 font for web via Google Fonts
  useEffect(() => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      // Add VT323 font from Google Fonts for web
      const link = document.createElement("link");
      link.href = "https://fonts.googleapis.com/css2?family=VT323&display=swap";
      link.rel = "stylesheet";
      document.head.appendChild(link);

      // Add IBM Plex Mono as fallback
      const link2 = document.createElement("link");
      link2.href = "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400&display=swap";
      link2.rel = "stylesheet";
      document.head.appendChild(link2);

      // Set global background and text color for web (font is handled by expo-google-fonts)
      const style = document.createElement("style");
      style.textContent = `
        body {
          background-color: #001a00;
          color: #00ff66;
          margin: 0;
          padding: 0;
        }
        #root {
          background-color: #001a00;
        }
      `;
      document.head.appendChild(style);

      return () => {
        document.head.removeChild(link);
        document.head.removeChild(link2);
        document.head.removeChild(style);
      };
    }
  }, []);

  if (!fontsLoaded && Platform.OS !== "web") {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
