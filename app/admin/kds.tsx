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
import { supabase } from '../../lib/supabase';
import { adminAuth } from '../../lib/adminAuth';

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
}

export default function KitchenDisplaySystem() {
  const [orders, setOrders] = useState<KDSOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedView, setSelectedView] = useState<'pending' | 'preparing' | 'ready' | 'all'>('pending');

  useEffect(() => {
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
        .order('created_at', { ascending: true });
      
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
            estimated_time: order.pizzas?.preparation_time || 15
          };
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
      
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);
      
      if (error) {
        console.error('❌ Order deletion failed:', error);
        Alert.alert('Error', 'Failed to delete order');
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

  const renderOrderItem = ({ item }: { item: KDSOrder }) => (
    <View style={[styles.orderCard, { borderColor: getStatusColor(item.status) }]}>
      <View style={styles.orderHeader}>
        <View style={styles.orderIdContainer}>
          <Text style={styles.orderId}>#{item.id}</Text>
          <Text style={styles.orderTime}>{item.time_slot} • {item.date}</Text>
        </View>
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
      
      <View style={styles.orderContent}>
        <Text style={styles.pizzaName}>{item.pizza_name}</Text>
        <Text style={styles.memberName}>for {item.member_name}</Text>
        {item.phone ? <Text style={styles.phoneNumber}>{item.phone}</Text> : null}
        
        <View style={styles.orderDetails}>
          <Text style={styles.estimatedTime}>~{item.estimated_time} min</Text>
        </View>
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
    padding: 20,
    marginBottom: 15,
    borderWidth: 3,
    shadowColor: green,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  orderIdContainer: {
    flex: 1,
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
  orderId: {
    color: green,
    fontSize: 20,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
  },
  orderTime: {
    color: '#ccc',
    fontSize: 14,
    fontFamily: 'VT323_400Regular',
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
    marginBottom: 15,
  },
  pizzaName: {
    color: green,
    fontSize: 22,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  memberName: {
    color: '#ccc',
    fontSize: 16,
    fontFamily: 'VT323_400Regular',
  },
  phoneNumber: {
    color: '#888',
    fontSize: 14,
    fontFamily: 'VT323_400Regular',
    marginTop: 2,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  price: {
    color: green,
    fontSize: 18,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
  },
  estimatedTime: {
    color: '#FFA500',
    fontSize: 14,
    fontFamily: 'VT323_400Regular',
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