import React from "react";
import { SafeAreaView, StyleSheet, Text } from "react-native";

const green = "#00FF66";
const bg = "#001a00";

export default function Main() {
  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.title}>[ Main Menu Placeholder ]</Text>
      <Text style={styles.sub}>This is where the app content lives.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: bg, alignItems: "center", justifyContent: "center" },
  title: { color: green, fontSize: 28, fontFamily: "VT323_400Regular" },
  sub: { color: green, fontSize: 18, fontFamily: "VT323_400Regular", opacity: 0.9, marginTop: 8 },
});
