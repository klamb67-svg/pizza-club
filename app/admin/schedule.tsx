import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { TimeSlot, Night } from '../../lib/supabaseTypes';
import { supabaseApi } from '../../lib/supabaseApi';

const green = "#00FF66";
const bg = "#001a00";
const darkGray = "#1a1a1a";

// Generate time slots for Friday/Saturday 5-9 PM (15-minute increments)
const generateTimeSlots = () => {
  const slots = [];
  const startHour = 17; // 5 PM
  const endHour = 21; // 9 PM
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      slots.push({
        id: `${hour}-${minute}`,
        time: displayTime,
        time24: timeString,
        day: 'Friday', // Will be duplicated for Saturday
      });
    }
  }
  return slots;
};

// 🔧 TODO: replace mock data with Supabase query
const sampleSchedule = [
  { id: 1, name: 'Kelli', pizza: 'Pepperoni', time: '6:15 PM', day: 'Friday', slotId: '18-15' },
  { id: 2, name: 'Nimix', pizza: 'Meatball', time: '7:00 PM', day: 'Friday', slotId: '19-0' },
  { id: 3, name: 'Alex', pizza: 'Margherita', time: '5:30 PM', day: 'Saturday', slotId: '17-30' },
  { id: 4, name: 'Sarah', pizza: 'Supreme', time: '8:45 PM', day: 'Saturday', slotId: '20-45' },
  { id: 5, name: 'Mike', pizza: 'Hawaiian', time: '6:45 PM', day: 'Friday', slotId: '18-45' },
];

type ScheduleEntry = {
  id: number;
  name: string;
  pizza: string;
  time: string;
  day: string;
  slotId: string;
};

// 🔧 TODO: Create proper TimeSlotWithOrder type when database schema is finalized
type TimeSlotWithOrder = {
  id: string;
  time: string;
  time24: string;
  day: string;
  // Additional fields for assignment display
  assigned_member_name?: string;
  assigned_pizza_name?: string;
};

