import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { adminAuth } from '../../lib/adminAuth';

// Get Supabase URL and anon key from environment or use fallback
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://bvmwcswddbepelgctybs.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_2-7AUXVus7corG_aVvM2gQ_uRqAuYoo';
// Fallback value matches .env file - Expo needs restart to pick up new EXPO_PUBLIC_ vars
const ADMIN_SECRET = process.env.EXPO_PUBLIC_ADMIN_SECRET || 'pc2k9mX7vN4qR8wL3jF6hT1bY5zA0dE9sK2pM8nQ4rU6vW0xZ3cB7jH1gF5tY9';

// Debug: Log environment variable loading
console.log('🔍 Admin Secret Debug:', {
  hasEnvVar: !!process.env.EXPO_PUBLIC_ADMIN_SECRET,
  envVarLength: process.env.EXPO_PUBLIC_ADMIN_SECRET?.length || 0,
  adminSecretLength: ADMIN_SECRET.length,
  adminSecretPresent: !!ADMIN_SECRET,
  usingFallback: !process.env.EXPO_PUBLIC_ADMIN_SECRET
});

const green = "#00FF66";
const bg = "#001a00";
const darkGray = "#1a1a1a";

// Generate time slots for 5:15-7:30 PM (15-minute increments)
const TIME_SLOTS = [
  "17:15", "17:30", "17:45",
  "18:00", "18:15", "18:30", "18:45",
  "19:00", "19:15", "19:30",
];

function formatTime12Hour(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

function getNextFridayAndSaturday(): { date: string; dayOfWeek: string }[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const results: { date: string; dayOfWeek: string }[] = [];
  
  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() + i);
    const dayOfWeek = checkDate.getDay();
    
    if (dayOfWeek === 5) {
      results.push({
        date: checkDate.toISOString().split('T')[0],
        dayOfWeek: 'Friday'
      });
    } else if (dayOfWeek === 6) {
      results.push({
        date: checkDate.toISOString().split('T')[0],
        dayOfWeek: 'Saturday'
      });
    }
  }
  
  results.sort((a, b) => a.date.localeCompare(b.date));
  return results;
}

interface SlotData {
  time: string;
  memberName?: string;
  pizzaName?: string;
  isLocked: boolean;
}

