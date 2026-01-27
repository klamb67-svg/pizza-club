import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';
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

// KDS Order interface - matches actual database structure
interface KDSOrder {
  id: number;
  member_name: string;
  phone: string;
  pizza_name: string;
  time_slot: string;
  date: string;
  status: 'pending' | 'preparing' | 'ready' | 'picked_up' | 'cancelled';
  created_at: string;
  estimated_time: number;
  _pickup_date?: string; // Raw pickup date for day detection
  _pickup_time?: string; // Raw pickup time for sorting
}

export default function KitchenDisplaySystem() {
  const [orders, setOrders] = useState<KDSOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedView, setSelectedView] = useState<'pending' | 'preparing' | 'ready' | 'all'>('pending');

  useEffect(() => {
    // Lock orientation to landscape
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    
    checkAdminAccess();
    loadOrders();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('kds-orders')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('🔔 Real-time update:', payload.eventType);
          loadOrders(); // Reload orders on any change
        }
      )
      .subscribe();

    // Set up 30-second auto-refresh as backup
    const intervalId = setInterval(() => {
      console.log('🔄 Auto-refreshing KDS orders (30s interval)');
      loadOrders();
    }, 30000); // 30 seconds

    // Cleanup subscription and interval on unmount
    return () => {
      // Unlock orientation back to normal
      ScreenOrientation.unlockAsync();
      supabase.removeChannel(subscription);
      clearInterval(intervalId);
    };
  }, []);

  const checkAdminAccess = async () => {
    const admin = adminAuth.getCurrentAdmin();
    if (!admin) {
      Alert.alert('Access Denied', 'Admin access required');
      return;
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      console.log('🍕 Loading KDS orders from orders table...');
      
      // Query orders table with JOINs to get all related data
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          created_at,
          pickup_date,
          pickup_time,
          members!inner(first_name, last_name, phone),
          pizzas!inner(name, preparation_time)
        `)
        .not('status', 'eq', 'cancelled')
        .order('created_at', { ascending: false }); // Newest orders first
      
      if (error) {
        console.error('❌ Error loading KDS orders:', error);
        Alert.alert('Error', 'Failed to load orders');
        return;
      }
      
      // Transform database response to KDSOrder format
      const kdsOrders: KDSOrder[] = (data || [])
        .filter((order: any) => {
          // Filter out any orders that don't have required data
          return order && order.id && order.members && order.pizzas;
        })
        .map((order: any) => {
          // Format time from pickup_time (HH:MM:SS or HH:MM)
          let timeSlot = '6:00 PM'; // fallback
          if (order.pickup_time) {
            const timeStr = order.pickup_time;
            // Handle HH:MM:SS or HH:MM format
            const [hoursStr, minutesStr] = timeStr.split(':');
            if (hoursStr && minutesStr) {
              const hours = parseInt(hoursStr);
              const minutes = minutesStr.padStart(2, '0');
              const period = hours >= 12 ? 'PM' : 'AM';
              const displayHours = hours % 12 || 12;
              timeSlot = `${displayHours}:${minutes} ${period}`;
            }
          }
          
          // Format date from pickup_date (YYYY-MM-DD)
          let formattedDate = 'N/A'; // fallback
          if (order.pickup_date) {
            const dateObj = new Date(order.pickup_date + 'T12:00:00');
            formattedDate = dateObj.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'numeric',
              day: 'numeric'
            });
          }
          
          return {
            id: order.id,
            member_name: `${order.members?.first_name || ''} ${order.members?.last_name || ''}`.trim() || 'Unknown',
            phone: order.members?.phone || '',
            pizza_name: order.pizzas?.name || 'Unknown Pizza',
            time_slot: timeSlot,
            date: formattedDate,
            status: order.status,
            created_at: order.created_at,
            estimated_time: order.pizzas?.preparation_time || 15,
            // Store raw values for sorting
            _pickup_date: order.pickup_date || '',
            _pickup_time: order.pickup_time || ''
          };
        });
      
      // Sort orders: Friday first (earliest to latest), then Saturday (earliest to latest)
      kdsOrders.sort((a: any, b: any) => {
        // Get day of week: Friday = 5, Saturday = 6
        const getDayOfWeek = (dateStr: string): number => {
          if (!dateStr) return 99; // Put missing dates at end
          const date = new Date(dateStr + 'T12:00:00');
          return date.getDay(); // 0=Sunday, 5=Friday, 6=Saturday
        };
        
        // Parse time string (HH:MM:SS or HH:MM) to minutes for comparison
        const parseTimeToMinutes = (timeStr: string): number => {
          if (!timeStr) return 9999; // Put missing times at end
          const [hours, minutes] = timeStr.split(':').map(Number);
          return (hours || 0) * 60 + (minutes || 0);
        };
        
        const dayA = getDayOfWeek(a._pickup_date);
        const dayB = getDayOfWeek(b._pickup_date);
        
        // Priority 1: Friday (5) always comes before Saturday (6)
        if (dayA === 5 && dayB === 6) return -1;
        if (dayA === 6 && dayB === 5) return 1;
        
        // Priority 2: If same day of week (both Friday or both Saturday), sort by time
        if (dayA === dayB) {
          const timeA = parseTimeToMinutes(a._pickup_time);
          const timeB = parseTimeToMinutes(b._pickup_time);
          return timeA - timeB; // Earliest time first
        }
        
        // Priority 3: Any other days go after Friday/Saturday
        if (dayA === 5 || dayA === 6) return -1;
        if (dayB === 5 || dayB === 6) return 1;
        
        // Priority 4: For non-Fri/Sat days, sort by day then time
        if (dayA !== dayB) return dayA - dayB;
        const timeA = parseTimeToMinutes(a._pickup_time);
        const timeB = parseTimeToMinutes(b._pickup_time);
        return timeA - timeB;
      });
      
      // Debug: Log first few orders to verify sorting
      console.log('📋 KDS Orders sorted (first 5):');
      kdsOrders.slice(0, 5).forEach((order: any, idx: number) => {
        const date = new Date(order._pickup_date + 'T12:00:00');
        const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
        console.log(`  ${idx + 1}. Order #${order.id} - ${dayName} ${order._pickup_date} at ${order._pickup_time}`);
      });
      
      console.log('✅ Loaded KDS orders:', kdsOrders.length);
      setOrders(kdsOrders);
      
    } catch (error) {
      console.error('❌ Error loading KDS orders:', error);
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const updateOrderStatus = async (orderId: number, newStatus: KDSOrder['status']) => {
    try {
      console.log('🔄 Updating order status:', orderId, 'to', newStatus);
      
      // Update the orders table directly
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus
        })
        .eq('id', orderId);
      
      if (error) {
        console.error('❌ Status update failed:', error);
        Alert.alert('Error', 'Failed to update order status');
        return;
      }
      
      // Update local state immediately for snappy UI
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus }
          : order
      ));
      
      console.log('✅ Order status updated successfully');
      
    } catch (error) {
      console.error('❌ Status update error:', error);
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const deleteOrder = async (orderId: number) => {
    try {
      console.log('🗑️ Deleting order:', orderId);
      
      // Get current admin username
      const admin = adminAuth.getCurrentAdmin();
      if (!admin) {
        Alert.alert('Error', 'No admin session found');
        return;
      }
      
      // Call Edge Function to delete order
      const response = await fetch(`${SUPABASE_URL}/functions/v1/delete-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          adminUsername: admin.username,
          orderId: orderId,
          adminSecret: ADMIN_SECRET, // Moved to body to avoid CORS issues
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
        console.error('❌ Order deletion failed:', errorMessage);
        console.error('Response status:', response.status);
        Alert.alert('Error', `Failed to delete order: ${errorMessage}`);
        return;
      }

      const result = await response.json();

      if (!result.success) {
        console.error('❌ Order deletion failed:', result.error || 'Unknown error');
        Alert.alert('Error', result.error || 'Failed to delete order');
        return;
      }
      
      console.log('✅ Order deleted successfully');
      
      // Reload orders to ensure fresh data
      await loadOrders();
      
    } catch (error) {
      console.error('❌ Order deletion error:', error);
      Alert.alert('Error', 'Failed to delete order');
    }
  };

  const getStatusColor = (status: KDSOrder['status']) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'preparing': return '#00BFFF';
      case 'ready': return green;
      case 'picked_up': return '#888';
      case 'cancelled': return '#FF4444';
      default: return '#666';
    }
  };

  const getDayColor = (dateStr: string) => {
    if (!dateStr) return getStatusColor('pending'); // fallback
    const date = new Date(dateStr + 'T12:00:00');
    const dayOfWeek = date.getDay(); // 0=Sunday, 5=Friday, 6=Saturday
    if (dayOfWeek === 5) return '#00BFFF'; // Friday = Blue
    if (dayOfWeek === 6) return '#FF4444'; // Saturday = Red
    return getStatusColor('pending'); // fallback for other days
  };

  const getStatusIcon = (status: KDSOrder['status']) => {
    switch (status) {
      case 'pending': return 'time-outline';
      case 'preparing': return 'flame-outline';
      case 'ready': return 'checkmark-circle-outline';
      case 'picked_up': return 'bag-check-outline';
      case 'cancelled': return 'close-circle-outline';
      default: return 'help-outline';
    }
  };

  const getStatusLabel = (status: KDSOrder['status']) => {
    switch (status) {
      case 'pending': return 'PENDING';
      case 'preparing': return 'PREPARING';
      case 'ready': return 'READY';
      case 'picked_up': return 'PICKED UP';
      case 'cancelled': return 'CANCELLED';
      default: return status.toUpperCase();
    }
  };

  const filteredOrders = orders.filter(order => {
    if (selectedView === 'all') return true;
    return order.status === selectedView;
  });

  const renderOrderItem = ({ item }: { item: KDSOrder }) => {
    // Get day color (Friday=Blue, Saturday=Red) - use _pickup_date if available
    const dayColor = getDayColor(item._pickup_date || item.date);
    
    return (
    <View style={[styles.orderCard, { borderColor: dayColor }]}>
      <View style={styles.orderContent}>
        {/* Line 1: DATE and TIME with Status Badge and Delete Button */}
        <View style={styles.dateTimeRow}>
          <Text style={styles.dateTime}>{item.date} • {item.time_slot}</Text>
          <View style={styles.headerRight}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Ionicons 
                name={getStatusIcon(item.status)} 
                size={16} 
                color={bg} 
              />
              <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteOrder(item.id)}
            >
              <Ionicons name="trash" size={20} color="#FF4444" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Line 2: FIRST NAME LAST NAME */}
        <Text style={styles.memberName}>{item.member_name}</Text>
        
        {/* Line 3: PIZZA NAME */}
        <Text style={styles.pizzaName}>{item.pizza_name}</Text>
        
        {/* Line 4: PHONE NUMBER */}
        {item.phone ? <Text style={styles.phoneNumber}>{item.phone}</Text> : null}
      </View>
      
      <View style={styles.orderActions}>
        {item.status === 'pending' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.startButton]}
            onPress={() => updateOrderStatus(item.id, 'preparing')}
          >
            <Ionicons name="flame" size={16} color={bg} />
            <Text style={styles.actionButtonText}>START PREPARING</Text>
          </TouchableOpacity>
        )}
        
        {item.status === 'preparing' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.readyButton]}
            onPress={() => updateOrderStatus(item.id, 'ready')}
          >
            <Ionicons name="checkmark" size={16} color={bg} />
            <Text style={styles.actionButtonText}>MARK READY</Text>
          </TouchableOpacity>
        )}
        
        {item.status === 'ready' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.pickedUpButton]}
            onPress={() => updateOrderStatus(item.id, 'picked_up')}
          >
            <Ionicons name="bag-check" size={16} color={bg} />
            <Text style={styles.actionButtonText}>PICKED UP</Text>
          </TouchableOpacity>
        )}
        
        {item.status === 'picked_up' && (
          <View style={styles.completedContainer}>
            <Ionicons name="checkmark-done-circle" size={20} color="#888" />
            <Text style={styles.completedText}>ORDER COMPLETE</Text>
          </View>
        )}
      </View>
    </View>
    );
  };

  if (loading && orders.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading kitchen orders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>KITCHEN DISPLAY</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Ionicons name="refresh" size={24} color={green} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.viewFilters}>
        {[
          { key: 'pending', label: 'PENDING', count: orders.filter(o => o.status === 'pending').length },
          { key: 'preparing', label: 'PREPARING', count: orders.filter(o => o.status === 'preparing').length },
          { key: 'ready', label: 'READY', count: orders.filter(o => o.status === 'ready').length },
          { key: 'all', label: 'ALL', count: orders.length }
        ].map(view => (
          <TouchableOpacity
            key={view.key}
            style={[
              styles.viewFilter,
              selectedView === view.key && styles.viewFilterActive
            ]}
            onPress={() => setSelectedView(view.key as any)}
          >
            <Text style={[
              styles.viewFilterText,
              selectedView === view.key && styles.viewFilterTextActive
            ]}>
              {view.label} ({view.count})
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="pizza-outline" size={64} color={green} />
          <Text style={styles.emptyText}>No {selectedView === 'all' ? '' : selectedView} orders</Text>
          <Text style={styles.emptySubtext}>Orders will appear here in real-time</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={green}
            />
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 2,
    borderBottomColor: green,
  },
  title: {
    fontSize: 24,
    color: green,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
  },
  viewFilters: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 15,
    gap: 5,
  },
  viewFilter: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: green,
    alignItems: 'center',
  },
  viewFilterActive: {
    backgroundColor: green,
  },
  viewFilterText: {
    color: green,
    fontSize: 12,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
  },
  viewFilterTextActive: {
    color: bg,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    color: green,
    fontSize: 24,
    fontFamily: 'VT323_400Regular',
    marginTop: 20,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 16,
    fontFamily: 'VT323_400Regular',
    marginTop: 10,
  },
  orderCard: {
    backgroundColor: darkGray,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 3,
    shadowColor: green,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 5,
  },
  statusText: {
    color: bg,
    fontSize: 12,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
  },
  orderContent: {
    marginBottom: 10,
  },
  dateTime: {
    color: green,
    fontSize: 26,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  memberName: {
    color: '#ccc',
    fontSize: 22,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  pizzaName: {
    color: '#FFFF00',
    fontSize: 22,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  phoneNumber: {
    color: '#888',
    fontSize: 22,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
    marginBottom: 0,
  },
  orderActions: {
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  startButton: {
    backgroundColor: '#FFA500',
  },
  readyButton: {
    backgroundColor: '#00BFFF',
  },
  pickedUpButton: {
    backgroundColor: green,
  },
  actionButtonText: {
    color: bg,
    fontSize: 14,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
  },
  completedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  completedText: {
    color: '#888',
    fontSize: 14,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
  },
});