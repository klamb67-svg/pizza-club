// app/contact.tsx
import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';

const green = "#00FF66";
const bg = "#001a00";
const darkGray = "#1a1a1a";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

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

  const handleFormSubmit = () => {
    // 🔧 TODO: wire to email/service
    Alert.alert('Form Disabled', 'Contact form is not yet connected to email service');
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>CONTACT</Text>
          <Text style={styles.subtitle}>Get in Touch</Text>
        </View>

        <View style={styles.helpText}>
          <Text style={styles.helpTextContent}>
            Need help? Have questions? We're here to assist you with your pizza journey.
          </Text>
        </View>

        {/* Direct Email Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DIRECT CONTACT</Text>
          <View style={styles.card}>
            <Text style={styles.contactLabel}>Email us directly:</Text>
            <TouchableOpacity style={styles.emailButton} onPress={handleEmailPress}>
              <Text style={styles.emailText}>info@pizzadojo2go.com</Text>
            </TouchableOpacity>
            <Text style={styles.contactNote}>
              Tap the email above to open your email client
            </Text>
          </View>
        </View>

        {/* Contact Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SEND MESSAGE</Text>
          <View style={styles.card}>
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Name</Text>
              <TextInput
                style={styles.textInput}
                value={formData.name}
                onChangeText={(text) => updateFormData('name', text)}
                placeholder="Your name"
                placeholderTextColor="#666"
                editable={false} // 🔧 TODO: enable when form is wired
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                style={styles.textInput}
                value={formData.email}
                onChangeText={(text) => updateFormData('email', text)}
                placeholder="your@email.com"
                placeholderTextColor="#666"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={false} // 🔧 TODO: enable when form is wired
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Message</Text>
              <TextInput
                style={[styles.textInput, styles.messageInput]}
                value={formData.message}
                onChangeText={(text) => updateFormData('message', text)}
                placeholder="Your message here..."
                placeholderTextColor="#666"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                editable={false} // 🔧 TODO: enable when form is wired
              />
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, styles.disabledButton]} 
              onPress={handleFormSubmit}
              disabled={true}
            >
              <Text style={styles.submitButtonText}>SEND MESSAGE</Text>
            </TouchableOpacity>

            <Text style={styles.formNote}>
              🔧 TODO: Contact form will be connected to email service
            </Text>
          </View>
        </View>

        {/* Additional Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>HOURS & INFO</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Pizza Nights:</Text>
              <Text style={styles.infoValue}>Friday & Saturday</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Time:</Text>
              <Text style={styles.infoValue}>5:00 PM - 9:00 PM</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Response Time:</Text>
              <Text style={styles.infoValue}>Within 24 hours</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  subtitle: {
    color: green,
    fontSize: 18,
    fontFamily: 'VT323_400Regular',
    opacity: 0.8,
    marginTop: 4,
  },
  helpText: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: 'rgba(0, 255, 102, 0.1)',
    borderWidth: 1,
    borderColor: green,
    borderRadius: 4,
  },
  helpTextContent: {
    color: green,
    fontSize: 16,
    fontFamily: 'VT323_400Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    color: green,
    fontSize: 20,
    fontFamily: 'VT323_400Regular',
    marginBottom: 10,
    fontWeight: 'bold',
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
  },
  contactLabel: {
    color: green,
    fontSize: 16,
    fontFamily: 'VT323_400Regular',
    marginBottom: 10,
  },
  emailButton: {
    backgroundColor: 'rgba(0, 255, 102, 0.1)',
    borderWidth: 1,
    borderColor: green,
    padding: 12,
    borderRadius: 4,
    marginBottom: 10,
  },
  emailText: {
    color: green,
    fontSize: 18,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  contactNote: {
    color: '#999',
    fontSize: 14,
    fontFamily: 'VT323_400Regular',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  formField: {
    marginBottom: 15,
  },
  fieldLabel: {
    color: green,
    fontSize: 16,
    fontFamily: 'VT323_400Regular',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: bg,
    borderWidth: 1,
    borderColor: green,
    borderRadius: 4,
    padding: 12,
    color: green,
    fontSize: 16,
    fontFamily: 'VT323_400Regular',
  },
  messageInput: {
    height: 100,
  },
  submitButton: {
    backgroundColor: darkGray,
    borderWidth: 1,
    borderColor: green,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.5,
    borderColor: '#666',
  },
  submitButtonText: {
    color: green,
    fontSize: 18,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
  },
  formNote: {
    color: '#FFA500',
    fontSize: 14,
    fontFamily: 'VT323_400Regular',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoLabel: {
    color: green,
    fontSize: 16,
    fontFamily: 'VT323_400Regular',
    opacity: 0.8,
  },
  infoValue: {
    color: green,
    fontSize: 16,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
  },
});