export default function Schedule() {
  const [fridaySlots, setFridaySlots] = useState<Map<string, SlotData>>(new Map());
  const [saturdaySlots, setSaturdaySlots] = useState<Map<string, SlotData>>(new Map());
  const [fridayDate, setFridayDate] = useState('');
  const [saturdayDate, setSaturdayDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    checkAdminAccess();
    loadScheduleData();
  }, []);

  const checkAdminAccess = async () => {
    const admin = adminAuth.getCurrentAdmin();
    if (!admin) {
      console.log('No admin access');
      return;
    }
  };

  const loadScheduleData = async () => {
    try {
      setLoading(true);
      
      // Get next Friday and Saturday
      const nights = getNextFridayAndSaturday();
      const friday = nights.find(n => n.dayOfWeek === 'Friday');
      const saturday = nights.find(n => n.dayOfWeek === 'Saturday');
      
      if (!friday || !saturday) {
        console.error('Could not find Friday or Saturday');
        return;
      }
      
      setFridayDate(friday.date);
      setSaturdayDate(saturday.date);
      
      // Load orders for both days
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          pickup_time,
          pickup_date,
          members!inner(first_name, last_name),
          pizzas!inner(name)
        `)
        .in('pickup_date', [friday.date, saturday.date])
        .not('status', 'eq', 'cancelled');
      
      if (ordersError) {
        console.error('Error loading orders:', ordersError);
      }
      
      // Load locked slots for both days
      const { data: lockedSlots, error: lockedError } = await supabase
        .from('locked_slots')
        .select('pickup_date, pickup_time')
        .in('pickup_date', [friday.date, saturday.date]);
      
      if (lockedError) {
        console.error('Error loading locked slots:', lockedError);
      }
      
      // Initialize slot maps
      const friSlots = new Map<string, SlotData>();
      const satSlots = new Map<string, SlotData>();
      
      TIME_SLOTS.forEach(time => {
        friSlots.set(time, { time, isLocked: false });
        satSlots.set(time, { time, isLocked: false });
      });
      
      // Mark locked slots
      lockedSlots?.forEach((slot: any) => {
        const timeShort = slot.pickup_time.substring(0, 5);
        if (slot.pickup_date === friday.date && friSlots.has(timeShort)) {
          const existing = friSlots.get(timeShort)!;
          friSlots.set(timeShort, { ...existing, isLocked: true });
        } else if (slot.pickup_date === saturday.date && satSlots.has(timeShort)) {
          const existing = satSlots.get(timeShort)!;
          satSlots.set(timeShort, { ...existing, isLocked: true });
        }
      });
      
      // Populate with orders
      orders?.forEach((order: any) => {
        const timeShort = order.pickup_time.substring(0, 5);
        const memberName = `${order.members.first_name} ${order.members.last_name}`;
        const pizzaName = order.pizzas.name;
        
        if (order.pickup_date === friday.date && friSlots.has(timeShort)) {
          const existing = friSlots.get(timeShort)!;
          friSlots.set(timeShort, {
            ...existing,
            memberName,
            pizzaName,
          });
        } else if (order.pickup_date === saturday.date && satSlots.has(timeShort)) {
          const existing = satSlots.get(timeShort)!;
          satSlots.set(timeShort, {
            ...existing,
            memberName,
            pizzaName,
          });
        }
      });
      
      setFridaySlots(friSlots);
      setSaturdaySlots(satSlots);
      
    } catch (error) {
      console.error('Error in loadScheduleData:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadScheduleData();
    setRefreshing(false);
  };

  const toggleLock = async (time: string, day: 'Friday' | 'Saturday') => {
    const date = day === 'Friday' ? fridayDate : saturdayDate;
    const slots = day === 'Friday' ? fridaySlots : saturdaySlots;
    const setSlots = day === 'Friday' ? setFridaySlots : setSaturdaySlots;
    const slot = slots.get(time);
    
    if (!slot) return;
    
    const newIsLocked = !slot.isLocked;
    
    // Get current admin username
    const admin = adminAuth.getCurrentAdmin();
    if (!admin) {
      console.error('No admin session found');
      return;
    }
    
    try {
      // Debug logging to see what's actually being sent
      console.log('Lock request debug:', {
        url: `${SUPABASE_URL}/functions/v1/lock-slot`,
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
          'x-admin-secret': ADMIN_SECRET ? '***' : 'MISSING',
        },
        anonKeyValue: SUPABASE_ANON_KEY,
        supabaseUrlValue: SUPABASE_URL
      });
      
      // Call Edge Function to lock/unlock slot
      const response = await fetch(`${SUPABASE_URL}/functions/v1/lock-slot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
          'x-admin-secret': ADMIN_SECRET,
        },
        body: JSON.stringify({
          adminUsername: admin.username,
          pickupDate: date,
          pickupTime: `${time}:00`,
          action: newIsLocked ? 'lock' : 'unlock'
        })
      });

      // Handle non-OK responses
      if (!response.ok) {
        let errorMessage = 'Unknown error';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        console.error('Error toggling lock:', errorMessage);
        console.error('Response status:', response.status);
        return;
      }

      const result = await response.json();

      if (!result.success) {
        console.error('Error toggling lock:', result.error || 'Unknown error');
        return;
      }
      
      // Update local state
      const newSlots = new Map(slots);
      newSlots.set(time, { ...slot, isLocked: newIsLocked });
      setSlots(newSlots);
      
    } catch (error) {
      console.error('Error toggling lock:', error);
    }
  };

  const renderSlot = (time: string, slot: SlotData | undefined, day: 'Friday' | 'Saturday') => {
    if (!slot) return null;
    
    const hasOrder = !!slot.memberName;
    const isLocked = slot.isLocked;
    
    return (
      <View
        key={`${day}-${time}`}
        style={[
          styles.timeSlot,
          hasOrder && styles.assignedSlot,
          isLocked && styles.lockedSlot,
        ]}
      >
        <View style={styles.slotHeader}>
          <Text style={[styles.slotTime, hasOrder && styles.assignedText]}>
            {formatTime12Hour(time)}
          </Text>
          <TouchableOpacity
            onPress={() => toggleLock(time, day)}
            style={styles.lockButton}
          >
            <Ionicons
              name={isLocked ? "lock-closed" : "lock-open-outline"}
              size={18}
              color={isLocked ? "#FF4444" : green}
            />
          </TouchableOpacity>
        </View>
        
        {hasOrder ? (
          <View style={styles.assignmentInfo}>
            <Text style={styles.assignmentName}>{slot.memberName}</Text>
            <Text style={styles.assignmentPizza}>{slot.pizzaName}</Text>
          </View>
        ) : (
          <Text style={[styles.availableText, isLocked && styles.lockedText]}>
            {isLocked ? 'LOCKED' : 'AVAILABLE'}
          </Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={green} />
          <Text style={styles.loadingText}>Loading schedule...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>WEEKEND SCHEDULE</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Ionicons name="refresh" size={24} color={green} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scheduleContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={green} />
        }
      >
        <View style={styles.weekendGrid}>
          {/* Friday Column */}
          <View style={styles.dayColumn}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayTitle}>FRIDAY</Text>
              <Text style={styles.dayDate}>
                {new Date(fridayDate + 'T12:00:00').toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })}
              </Text>
            </View>
            {TIME_SLOTS.map(time => renderSlot(time, fridaySlots.get(time), 'Friday'))}
          </View>

          {/* Saturday Column */}
          <View style={styles.dayColumn}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayTitle}>SATURDAY</Text>
              <Text style={styles.dayDate}>
                {new Date(saturdayDate + 'T12:00:00').toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })}
              </Text>
            </View>
            {TIME_SLOTS.map(time => renderSlot(time, saturdaySlots.get(time), 'Saturday'))}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: green,
    fontSize: 18,
    fontFamily: 'VT323_400Regular',
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: green,
  },
  title: {
    color: green,
    fontSize: 28,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
  },
  scheduleContainer: {
    flex: 1,
  },
  weekendGrid: {
    flexDirection: 'row',
    padding: 10,
    gap: 10,
  },
  dayColumn: {
    flex: 1,
  },
  dayHeader: {
    backgroundColor: darkGray,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: green,
    marginBottom: 10,
    alignItems: 'center',
  },
  dayTitle: {
    color: green,
    fontSize: 18,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
  },
  dayDate: {
    color: green,
    fontSize: 14,
    fontFamily: 'VT323_400Regular',
    opacity: 0.7,
    marginTop: 2,
  },
  timeSlot: {
    backgroundColor: darkGray,
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: green,
    minHeight: 85,
  },
  assignedSlot: {
    backgroundColor: green,
    borderColor: green,
  },
  lockedSlot: {
    borderColor: '#FF4444',
    opacity: 0.7,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  slotTime: {
    color: green,
    fontSize: 18,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
  },
  assignedText: {
    color: bg,
  },
  lockButton: {
    padding: 4,
  },
  assignmentInfo: {
    alignItems: 'flex-start',
  },
  assignmentName: {
    color: bg,
    fontSize: 18,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  assignmentPizza: {
    color: bg,
    fontSize: 16,
    fontFamily: 'VT323_400Regular',
    opacity: 0.9,
  },
  availableText: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'VT323_400Regular',
    textAlign: 'center',
  },
  lockedText: {
    color: '#FF4444',
  },
});