// app/index.tsx
import { Image, Pressable, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  return (
    <Pressable style={styles.container} android_ripple={null} onPress={() => {}}>
      <Pressable
        onPress={() => router.push("/login")}
        android_ripple={null}
        style={({ pressed }) => [
          styles.pressable,
          { opacity: pressed ? 0.9 : 1 },
        ]}
      >
        <Image
          source={{
            uri: "https://bvmwcswddbepelgctybs.supabase.co/storage/v1/object/public/pizza/PPizza1.png",
          }}
          style={styles.image}
        />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
  },
  pressable: {
    width: 300,
    height: 300,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: "contain",
  },
});
