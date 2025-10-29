// app/about.tsx
import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';

const green = "#00FF66";
const bg = "#001a00";
const darkGray = "#1a1a1a";

export default function About() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>ABOUT</Text>
          <Text style={styles.subtitle}>The Pizza Dojo Story</Text>
        </View>

        <View style={styles.storyCard}>
          <Text style={styles.storyTitle}>THE LEGEND BEGINS...</Text>
          
          <Text style={styles.storyText}>
            In the neon-lit streets of the digital underground, where code warriors and pizza enthusiasts collide, 
            a legend was born. Pizza Dojo emerged from the shadows, a secret society dedicated to the ancient art 
            of perfect pizza crafting.
          </Text>

          <Text style={styles.storyText}>
            Our founder, Master Chef Robert Paulson, discovered the sacred scrolls of pizza wisdom hidden deep 
            within the terminal archives. These ancient texts revealed the secret techniques of dough mastery, 
            sauce alchemy, and the perfect cheese-to-crust ratio that had been lost to time.
          </Text>

          <Text style={styles.storyText}>
            The Dojo operates in the shadows, opening its doors only on Friday and Saturday nights when the 
            moon is full and the code is clean. Our members are chosen not by birthright, but by their 
            dedication to the craft and their ability to appreciate the subtle art of perfectly timed pizza delivery.
          </Text>

          <Text style={styles.storyText}>
            Each pizza is crafted with the precision of a master coder debugging legacy systems, using only 
            the finest ingredients sourced from the digital realm. Our ovens burn with the fire of a thousand 
            failed builds, tempered by the wisdom of successful deployments.
          </Text>

          <Text style={styles.storyText}>
            Welcome to Pizza Dojo, where tradition meets innovation, and every slice tells a story of 
            dedication, craftsmanship, and the eternal quest for the perfect pizza.
          </Text>
        </View>

        <View style={styles.valuesCard}>
          <Text style={styles.valuesTitle}>OUR CODE OF HONOR</Text>
          
          <View style={styles.valueItem}>
            <Text style={styles.valueEmoji}>🥋</Text>
            <View style={styles.valueContent}>
              <Text style={styles.valueName}>DISCIPLINE</Text>
              <Text style={styles.valueDesc}>Every pizza is crafted with the precision of a master coder</Text>
            </View>
          </View>

          <View style={styles.valueItem}>
            <Text style={styles.valueEmoji}>🔥</Text>
            <View style={styles.valueContent}>
              <Text style={styles.valueName}>PASSION</Text>
              <Text style={styles.valueDesc}>We burn with the fire of a thousand failed builds</Text>
            </View>
          </View>

          <View style={styles.valueItem}>
            <Text style={styles.valueEmoji}>⚡</Text>
            <View style={styles.valueContent}>
              <Text style={styles.valueName}>SPEED</Text>
              <Text style={styles.valueDesc}>Fast delivery, optimized like the cleanest code</Text>
            </View>
          </View>

          <View style={styles.valueItem}>
            <Text style={styles.valueEmoji}>🎯</Text>
            <View style={styles.valueContent}>
              <Text style={styles.valueName}>PRECISION</Text>
              <Text style={styles.valueDesc}>Every ingredient measured with algorithmic accuracy</Text>
            </View>
          </View>
        </View>

        <View style={styles.techCard}>
          <Text style={styles.techTitle}>TECHNOLOGY STACK</Text>
          <Text style={styles.techText}>
            Built with React Native, powered by Supabase, and styled with the wisdom of ancient terminal aesthetics. 
            Our app runs on the same principles that guide our pizza making: clean architecture, efficient processes, 
            and user experience that feels like home.
          </Text>
          <Text style={styles.techNote}>
            🔧 TODO: Replace with real copy later
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            "In the Dojo, we don't just make pizza. We craft experiences."
          </Text>
          <Text style={styles.footerAuthor}>- Master Chef Robert Paulson</Text>
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
  storyCard: {
    backgroundColor: darkGray,
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: green,
    marginBottom: 20,
    shadowColor: green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  storyTitle: {
    color: green,
    fontSize: 20,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  storyText: {
    color: green,
    fontSize: 16,
    fontFamily: 'VT323_400Regular',
    lineHeight: 24,
    marginBottom: 15,
    opacity: 0.9,
  },
  valuesCard: {
    backgroundColor: darkGray,
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: green,
    marginBottom: 20,
    shadowColor: green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  valuesTitle: {
    color: green,
    fontSize: 20,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  valueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  valueEmoji: {
    fontSize: 24,
    marginRight: 15,
  },
  valueContent: {
    flex: 1,
  },
  valueName: {
    color: green,
    fontSize: 16,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  valueDesc: {
    color: green,
    fontSize: 14,
    fontFamily: 'VT323_400Regular',
    opacity: 0.8,
    lineHeight: 20,
  },
  techCard: {
    backgroundColor: darkGray,
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: green,
    marginBottom: 20,
    shadowColor: green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  techTitle: {
    color: green,
    fontSize: 20,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  techText: {
    color: green,
    fontSize: 16,
    fontFamily: 'VT323_400Regular',
    lineHeight: 24,
    marginBottom: 10,
    opacity: 0.9,
  },
  techNote: {
    color: '#FFA500',
    fontSize: 14,
    fontFamily: 'VT323_400Regular',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 255, 102, 0.1)',
    borderWidth: 1,
    borderColor: green,
    borderRadius: 8,
  },
  footerText: {
    color: green,
    fontSize: 16,
    fontFamily: 'VT323_400Regular',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  footerAuthor: {
    color: green,
    fontSize: 14,
    fontFamily: 'VT323_400Regular',
    opacity: 0.8,
  },
});

