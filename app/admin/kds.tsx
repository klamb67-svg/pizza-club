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

// KDS Order interface
interface KDSOrder {
  id: string;
  order_id: string;
  member_name: string;
  pizza_name: string;
  pizza_price: number;
  time_slot: string;
  date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  special_instructions?: string;
  created_at: string;
  estimated_time?: number; // minutes
}

export default function KitchenDisplaySystem() {
  const [orders, setOrders] = useState<KDSOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedView, setSelectedView] = useState<'pending' | 'in_progress' | 'all'>('pending');

  useEffect(() => {
    // Check admin access
    checkAdminAccess();
    loadOrders();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
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
      console.log('🍕 Loading KDS orders...');
      
      // Get all members with order information
      const { data: members, error } = await supabase
        .from('members')
        .select('id, first_name, last_name, phone, address, created_at')
        .not('address', 'is', null)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error loading KDS orders:', error);
        return;
      }
      
      // Parse order information from address field
      const kdsOrders: KDSOrder[] = [];
      
      members?.forEach(member => {
        if (member.address && member.address.includes('ORDER_')) {
          // Parse order information from address field
          const orderMatch = member.address.match(/ORDER_(\d+): (.+) - \$(\d+\.\d+) at (.+) on (.+)/);
          
          if (orderMatch) {
            const [, orderId, pizzaName, price, timeSlot, date] = orderMatch;
            
            // Determine status based on address content
            let status: KDSOrder['status'] = 'pending';
            if (member.address.includes('STATUS_in_progress_')) {
              status = 'in_progress';
            } else if (member.address.includes('STATUS_completed_')) {
              status = 'completed';
            } else if (member.address.includes('STATUS_cancelled_')) {
              status = 'cancelled';
            }
            
            // Calculate estimated prep time based on pizza type
            let estimatedTime = 15; // default
            if (pizzaName.includes('Hawaiian')) estimatedTime = 18;
            if (pizzaName.includes('Meatball')) estimatedTime = 20;
            if (pizzaName.includes('Pepperoni')) estimatedTime = 16;
            
            kdsOrders.push({
              id: member.id,
              order_id: orderId,
              member_name: `${member.first_name} ${member.last_name}`,
              pizza_name: pizzaName,
              pizza_price: parseFloat(price),
              time_slot: timeSlot,
              date: date,
              status: status,
              special_instructions: member.address.includes('Extra') ? 'Extra cheese' : undefined,
              created_at: member.created_at,
              estimated_time: estimatedTime
            });
          }
        }
      });
      
      console.log('✅ Loaded KDS orders:', kdsOrders.length);
      setOrders(kdsOrders);
      
    } catch (error) {
      console.error('❌ Error loading KDS orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: KDSOrder['status']) => {
    try {
      console.log('🔄 Updating KDS order status:', orderId, 'to', newStatus);
      
      // Update the member's address field to reflect status
      const { error } = await supabase
        .from('members')
        .update({ 
          address: `STATUS_${newStatus}_${orderId}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
      
      if (error) {
        console.error('❌ KDS status update failed:', error);
        Alert.alert('Error', 'Failed to update order status');
        return;
      }
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus }
          : order
      ));
      
      console.log('✅ KDS order status updated successfully');
      
    } catch (error) {
      console.error('❌ KDS status update error:', error);
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const getStatusColor = (status: KDSOrder['status']) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'in_progress': return '#00BFFF';
      case 'completed': return green;
      case 'cancelled': return '#FF4444';
      default: return '#666';
    }
  };

  const getStatusIcon = (status: KDSOrder['status']) => {
    switch (status) {
      case 'pending': return 'time-outline';
      case 'in_progress': return 'play-outline';
      case 'completed': return 'checkmark-circle-outline';
      case 'cancelled': return 'close-circle-outline';
      default: return 'help-outline';
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
          <Text style={styles.orderId}>#{item.order_id}</Text>
          <Text style={styles.orderTime}>{item.time_slot}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Ionicons 
            name={getStatusIcon(item.status)} 
            size={16} 
            color={bg} 
          />
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={styles.orderContent}>
        <Text style={styles.pizzaName}>{item.pizza_name}</Text>
        <Text style={styles.memberName}>for {item.member_name}</Text>
        
        {item.special_instructions && (
          <View style={styles.specialInstructionsContainer}>
            <Text style={styles.specialInstructionsLabel}>SPECIAL:</Text>
            <Text style={styles.specialInstructionsText}>{item.special_instructions}</Text>
          </View>
        )}
        
        <View style={styles.orderDetails}>
          <Text style={styles.price}>${item.pizza_price}</Text>
          <Text style={styles.estimatedTime}>~{item.estimated_time} min</Text>
        </View>
      </View>
      
      <View style={styles.orderActions}>
        {item.status === 'pending' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.startButton]}
            onPress={() => updateOrderStatus(item.id, 'in_progress')}
          >
            <Ionicons name="play" size={16} color={bg} />
            <Text style={styles.actionButtonText}>START</Text>
          </TouchableOpacity>
        )}
        
        {item.status === 'in_progress' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => updateOrderStatus(item.id, 'completed')}
          >
            <Ionicons name="checkmark" size={16} color={bg} />
            <Text style={styles.actionButtonText}>COMPLETE</Text>
          </TouchableOpacity>
        )}
        
        {item.status === 'completed' && (
          <View style={styles.completedContainer}>
            <Ionicons name="checkmark-circle" size={20} color={green} />
            <Text style={styles.completedText}>READY FOR PICKUP</Text>
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
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
          { key: 'in_progress', label: 'IN PROGRESS', count: orders.filter(o => o.status === 'in_progress').length },
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
      
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
  },
  viewFilter: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
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
    fontSize: 14,
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
    marginBottom: 10,
  },
  specialInstructionsContainer: {
    backgroundColor: '#001a00',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FFA500',
  },
  specialInstructionsLabel: {
    color: '#FFA500',
    fontSize: 12,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
  },
  specialInstructionsText: {
    color: '#ccc',
    fontSize: 14,
    fontFamily: 'VT323_400Regular',
    marginTop: 2,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    backgroundColor: '#00BFFF',
  },
  completeButton: {
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
    color: green,
    fontSize: 14,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
  },
});
