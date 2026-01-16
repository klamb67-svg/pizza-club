// app/about.tsx
import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import BottomNav from '../components/BottomNav';

const green = "#00FF66";
const bg = "#001a00";
const darkGray = "#1a1a1a";

export default function About() {
  const { username } = useLocalSearchParams<{ username?: string }>();
  
  const handleDonationLink = () => {
    Linking.openURL('https://www.amazon.com/hz/wishlist/ls/1LASTYI5W6HFO?ref_=wl_share');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>ABOUT US</Text>
        </View>

        <View style={styles.storyCard}>
          <Text style={styles.storyTitle}>THE PIZZA JOURNEY</Text>
          
          <Text style={styles.storyText}>
            My love affair with pizza started young - obsessed with the Tombstone pizzas my dad would bring home. 
            By high school, my career plan was simple: graduate and work at the Tombstone factory. As a teenager, 
            I landed at Pizza Hut back when they still made dough in store and the sausage was fresh not that 
            pre cooked sponge meat they serve now. The dream evolved, I wanted my own Pizza Hut franchise. Life 
            happens and the pizza fantasy was reduced to pizza night.
          </Text>

          <Text style={styles.storyText}>
            Pizza remained my favorite food, but it wasn't until much later in life that I began pursuing pizza 
            making as a serious hobby. My first attempt at Neapolitan pizza ended up stuck to the bottom of the 
            oven. Disappointed, I just went to bed.
          </Text>

          <Text style={styles.storyText}>
            Social media and YouTube recently reignited that passion - literally lighting a fire under me. I 
            started with an electric indoor pizza oven, then upgraded to a Gozney Dome, and eventually a Gozney S1. 
            Inspired by a Japanese man who opened his first pizza shop in his seventies, I began my own pizza 
            trailer journey.
          </Text>

          <Text style={styles.storyText}>
            This is Pizza Club - where craft meets community, one pizza at a time.
          </Text>
        </View>

        <View style={styles.rulesCard}>
          <Text style={styles.rulesTitle}>RULES OF PIZZA CLUB</Text>
          
          <View style={styles.ruleItem}>
            <Text style={styles.ruleNumber}>1.</Text>
            <Text style={styles.ruleText}>First rule of Pizza Club is you don't talk about Pizza Club</Text>
          </View>

          <View style={styles.ruleItem}>
            <Text style={styles.ruleNumber}>2.</Text>
            <Text style={styles.ruleText}>The second rule of Pizza Club is you don't talk about Pizza Club</Text>
          </View>

          <View style={styles.ruleItem}>
            <Text style={styles.ruleNumber}>3.</Text>
            <Text style={styles.ruleText}>One pizza per order</Text>
          </View>

          <View style={styles.ruleItem}>
            <Text style={styles.ruleNumber}>4.</Text>
            <Text style={styles.ruleText}>If the number of members exceeds available time slots, a lottery system will be implemented</Text>
          </View>

          <View style={styles.ruleItem}>
            <Text style={styles.ruleNumber}>5.</Text>
            <Text style={styles.ruleText}>No payments accepted - consider a donation: {' '}
              <TouchableOpacity onPress={handleDonationLink} style={styles.linkButton}>
                <Text style={styles.donationLink}>Amazon Wishlist</Text>
              </TouchableOpacity>
            </Text>
          </View>

          <View style={styles.ruleItem}>
            <Text style={styles.ruleNumber}>6.</Text>
            <Text style={styles.ruleText}>Failure to pick up pizza revokes membership</Text>
          </View>
        </View>

      </ScrollView>
      <BottomNav currentPage="about" username={username} />
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
  rulesCard: {
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
  rulesTitle: {
    color: green,
    fontSize: 20,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  ruleItem: {
    flexDirection: 'row',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  ruleNumber: {
    color: green,
    fontSize: 16,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
    marginRight: 10,
    minWidth: 20,
  },
  ruleText: {
    color: green,
    fontSize: 16,
    fontFamily: 'VT323_400Regular',
    lineHeight: 24,
    opacity: 0.9,
    flex: 1,
  },
  linkButton: {
    display: 'inline',
  },
  donationLink: {
    color: '#FFD700',
    fontSize: 16,
    fontFamily: 'VT323_400Regular',
    textDecorationLine: 'underline',
    lineHeight: 24,
  },
});