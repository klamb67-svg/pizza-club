// app/contact.tsx
import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import BottomNav from '../components/BottomNav';

const green = "#00FF66";
const bg = "#001a00";
const darkGray = "#1a1a1a";

export default function Contact() {
  const { username } = useLocalSearchParams<{ username?: string }>();

  const handleEmailPress = async () => {
    const email = 'info@pizzadojo2go.com';
    const subject = 'Pizza Dojo Inquiry';
    const body = 'Hello Pizza Dojo team,\n\n';
    
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Email client not available');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open email client');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>CONTACT</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EMAIL</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.emailButton} onPress={handleEmailPress}>
              <Text style={styles.emailText}>info@pizzadojo2go.com</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>HOURS</Text>
          <View style={styles.card}>
            <Text style={styles.hoursText}>Friday & Saturday</Text>
            <Text style={styles.hoursText}>5:15 PM - 7:30 PM</Text>
          </View>
        </View>
      </ScrollView>
      <BottomNav currentPage="contact" username={username} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: bg,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
    alignItems: 'center',
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    color: green,
    fontSize: 32,
    fontFamily: 'VT323_400Regular',
    textAlign: 'center',
  },
  section: {
    marginBottom: 25,
    alignItems: 'center',
  },
  sectionTitle: {
    color: green,
    fontSize: 20,
    fontFamily: 'VT323_400Regular',
    marginBottom: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  card: {
    backgroundColor: darkGray,
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: green,
    shadowColor: green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    alignItems: 'center',
    alignSelf: 'center',
  },
  emailButton: {
    backgroundColor: 'rgba(0, 255, 102, 0.1)',
    borderWidth: 1,
    borderColor: green,
    padding: 12,
    borderRadius: 4,
  },
  emailText: {
    color: green,
    fontSize: 18,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  hoursText: {
    color: green,
    fontSize: 18,
    fontFamily: 'VT323_400Regular',
    textAlign: 'center',
    marginBottom: 8,
  },
});