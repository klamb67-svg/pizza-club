// app/signup.tsx
import { useFonts, VT323_400Regular } from "@expo-google-fonts/vt323";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import { supabase } from "../lib/supabase";
import { TERMINAL_COLORS, TERMINAL_TEXT_SHADOW } from "../constants/TerminalStyles";

const green = TERMINAL_COLORS.green;
const bg = TERMINAL_COLORS.bg;

export default function Signup() {
  const router = useRouter();
  const { first = "", last = "", username = "" } = useLocalSearchParams<{
    first: string;
    last: string;
    username: string;
  }>();

  const [fontsLoaded] = useFonts({ VT323_400Regular });
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // Refs for field navigation
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  
  // Ref to prevent double submission
  const isSubmittingRef = useRef(false);

  // Show loading state instead of returning null - this ensures elements are always in DOM
  if (!fontsLoaded) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={[styles.label, { opacity: 0.5 }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const submit = async () => {
    // Prevent double submission using ref (immediate check)
    if (isSubmittingRef.current) {
      console.log(`⚠️ BLOCKED: Submit already in progress`);
      return;
    }
    isSubmittingRef.current = true;
    
    if (!username || !first || !last) {
      console.log(
        `❌ SIGNUP PARAM ERROR: Missing core identity fields`,
        { first, last, username }
      );
      Alert.alert(
        "Missing member info",
        "Please start from the login screen and enter your name again."
      );
      isSubmittingRef.current = false;
      return;
    }

    console.log(`🚀 SIGNUP START: Username="${username}" First="${first}" Last="${last}"`);
    console.log(`📝 FORM DATA: Address="${address}" Phone="${phone}" Password="[HIDDEN]"`);

    if (!address.trim() || !phone.trim() || !password) {
      console.log(`❌ VALIDATION ERROR: Missing required fields`);
      Alert.alert("Missing info", "Please enter address, phone, and password.");
      isSubmittingRef.current = false;
      return;
    }
    
    console.log(`⏳ SETTING SUBMITTING STATE: true`);
    setSubmitting(true);
    
    try {
      console.log(`🔍 STEP 1: Checking if username "${username}" is available`);
      
      // First, check if username already exists
      const { data: existingUser, error: checkError } = await supabase
        .from("members")
        .select("username")
        .eq("username", String(username))
        .single();

      console.log(`📊 USERNAME CHECK RESPONSE:`, { existingUser, checkError });

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 means no rows found (username is available)
        console.log(`❌ USERNAME CHECK ERROR: Code="${checkError.code}" Message="${checkError.message}"`);
        
        // Check for RLS or network errors
        const errorMessage = checkError.message || String(checkError);
        if (errorMessage.includes('permission denied') || 
            errorMessage.includes('row-level security') ||
            errorMessage.includes('42501') ||
            errorMessage.includes('Network request failed')) {
          Alert.alert(
            "Permission Error", 
            "Cannot check username availability. This may be a database permissions issue. Please contact support or try again."
          );
        } else {
          Alert.alert("Error", `Could not verify username availability: ${errorMessage}`);
        }
        setSubmitting(false);
        isSubmittingRef.current = false;
        return;
      }

      if (existingUser) {
        console.log(`❌ USERNAME TAKEN: Username "${username}" already exists`);
        Alert.alert("Username Taken", `Username "${username}" is already taken. Please try a different one.`);
        setSubmitting(false);
        isSubmittingRef.current = false;
        return;
      }

      console.log(`✅ USERNAME AVAILABLE: Username "${username}" is free - proceeding with signup`);
      console.log(`🔍 STEP 2: Inserting new member into database`);

      // Username is available, proceed with insert
      const { data: insertData, error: insertError } = await supabase.from("members").insert([
        {
          first_name: String(first),
          last_name: String(last),
          username: String(username),
          address: address.trim(),
          phone: phone.trim(),
          password_hash: password,
        },
      ]).select();

      console.log(`📊 INSERT RESPONSE:`, { insertData, insertError });

      if (insertError) {
        console.log(`❌ INSERT ERROR: Code="${insertError.code}" Message="${insertError.message}"`);
        if (insertError.code === '23505' && insertError.message.includes('username')) {
          Alert.alert("Username Taken", `Username "${username}" is already taken. Please try a different one.`);
        } else if (insertError.code === '42501') {
          console.log(`🚨 RLS POLICY ERROR: Row Level Security is blocking the insert`);
          Alert.alert("Permission Error", "Cannot create new member. Please check database permissions or contact administrator.");
        } else {
          Alert.alert("Error", `Could not save membership: ${insertError.message}`);
        }
        setSubmitting(false);
        isSubmittingRef.current = false;
        return;
      }

      console.log(`✅ SIGNUP SUCCESS: Member "${username}" created successfully`);
      console.log(`🧭 NAVIGATING to frontdoor`);
      
      // Navigate directly - no Alert on success
      setSubmitting(false);
      isSubmittingRef.current = false;
      router.replace({ pathname: "/frontdoor", params: { username } });
      
    } catch (e: any) {
      console.log(`❌ UNEXPECTED ERROR:`, e);
      console.log(`❌ ERROR STACK:`, e.stack);
      
      // Handle network errors specifically
      const errorMessage = e?.message || String(e);
      if (errorMessage.includes('Network request failed') || 
          errorMessage.includes('fetch failed') ||
          errorMessage.includes('ECONNREFUSED') ||
          errorMessage.includes('network')) {
        Alert.alert(
          "Network Error", 
          `Unable to connect to server. Please check:\n\n• Your device and computer are on the same Wi-Fi network\n• Your internet connection is working\n• The Supabase service is accessible\n\nError: ${errorMessage}`
        );
      } else {
        Alert.alert("Error", `Unexpected error: ${errorMessage}`);
      }
      setSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.title}>Welcome to Pizza Club</Text>
      <Text style={styles.sub}>{first} {last}</Text>

      <View style={{ height: 20 }} />

      <Text style={styles.label}>Address</Text>
      <TextInput
        style={styles.input}
        value={address}
        onChangeText={setAddress}
        placeholder="123 Main St"
        placeholderTextColor="rgba(0,255,102,0.5)"
        autoCapitalize="words"
        underlineColorAndroid="transparent"
        returnKeyType="next"
        onSubmitEditing={() => phoneRef.current?.focus()}
      />

      <Text style={[styles.label, { marginTop: 12 }]}>Phone</Text>
      <TextInput
        ref={phoneRef}
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder="555-123-4567"
        placeholderTextColor="rgba(0,255,102,0.5)"
        keyboardType="phone-pad"
        underlineColorAndroid="transparent"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />

      <Text style={[styles.label, { marginTop: 12 }]}>Password</Text>
      <TextInput
        ref={passwordRef}
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••"
        placeholderTextColor="rgba(0,255,102,0.5)"
        secureTextEntry
        underlineColorAndroid="transparent"
        returnKeyType="done"
        onSubmitEditing={submit}
      />

      <View style={{ height: 18 }} />

      <Pressable 
        onPress={submit} 
        style={styles.button} 
        android_ripple={{ color: "rgba(0,255,102,0.25)" }} 
        disabled={submitting}
        testID="signup-submit"
      >
        <Text style={styles.buttonText}>{submitting ? "SAVING..." : "<ENTER>"}</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: bg, padding: 20, alignItems: "stretch" },
  title: {
    textAlign: "center",
    marginTop: 16,
    color: green,
    fontSize: 30,
    fontFamily: "VT323_400Regular",
    ...TERMINAL_TEXT_SHADOW,
  },
  sub: { 
    textAlign: "center", 
    color: green, 
    fontSize: 18, 
    fontFamily: "VT323_400Regular", 
    opacity: 0.9, 
    marginTop: 4,
    ...TERMINAL_TEXT_SHADOW,
  },
  label: { 
    color: green, 
    fontSize: 18, 
    fontFamily: "VT323_400Regular",
    ...TERMINAL_TEXT_SHADOW,
  },
  input: {
    borderWidth: 1,
    borderColor: green,
    color: green,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 20,
    fontFamily: "VT323_400Regular",
    backgroundColor: "rgba(0,255,102,0.06)",
    borderRadius: 4,
  },
  button: {
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderWidth: 1,
    borderColor: green,
    backgroundColor: "rgba(0,255,102,0.12)",
    borderRadius: 4,
  },
  buttonText: { 
    color: green, 
    fontSize: 26, 
    fontFamily: "VT323_400Regular",
    ...TERMINAL_TEXT_SHADOW,
  },
});