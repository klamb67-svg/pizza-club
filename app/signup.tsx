// app/signup.tsx
import { useFonts, VT323_400Regular } from "@expo-google-fonts/vt323";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import { supabase } from "../lib/supabase";

const green = "#00FF66";
const bg = "#001a00";

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

  if (!fontsLoaded) return null;

  const submit = async () => {
    console.log(`🚀 SIGNUP START: Username="${username}" First="${first}" Last="${last}"`);
    console.log(`📝 FORM DATA: Address="${address}" Phone="${phone}" Password="[HIDDEN]"`);

    if (!address.trim() || !phone.trim() || !password) {
      console.log(`❌ VALIDATION ERROR: Missing required fields`);
      Alert.alert("Missing info", "Please enter address, phone, and password.");
      return;
    }
    
    console.log(`⏳ SETTING SUBMITTING STATE: true`);
    setSubmitting(true);
    
    try {
      console.log(`🔍 STEP 1: Checking if username "${username}" is available`);
      console.log(`📡 SUPABASE CALL: .from("members").select("username").eq("username", "${username}").single()`);
      
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
        Alert.alert("Error", `Could not verify username availability: ${checkError.message}`);
        setSubmitting(false);
        return;
      }

      if (existingUser) {
        console.log(`❌ USERNAME TAKEN: Username "${username}" already exists`);
        Alert.alert("Username Taken", `Username "${username}" is already taken. Please try a different one.`);
        setSubmitting(false);
        return;
      }

      console.log(`✅ USERNAME AVAILABLE: Username "${username}" is free - proceeding with signup`);
      console.log(`🔍 STEP 2: Inserting new member into database`);
      console.log(`📡 SUPABASE CALL: .from("members").insert([...])`);

      // Username is available, proceed with insert
      const { data: insertData, error: insertError } = await supabase.from("members").insert([
        {
          first_name: String(first),
          last_name: String(last),
          username: String(username),
          address: address.trim(),
          phone: phone.trim(),
          password_hash: password, // TODO: hash with expo-crypto in a later step
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
        return;
      }

      console.log(`✅ SIGNUP SUCCESS: Member "${username}" created successfully`);
      console.log(`🧭 NAVIGATING: router.replace("/frontdoor", { username: "${username}" })`);
      
      Alert.alert("Success", `Welcome to Pizza Club ${username}`, [
        {
          text: "OK",
          onPress: () => {
            console.log(`🎉 SIGNUP COMPLETE: Routing to frontdoor`);
            router.replace({ pathname: "/frontdoor", params: { username } });
          },
        },
      ]);
    } catch (e: any) {
      console.log(`❌ UNEXPECTED ERROR:`, e);
      console.log(`❌ ERROR STACK:`, e.stack);
      Alert.alert("Error", `Unexpected error: ${e?.message ?? e}`);
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.title}>Welcome to Pizza Club {username}</Text>
      <Text style={styles.sub}>({first} {last})</Text>

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
      />

      <Text style={[styles.label, { marginTop: 12 }]}>Phone</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder="555-123-4567"
        placeholderTextColor="rgba(0,255,102,0.5)"
        keyboardType="phone-pad"
        underlineColorAndroid="transparent"
      />

      <Text style={[styles.label, { marginTop: 12 }]}>Password</Text>
      <TextInput
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

      <Pressable onPress={submit} style={styles.button} android_ripple={{ color: "rgba(0,255,102,0.25)" }} disabled={submitting}>
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
    textShadowColor: "#00aa44",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  sub: { textAlign: "center", color: green, fontSize: 18, fontFamily: "VT323_400Regular", opacity: 0.9, marginTop: 4 },
  label: { color: green, fontSize: 18, fontFamily: "VT323_400Regular" },
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
  buttonText: { color: green, fontSize: 26, fontFamily: "VT323_400Regular" },
});
