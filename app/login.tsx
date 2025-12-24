// app/login.tsx
import { useFonts, VT323_400Regular } from "@expo-google-fonts/vt323";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { adminAuth } from "../lib/adminAuth";
import { TERMINAL_COLORS, TERMINAL_TEXT_SHADOW } from "../constants/TerminalStyles";

const green = TERMINAL_COLORS.green;
const bg = TERMINAL_COLORS.bg;

export default function Login() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({ VT323_400Regular });

  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [memberData, setMemberData] = useState<{ id: string; username: string; password_hash: string; isAdmin?: boolean } | null>(null);
  const [blink, setBlink] = useState(true);
  const [kbOpen, setKbOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const nameInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const { height } = useWindowDimensions();

  // Clear form whenever this screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log("🔄 Login screen focused - clearing form");
      setFullName("");
      setPassword("");
      setShowPassword(false);
      setMemberData(null);
      setSubmitting(false);
      // Focus name input after clearing
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }, [])
  );

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

  const submitName = async () => {
    if (submitting) return;
    
    const parts = fullName.trim().split(/\s+/);
    if (parts.length < 2) {
      Alert.alert("Need first and last", "Please enter: First Last");
      return;
    }
    const first = parts[0];
    const last = parts.slice(1).join(" ");
    // Username format: first initial + last name, all lowercase
    // "robert paulson" -> "rpaulson"
    const username = `${first[0].toLowerCase()}${last.toLowerCase()}`;

    console.log(`🚀 LOGIN START: Input="${fullName}" → First="${first}" Last="${last}" Username="${username}"`);

    setSubmitting(true);
    try {
      console.log(`🔍 STEP 1: Testing Supabase connection and permissions`);
      
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
          setSubmitting(false);
          return;
        }
      }

      console.log(`🔍 STEP 2: Checking admin access for username "${username}"`);
      
      const adminUsername = await adminAuth.checkAdminAccess(username);
      if (adminUsername) {
        // Admin found - get password from admins table
        console.log(`✅ ADMIN DETECTED: "${adminUsername}" - requesting password`);
        
        const { data: adminData, error: adminError } = await supabase
          .from('admins')
          .select('username, password_hash')
          .eq('username', username)
          .single();
        
        if (adminData) {
          setMemberData({ id: 'admin', username: adminData.username, password_hash: adminData.password_hash, isAdmin: true });
          setShowPassword(true);
          setSubmitting(false);
          setTimeout(() => passwordInputRef.current?.focus(), 100);
          return;
        } else {
          console.log(`❌ ADMIN ERROR: Could not load admin password`);
          Alert.alert("Error", "Admin account error. Please contact support.");
          setSubmitting(false);
          return;
        }
      }
      
      console.log(`🔍 STEP 3: Querying Supabase for member username "${username}"`);
      
      const { data, error } = await supabase
        .from("members")
        .select("id, username, password_hash")
        .eq("username", username)
        .single();

      console.log(`📊 SUPABASE RESPONSE:`, { data, error });

      if (error) {
        console.log(`❌ SUPABASE ERROR: Code="${error.code}" Message="${error.message}"`);
        if (error.code === 'PGRST116') {
          console.log(`✅ NEW MEMBER PATH: No existing member found with username "${username}"`);
          setSubmitting(false);
          router.push({ pathname: "/signup", params: { first, last, username } });
          return;
        } else {
          console.log(`❌ DATABASE ERROR: ${error.code} - ${error.message}`);
          Alert.alert("Database Error", `Error ${error.code}: ${error.message}`);
          setSubmitting(false);
          return;
        }
      } else if (data) {
        // Member found - show password field
        console.log(`✅ EXISTING MEMBER: Found "${data.username}" - requesting password`);
        setMemberData(data);
        setShowPassword(true);
        setSubmitting(false);
        // Focus the password input after a brief delay
        setTimeout(() => passwordInputRef.current?.focus(), 100);
        return;
      } else {
        console.log("⚠️ UNEXPECTED: No data returned from query - routing to signup");
        setSubmitting(false);
        router.push({ pathname: "/signup", params: { first, last, username } });
        return;
      }
    } catch (e: any) {
      console.log("❌ UNEXPECTED ERROR during login:", e);
      console.log("❌ ERROR STACK:", e.stack);
      
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
        Alert.alert("Error", `An unexpected error occurred: ${errorMessage}`);
      }
      setSubmitting(false);
    }
  };

  const submitPassword = () => {
    if (submitting || !memberData) return;

    console.log(`🔐 PASSWORD CHECK: Verifying password for "${memberData.username}"`);

    if (password === memberData.password_hash) {
      console.log(`✅ PASSWORD CORRECT: Logging in "${memberData.username}"`);
      
      // Check if this is an admin login
      if (memberData.isAdmin) {
        console.log(`🔑 ADMIN LOGIN: Setting admin session and routing to /admin`);
        adminAuth.setCurrentAdmin(memberData.username);
        router.replace('/admin');
      } else {
        console.log(`👤 MEMBER LOGIN: Routing to /frontdoor`);
        router.push({ pathname: "/frontdoor", params: { username: memberData.username } });
      }
    } else {
      console.log(`❌ PASSWORD INCORRECT for "${memberData.username}"`);
      Alert.alert("Wrong Password", "The password you entered is incorrect. Please try again.");
      setPassword("");
    }
  };

  const resetLogin = () => {
    setFullName("");
    setPassword("");
    setShowPassword(false);
    setMemberData(null);
    setTimeout(() => nameInputRef.current?.focus(), 100);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Pressable style={[styles.center, { paddingTop: topPad }]} onPress={() => showPassword ? passwordInputRef.current?.focus() : nameInputRef.current?.focus()}>
        <Text style={styles.title}>Who goes there?</Text>

        <View style={{ height: 32 }} />

        <Text style={styles.label}>Enter name</Text>
        <Text style={styles.sublabel}>(first last)</Text>

        <View style={{ height: 16 }} />

        <View style={styles.typeRow}>
          <Text style={styles.typed}>{fullName}</Text>
          {!showPassword && <View style={[styles.cursor, { opacity: blink ? 1 : 0 }]} />}
        </View>

        <View style={{ height: 24 }} />

        {!showPassword ? (
          <Pressable onPress={submitName} style={styles.button} android_ripple={{ color: "rgba(0,255,102,0.2)" }} disabled={submitting}>
            <Text style={styles.buttonText}>{submitting ? "CHECKING..." : "<ENTER>"}</Text>
          </Pressable>
        ) : (
          <>
            <Text style={styles.label}>Enter password</Text>

            <View style={{ height: 16 }} />

            <View style={styles.typeRow}>
              <Text style={styles.typed}>{"•".repeat(password.length)}</Text>
              <View style={[styles.cursor, { opacity: blink ? 1 : 0 }]} />
            </View>

            <View style={{ height: 24 }} />

            <Pressable onPress={submitPassword} style={styles.button} android_ripple={{ color: "rgba(0,255,102,0.2)" }} disabled={submitting}>
              <Text style={styles.buttonText}>{submitting ? "CHECKING..." : "<SUBMIT>"}</Text>
            </Pressable>

            <View style={{ height: 16 }} />

            <Pressable onPress={resetLogin} style={styles.linkButton}>
              <Text style={styles.linkText}>[ Not you? Go back ]</Text>
            </Pressable>
          </>
        )}
      </Pressable>

      {/* Hidden name input */}
      <TextInput
        ref={nameInputRef}
        style={styles.hidden}
        value={fullName}
        onChangeText={setFullName}
        autoFocus={!showPassword}
        caretHidden
        selectionColor="transparent"
        underlineColorAndroid="transparent"
        autoCorrect={false}
        autoCapitalize="words"
        contextMenuHidden
        importantForAutofill="no"
        returnKeyType="done"
        blurOnSubmit={false}
        onSubmitEditing={submitName}
        editable={!showPassword}
        // Web autofill prevention
        {...(Platform.OS === 'web' && {
          autoComplete: 'off',
          name: 'pizzaclub-name',
          id: 'pizzaclub-name-input',
        })}
        // iOS autofill prevention
        {...(Platform.OS === 'ios' && {
          textContentType: 'none',
        })}
      />

      {/* Hidden password input */}
      <TextInput
        ref={passwordInputRef}
        style={styles.hidden}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        caretHidden
        selectionColor="transparent"
        underlineColorAndroid="transparent"
        autoCorrect={false}
        autoCapitalize="none"
        contextMenuHidden
        importantForAutofill="no"
        returnKeyType="done"
        blurOnSubmit={false}
        onSubmitEditing={submitPassword}
        // Web autofill prevention - using "new-password" is a common trick to prevent autofill
        {...(Platform.OS === 'web' && {
          autoComplete: 'new-password',
          name: 'pizzaclub-password',
          id: 'pizzaclub-password-input',
        })}
        // iOS autofill prevention
        {...(Platform.OS === 'ios' && {
          textContentType: 'none',
        })}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: bg, paddingHorizontal: 20 },
  center: { flex: 1, alignItems: "center" },
  
  // Main heading - largest
  title: {
    fontFamily: "VT323_400Regular",
    fontSize: 36,
    color: green,
    textAlign: "center",
    ...TERMINAL_TEXT_SHADOW,
  },
  
  // Labels - medium
  label: { 
    fontFamily: "VT323_400Regular", 
    fontSize: 24, 
    color: green,
    ...TERMINAL_TEXT_SHADOW,
  },
  
  // Sublabels/hints - small
  sublabel: { 
    fontFamily: "VT323_400Regular", 
    fontSize: 18, 
    color: green, 
    opacity: 0.7,
    marginTop: 4,
    ...TERMINAL_TEXT_SHADOW,
  },

  // User input display - medium-large
  typeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 32,
  },
  typed: {
    fontFamily: "VT323_400Regular",
    fontSize: 26,
    lineHeight: 30,
    color: green,
    textAlign: "center",
    ...TERMINAL_TEXT_SHADOW,
  },
  cursor: {
    width: 10,
    height: 22,
    marginLeft: 6,
    backgroundColor: green,
    borderRadius: 1,
  },

  // Buttons - medium
  button: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderWidth: 2,
    borderColor: green,
    backgroundColor: "rgba(0,255,102,0.10)",
    borderRadius: 4,
  },
  buttonText: { 
    fontFamily: "VT323_400Regular", 
    fontSize: 24, 
    color: green,
    ...TERMINAL_TEXT_SHADOW,
  },

  // Links - small
  linkButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  linkText: {
    fontFamily: "VT323_400Regular",
    fontSize: 18,
    color: green,
    opacity: 0.7,
    ...TERMINAL_TEXT_SHADOW,
  },

  hidden: {
    position: "absolute",
    top: -5000,
    left: -5000,
    width: 1,
    height: 1,
    opacity: 0,
  },
});