export default function Schedule() {
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [selectedDay, setSelectedDay] = useState<'Friday' | 'Saturday'>('Friday');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlotWithOrder | null>(null);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔧 TODO: Add SUPABASE_URL and SUPABASE_ANON_KEY environment variables
  // 🔧 TODO: Add admin authentication check before loading schedule data
  useEffect(() => {
    loadScheduleData();
  }, []);

  const loadScheduleData = async () => {
    try {
      setLoading(true);
      // 🔧 TODO: Replace with real Supabase queries when environment variables are configured
      // const nights = await supabaseApi.nights.getActive();
      // const timeSlots = await supabaseApi.schedule.getByNight(nights[0]?.id || 1);
      // Process and set schedule data
      
      // Temporary fallback to mock data
      setSchedule(sampleSchedule);
    } catch (error) {
      console.error('Error loading schedule data:', error);
      // Fallback to mock data on error
      setSchedule(sampleSchedule);
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = generateTimeSlots();

  const getSlotAssignment = (slotId: string, day: string) => {
    return schedule.find(entry => entry.slotId === slotId && entry.day === day);
  };

  const assignToSlot = (slot: TimeSlotWithOrder) => {
    setSelectedSlot(slot);
    setIsAssignModalVisible(true);
  };

  const removeFromSlot = (slotId: string, day: string) => {
    Alert.alert(
      'Remove Assignment',
      'Are you sure you want to remove this assignment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            // 🔧 TODO: remove assignment from Supabase
            setSchedule(schedule.filter(entry => !(entry.slotId === slotId && entry.day === day)));
          },
        },
      ]
    );
  };

  const assignOrder = (memberName: string, pizzaType: string) => {
    if (!selectedSlot) return;

    // 🔧 TODO: assign order to slot in Supabase
    const newEntry: ScheduleEntry = {
      id: Date.now(),
      name: memberName,
      pizza: pizzaType,
      time: selectedSlot.time,
      day: selectedDay,
      slotId: selectedSlot.id,
    };
    setSchedule([...schedule, newEntry]);
    setIsAssignModalVisible(false);
    setSelectedSlot(null);
  };

  const renderTimeSlot = (slot: TimeSlotWithOrder) => {
    const assignment = getSlotAssignment(slot.id, selectedDay);
    const isAssigned = !!assignment;

    return (
      <TouchableOpacity
        key={`${selectedDay}-${slot.id}`}
        style={[
          styles.timeSlot,
          isAssigned && styles.assignedSlot,
        ]}
        onPress={() => isAssigned ? removeFromSlot(slot.id, selectedDay) : assignToSlot(slot)}
      >
        <Text style={[styles.slotTime, isAssigned && styles.assignedText]}>
          {slot.time}
        </Text>
        {isAssigned && (
          <View style={styles.assignmentInfo}>
            <Text style={styles.assignmentName}>{assignment.name}</Text>
            <Text style={styles.assignmentPizza}>{assignment.pizza}</Text>
          </View>
        )}
        {!isAssigned && (
          <Text style={styles.availableText}>AVAILABLE</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SCHEDULE</Text>
        <Text style={styles.subtitle}>Time Slot Management</Text>
      </View>

      <View style={styles.daySelector}>
        <TouchableOpacity
          style={[styles.dayButton, selectedDay === 'Friday' && styles.selectedDayButton]}
          onPress={() => setSelectedDay('Friday')}
        >
          <Text style={[styles.dayButtonText, selectedDay === 'Friday' && styles.selectedDayButtonText]}>
            FRIDAY
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.dayButton, selectedDay === 'Saturday' && styles.selectedDayButton]}
          onPress={() => setSelectedDay('Saturday')}
        >
          <Text style={[styles.dayButtonText, selectedDay === 'Saturday' && styles.selectedDayButtonText]}>
            SATURDAY
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scheduleContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.timeSlotsGrid}>
          {timeSlots.map(slot => renderTimeSlot(slot))}
        </View>
      </ScrollView>

      {/* Assignment Modal */}
      <Modal
        visible={isAssignModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAssignModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Assign to {selectedSlot?.time}</Text>
            <Text style={styles.modalSubtitle}>{selectedDay} - {selectedSlot?.time}</Text>
            
            <TouchableOpacity
              style={styles.quickAssignButton}
              onPress={() => assignOrder('Kelli', 'Pepperoni')}
            >
              <Text style={styles.quickAssignText}>Kelli - Pepperoni</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickAssignButton}
              onPress={() => assignOrder('Nimix', 'Meatball')}
            >
              <Text style={styles.quickAssignText}>Nimix - Meatball</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickAssignButton}
              onPress={() => assignOrder('Alex', 'Margherita')}
            >
              <Text style={styles.quickAssignText}>Alex - Margherita</Text>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#666' }]}
                onPress={() => setIsAssignModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>CANCEL</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  daySelector: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: darkGray,
    borderRadius: 8,
    padding: 4,
  },
  dayButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  selectedDayButton: {
    backgroundColor: green,
  },
  dayButtonText: {
    color: green,
    fontSize: 16,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
  },
  selectedDayButtonText: {
    color: bg,
  },
  scheduleContainer: {
    flex: 1,
    padding: 20,
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlot: {
    width: '48%',
    backgroundColor: darkGray,
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: green,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  assignedSlot: {
    backgroundColor: green,
    borderColor: green,
  },
  slotTime: {
    color: green,
    fontSize: 14,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  assignedText: {
    color: bg,
  },
  assignmentInfo: {
    alignItems: 'center',
  },
  assignmentName: {
    color: bg,
    fontSize: 12,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
  },
  assignmentPizza: {
    color: bg,
    fontSize: 10,
    fontFamily: 'VT323_400Regular',
    opacity: 0.8,
  },
  availableText: {
    color: '#666',
    fontSize: 10,
    fontFamily: 'VT323_400Regular',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: darkGray,
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: green,
    width: '80%',
  },
  modalTitle: {
    color: green,
    fontSize: 20,
    fontFamily: 'VT323_400Regular',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    color: green,
    fontSize: 14,
    fontFamily: 'VT323_400Regular',
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 20,
  },
  quickAssignButton: {
    backgroundColor: bg,
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: green,
    marginBottom: 10,
  },
  quickAssignText: {
    color: green,
    fontSize: 14,
    fontFamily: 'VT323_400Regular',
    textAlign: 'center',
  },
  modalButtons: {
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  modalButtonText: {
    color: bg,
    fontSize: 14,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
  },
});
