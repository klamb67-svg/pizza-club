import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { OrderWithDetails } from '../../lib/supabaseTypes';
import { supabase } from '../../lib/supabase';

const green = "#00FF66";
const bg = "#001a00";
const darkGray = "#1a1a1a";

// 🔧 TODO: replace mock data with Supabase query
const sampleOrders: OrderWithDetails[] = [
  { 
    id: 1, 
    member_name: 'Kelli', 
    member_phone: '555-0124',
    pizza_name: 'Pepperoni', 
    pizza_price: 18.99,
    time_slot_start: '6:15 PM', 
    time_slot_end: '6:30 PM',
    night_date: '2024-01-15',
    night_day: 'Friday', // 🔧 TODO: Replace with live night data from Supabase
    status: 'pending',
    // 🔧 TODO: Add missing required fields when connecting to Supabase
    member_id: 1,
    pizza_id: 1,
    time_slot_id: 1,
    night_id: 1,
    quantity: 1,
    total_price: 18.99,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  { 
    id: 2, 
    member_name: 'Nimix', 
    member_phone: '555-0126',
    pizza_name: 'Meatball', 
    pizza_price: 20.99,
    time_slot_start: '7:00 PM', 
    time_slot_end: '7:15 PM',
    night_date: '2024-01-15',
    night_day: 'Friday', // 🔧 TODO: Replace with live night data from Supabase
    status: 'in_progress',
    member_id: 2,
    pizza_id: 2,
    time_slot_id: 2,
    night_id: 1,
    quantity: 1,
    total_price: 20.99,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  { 
    id: 3, 
    member_name: 'Alex', 
    member_phone: '555-0123',
    pizza_name: 'Margherita', 
    pizza_price: 16.99,
    time_slot_start: '5:30 PM', 
    time_slot_end: '5:45 PM',
    night_date: '2024-01-16',
    night_day: 'Saturday', // 🔧 TODO: Replace with live night data from Supabase
    status: 'completed',
    member_id: 3,
    pizza_id: 3,
    time_slot_id: 3,
    night_id: 2,
    quantity: 1,
    total_price: 16.99,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  { 
    id: 4, 
    member_name: 'Sarah', 
    member_phone: '555-0127',
    pizza_name: 'Supreme', 
    pizza_price: 22.99,
    time_slot_start: '8:45 PM', 
    time_slot_end: '9:00 PM',
    night_date: '2024-01-16',
    night_day: 'Saturday', // 🔧 TODO: Replace with live night data from Supabase
    status: 'pending',
    member_id: 4,
    pizza_id: 4,
    time_slot_id: 4,
    night_id: 2,
    quantity: 1,
    total_price: 22.99,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  { 
    id: 5, 
    member_name: 'Mike', 
    member_phone: '555-0125',
    pizza_name: 'Hawaiian', 
    pizza_price: 19.99,
    time_slot_start: '6:45 PM', 
    time_slot_end: '7:00 PM',
    night_date: '2024-01-15',
    night_day: 'Friday', // 🔧 TODO: Replace with live night data from Supabase
    status: 'pending',
    member_id: 5,
    pizza_id: 5,
    time_slot_id: 5,
    night_id: 1,
    quantity: 1,
    total_price: 19.99,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function Orders() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // 🔧 TODO: Add SUPABASE_URL and SUPABASE_ANON_KEY environment variables
  // 🔧 TODO: Add admin authentication check before loading orders
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      
      // Query orders data - using flexible column selection
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Supabase error loading orders:', ordersError);
        Alert.alert('Error', 'Failed to load orders from database');
        // Fallback to mock data on error
        setOrders(sampleOrders);
        return;
      }

      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        console.log('📊 No orders found in database');
        return;
      }

      // Fetch related data separately since foreign keys aren't set up
      const { data: membersData } = await supabase.from('members').select('id, first_name, last_name');
      const { data: pizzasData } = await supabase.from('pizzas').select('id, name');
      const { data: timeSlotsData } = await supabase.from('time_slots').select('id, start_time');
      const { data: nightsData } = await supabase.from('nights').select('id, day_of_week');

      // Create lookup maps for human-readable values
      const membersMap = new Map(membersData?.map(m => [m.id, `${m.first_name} ${m.last_name}`]) || []);
      const pizzasMap = new Map(pizzasData?.map(p => [p.id, p.name]) || []);
      const timeSlotsMap = new Map(timeSlotsData?.map(t => [t.id, t.start_time]) || []);
      const nightsMap = new Map(nightsData?.map(n => [n.id, n.day_of_week]) || []);

      // Transform orders with human-readable values
      const transformedOrders: OrderWithDetails[] = ordersData.map(order => ({
        ...order,
        // Extract human-readable values using lookup maps
        // Handle cases where columns might not exist
        member_name: order.member_id ? membersMap.get(order.member_id) || '—' : '—',
        pizza_name: order.pizza_id ? pizzasMap.get(order.pizza_id) || '—' : '—',
        time_slot_start: order.time_slot_id ? timeSlotsMap.get(order.time_slot_id) || '—' : '—',
        night_day: order.night_id ? (nightsMap.get(order.night_id) as 'Friday' | 'Saturday') || '—' : '—',
        // 🔧 TODO: Ensure all required fields exist in orders table
        // Add fallback values for missing columns
        member_id: order.member_id || 0,
        pizza_id: order.pizza_id || 0,
        time_slot_id: order.time_slot_id || 0,
        night_id: order.night_id || 0,
        status: order.status || 'pending',
        quantity: order.quantity || 1,
        total_price: order.total_price || 0,
      }));
      
      setOrders(transformedOrders);
      console.log(`✅ Loaded ${transformedOrders.length} orders from Supabase with human-readable values`);
    } catch (error) {
      console.error('Error loading orders:', error);
      Alert.alert('Error', 'Failed to connect to database');
      // Fallback to mock data on error
      setOrders(sampleOrders);
    } finally {
      setLoading(false);
    }
  };

  // 🔧 TODO: implement real search functionality with Supabase
  const filteredOrders = orders.filter(order =>
    order.member_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.pizza_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.night_day?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'in_progress': return '#00FF66';
      case 'completed': return '#666';
      default: return green;
    }
  };

  const getNightIndicatorColor = (nightDay: string) => {
    switch (nightDay) {
      case 'Friday': return '#FFD700'; // Gold for Friday
      case 'Saturday': return '#87CEEB'; // Sky blue for Saturday
      default: return '#999';
    }
  };

  const updateOrderStatus = async (id: number, newStatus: OrderWithDetails['status']) => {
    try {
      // Update order status in Supabase
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Supabase error updating order status:', error);
        Alert.alert('Error', 'Failed to update order status');
        return;
      }

      // Update local state
      setOrders(orders.map(order => 
        order.id === id ? { ...order, status: newStatus } : order
      ));
      
      console.log(`✅ Updated order ${id} status to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const deleteOrder = async (id: number) => {
    try {
      // Delete order from Supabase
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error deleting order:', error);
        Alert.alert('Error', 'Failed to delete order');
        return;
      }

      // Update local state
      setOrders(orders.filter(order => order.id !== id));
      
      console.log(`✅ Deleted order ${id}`);
    } catch (error) {
      console.error('Error deleting order:', error);
      Alert.alert('Error', 'Failed to delete order');
    }
  };

  const renderOrder = ({ item }: { item: OrderWithDetails }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{item.member_name}</Text>
          <View style={[styles.nightBadge, { backgroundColor: getNightIndicatorColor(item.night_day || 'Friday') }]}>
            <Text style={styles.nightText}>{item.night_day || 'Friday'} Night</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.pizzaType}>{item.pizza_name}</Text>
      <Text style={styles.timeSlot}>{item.time_slot_start}</Text>
      <View style={styles.actionButtons}>
        {item.status === 'pending' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: green }]}
            onPress={() => updateOrderStatus(item.id, 'in_progress')}
          >
            <Text style={styles.actionButtonText}>START</Text>
          </TouchableOpacity>
        )}
        {item.status === 'in_progress' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#FFA500' }]}
            onPress={() => updateOrderStatus(item.id, 'completed')}
          >
            <Text style={styles.actionButtonText}>COMPLETE</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#FF4444' }]}
          onPress={() => deleteOrder(item.id)}
        >
          <Text style={styles.actionButtonText}>DELETE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ORDERS</Text>
        <Text style={styles.subtitle}>Back of House</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={green} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search orders..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.ordersList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No orders found</Text>
              <Text style={styles.emptySubtext}>Orders will appear here when customers place them</Text>
            </View>
          }
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: darkGray,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: green,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: green,
    fontSize: 16,
    fontFamily: 'VT323_400Regular',
  },
  ordersList: {
    padding: 20,
  },
  orderCard: {
    backgroundColor: darkGray,
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: green,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  memberInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberName: {
    color: green,
    fontSize: 20,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: bg,
    fontSize: 12,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
  },
  nightBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  nightText: {
    color: bg,
    fontSize: 10,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  pizzaType: {
    color: green,
    fontSize: 16,
    fontFamily: 'VT323_400Regular',
    marginBottom: 4,
  },
  timeSlot: {
    color: '#999',
    fontSize: 14,
    fontFamily: 'VT323_400Regular',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    minWidth: 80,
    alignItems: 'center',
  },
  actionButtonText: {
    color: bg,
    fontSize: 12,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    color: green,
    fontSize: 18,
    fontFamily: 'VT323_400Regular',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: green,
    fontSize: 20,
    fontFamily: 'VT323_400Regular',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'VT323_400Regular',
    textAlign: 'center',
    opacity: 0.8,
  },
});
