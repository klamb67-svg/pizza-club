import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

const green = "#00FF66";
const bg = "#001a00";
const darkGray = "#1a1a1a";

interface Pizza {
  id: string;
  name: string;
  image_url: string;
  is_active: boolean;
  preparation_time: number;
  created_at: string;
}

export default function Menu() {
  const [menuItems, setMenuItems] = useState<Pizza[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pizzas')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error loading pizzas:', error);
        Alert.alert('Error', 'Failed to load menu items');
        return;
      }

      setMenuItems(data || []);
    } catch (error) {
      console.error('Error in loadMenuItems:', error);
      Alert.alert('Error', 'Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('pizzas')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) {
        console.error('Error toggling availability:', error);
        Alert.alert('Error', 'Failed to update availability');
        return;
      }

      // Update local state
      setMenuItems(menuItems.map(item =>
        item.id === id ? { ...item, is_active: !currentStatus } : item
      ));

      Alert.alert(
        'Success',
        `${!currentStatus ? 'Pizza is now IN STOCK' : 'Pizza is now OUT OF STOCK'}`
      );
    } catch (error) {
      console.error('Error in toggleAvailability:', error);
      Alert.alert('Error', 'Failed to update availability');
    }
  };

  const renderMenuItem = ({ item }: { item: Pizza }) => (
    <View style={[styles.menuCard, !item.is_active && styles.unavailableCard]}>
      <Image source={{ uri: item.image_url }} style={styles.menuImage} />
      <View style={styles.menuInfo}>
        <View style={styles.menuHeader}>
          <Text style={[styles.menuName, !item.is_active && styles.unavailableText]}>
            {item.name}
          </Text>
          <TouchableOpacity
            style={[styles.availabilityButton, { 
              backgroundColor: item.is_active ? green : '#FF4444' 
            }]}
            onPress={() => toggleAvailability(item.id, item.is_active)}
          >
            <Text style={styles.availabilityText}>
              {item.is_active ? 'IN STOCK' : 'OUT OF STOCK'}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.menuDetail, !item.is_active && styles.unavailableText]}>
          Prep time: {item.preparation_time} min
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>MENU</Text>
          <Text style={styles.subtitle}>Pizza Management</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={green} />
          <Text style={styles.loadingText}>Loading pizzas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MENU</Text>
        <Text style={styles.subtitle}>Pizza Management</Text>
      </View>

      <View style={styles.instructionBox}>
        <Text style={styles.instructionText}>
          Tap the IN STOCK / OUT OF STOCK button to toggle availability
        </Text>
        <Text style={styles.instructionSubtext}>
          Out of stock pizzas will be grayed out for customers
        </Text>
      </View>

      <FlatList
        data={menuItems}
        renderItem={renderMenuItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.menuList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: bg,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: green,
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
    textAlign: 'center',
    opacity: 0.8,
    marginTop: 4,
  },
  instructionBox: {
    margin: 20,
    padding: 15,
    backgroundColor: darkGray,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: green,
  },
  instructionText: {
    color: green,
    fontSize: 14,
    fontFamily: 'VT323_400Regular',
    textAlign: 'center',
    marginBottom: 5,
  },
  instructionSubtext: {
    color: green,
    fontSize: 12,
    fontFamily: 'VT323_400Regular',
    textAlign: 'center',
    opacity: 0.7,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: green,
    fontSize: 16,
    fontFamily: 'VT323_400Regular',
    marginTop: 10,
  },
  menuList: {
    padding: 20,
  },
  menuCard: {
    backgroundColor: darkGray,
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: green,
    flexDirection: 'row',
  },
  unavailableCard: {
    opacity: 0.6,
    borderColor: '#666',
  },
  menuImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  menuInfo: {
    flex: 1,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuName: {
    color: green,
    fontSize: 20,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
    flex: 1,
  },
  unavailableText: {
    color: '#666',
  },
  menuDetail: {
    color: green,
    fontSize: 14,
    fontFamily: 'VT323_400Regular',
    opacity: 0.8,
  },
  availabilityButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  availabilityText: {
    color: bg,
    fontSize: 11,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
  },
});