import { router } from "expo-router";
import { Image, Pressable, SafeAreaView, StyleSheet } from "react-native";

export default function Home() {
  return (
    <SafeAreaView style={styles.container}>
      <Pressable
        onPress={() => router.push("/login")}
        accessibilityLabel="Enter Pizza Club"
      >
        <Image
          source={require("../../assets/images/pizza.png")}
          style={styles.pizza}
        />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  pizza: {
    width: 220,
    height: 220,
    resizeMode: "contain",
  },
});
