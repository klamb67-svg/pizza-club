// app/login.tsx
import { useFonts, VT323_400Regular } from "@expo-google-fonts/vt323";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";

const green = "#00FF66";
const bg = "#001a00";

export default function Login() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({ VT323_400Regular });

  const [fullName, setFullName] = useState("");
  const [blink, setBlink] = useState(true);
  const [kbOpen, setKbOpen] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const { height } = useWindowDimensions();

  useEffect(() => {
    const id = setInterval(() => setBlink(b => !b), 650);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const s = Keyboard.addListener("keyboardDidShow", () => setKbOpen(true));
    const h = Keyboard.addListener("keyboardDidHide", () => setKbOpen(false));
    return () => { s.remove(); h.remove(); };
  }, []);

  if (!fontsLoaded) return null;

  const topPad = kbOpen ? Math.max(40, height * 0.10) : Math.max(60, height * 0.22);

  const submit = async () => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length < 2) {
      Alert.alert("Need first and last", "Please enter: First Last");
      return;
    }
    const first = parts[0];
    const last = parts.slice(1).join(" ");
    const username = `${first}${(last[0] || "").toUpperCase()}`;

    console.log(`🚀 LOGIN START: Input="${fullName}" → First="${first}" Last="${last}" Username="${username}"`);

    try {
      console.log(`🔍 STEP 1: Testing Supabase connection and permissions`);
      
      // First, test basic connection with a simple query
      console.log(`📡 TESTING CONNECTION: .from("members").select("*").limit(1)`);
      const { data: testData, error: testError } = await supabase
        .from("members")
        .select("*")
        .limit(1);
      
      console.log(`📊 CONNECTION TEST:`, { testData, testError });
      
      if (testError) {
        console.log(`❌ CONNECTION ERROR: Code="${testError.code}" Message="${testError.message}"`);
        if (testError.code === '42501' || testError.message.includes('permission')) {
          console.log(`🚨 RLS POLICY ISSUE: Permission denied - Row Level Security may be blocking access`);
          Alert.alert("Permission Error", "Database access denied. Please check RLS policies.");
          return;
        }
      }

      console.log(`🔍 STEP 2: Querying Supabase for username "${username}"`);
      console.log(`📡 SUPABASE CALL: .from("members").select("id, username").eq("username", "${username}").single()`);
      
      // Look up member by username (more reliable than first_name + last_name)
      const { data, error } = await supabase
        .from("members")
        .select("id, username")
        .eq("username", username)
        .single();

      console.log(`📊 SUPABASE RESPONSE:`, { data, error });

      if (error) {
        console.log(`❌ SUPABASE ERROR: Code="${error.code}" Message="${error.message}"`);
        if (error.code === 'PGRST116') {
          // No member found with this username - go to signup
          console.log(`✅ NEW MEMBER PATH: No existing member found with username "${username}"`);
          console.log(`🧭 NAVIGATING: router.push("/signup", { first: "${first}", last: "${last}", username: "${username}" })`);
          router.push({ pathname: "/signup", params: { first, last, username } });
        } else {
          // Other database error
          console.log(`❌ DATABASE ERROR: ${error.code} - ${error.message}`);
          Alert.alert("Database Error", `Error ${error.code}: ${error.message}`);
          return;
        }
      } else if (data) {
        // Member found - go to frontdoor
        console.log(`✅ EXISTING MEMBER PATH: Found member "${data.username}" with ID ${data.id}`);
        console.log(`🧭 NAVIGATING: router.push("/frontdoor", { username: "${data.username}" })`);
        router.push({ pathname: "/frontdoor", params: { username: data.username } });
      } else {
        // No data returned (shouldn't happen)
        console.log("⚠️ UNEXPECTED: No data returned from query - routing to signup");
        router.push({ pathname: "/signup", params: { first, last, username } });
      }
    } catch (e: any) {
      console.log("❌ UNEXPECTED ERROR during login:", e);
      console.log("❌ ERROR STACK:", e.stack);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Pressable style={[styles.center, { paddingTop: topPad }]} onPress={() => inputRef.current?.focus()}>
        <Text style={styles.title}>Who goes there?</Text>

        <View style={{ height: 24 }} />

        <Text style={styles.line1}>Enter name</Text>
        <Text style={styles.line2}>(first last)</Text>

        <View style={{ height: 14 }} />

        <View style={styles.typeRow}>
          <Text style={styles.typed}>{fullName}</Text>
          <View style={[styles.cursor, { opacity: blink ? 1 : 0 }]} />
        </View>

        <View style={{ height: 18 }} />

        <Pressable onPress={submit} style={styles.button} android_ripple={{ color: "rgba(0,255,102,0.2)" }}>
          <Text style={styles.buttonText}>&lt;ENTER&gt;</Text>
        </Pressable>
      </Pressable>

      <TextInput
        ref={inputRef}
        style={styles.hidden}
        value={fullName}
        onChangeText={setFullName}
        autoFocus
        caretHidden
        selectionColor="transparent"
        underlineColorAndroid="transparent"
        autoCorrect={false}
        autoCapitalize="words"
        contextMenuHidden
        importantForAutofill="no"
        returnKeyType="done"
        blurOnSubmit={false}
        onSubmitEditing={submit}
        onKeyPress={(e) => { if (e.nativeEvent.key === "Enter") submit(); }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: bg, paddingHorizontal: 20 },
  center: { flex: 1, alignItems: "center" },
  title: {
    fontFamily: "VT323_400Regular",
    fontSize: 38, // bumped from 34
    color: green,
    textAlign: "center",
    textShadowColor: "#00aa44",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  line1: { fontFamily: "VT323_400Regular", fontSize: 38, color: green },
  line2: { fontFamily: "VT323_400Regular", fontSize: 28, color: green, marginTop: 2 },

  typeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 34,
  },
  typed: {
    fontFamily: "VT323_400Regular",
    fontSize: 28,
    lineHeight: 32,
    color: green,
    textAlign: "center",
  },
  cursor: {
    width: 10,
    height: 20,
    marginLeft: 6,
    backgroundColor: green,
    borderRadius: 1,
  },

  button: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: green,
    backgroundColor: "rgba(0,255,102,0.10)",
  },
  buttonText: { fontFamily: "VT323_400Regular", fontSize: 28, color: green },

  hidden: {
    position: "absolute",
    top: -5000,
    left: -5000,
    width: 1,
    height: 1,
    opacity: 0,
  },
});
