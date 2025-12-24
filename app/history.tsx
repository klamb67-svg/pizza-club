// app/history.tsx
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '../lib/supabase';
import type { OrderWithDetails } from '../lib/supabaseTypes';
import { useResponsiveValues } from '../lib/responsive';
import BottomNav from '../components/BottomNav';

const green = "#00FF66";
const bg = "#001a00";
const darkGray = "#1a1a1a";

export default function History() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const responsive = useResponsiveValues();

  useEffect(() => {
    setIsLoggedIn(!!username);
    loadOrderHistory();
  }, [username]);

  const loadOrderHistory = async () => {
    try {
      setLoading(true);
      
      // Get current user's member_id if username is available
      let memberId: number | null = null;
      if (username) {
        const { data: member } = await supabase
          .from('members')
          .select('id')
          .eq('username', username)
          .single();
        if (member) {
          memberId = member.id;
        }
      }
      
      // Query orders data - filter by member_id if available
      let query = supabase
        .from('orders')
        .select('*');
      
      if (memberId) {
        query = query.eq('member_id', memberId);
      }
      
      const { data: ordersData, error: ordersError } = await query
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Supabase error loading orders:', ordersError);
        setOrders([]);
        return;
      }

      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        return;
      }

      // Fetch related data separately since foreign keys aren't set up
      const { data: membersData } = await supabase.from('members').select('id, first_name, last_name');
      const { data: pizzasData } = await supabase.from('pizzas').select('id, name');
      const { data: timeSlotsData } = await supabase.from('time_slots').select('id, starts_at');
      const { data: nightsData } = await supabase.from('nights').select('id, day_of_week');

      // Create lookup maps for human-readable values
      const membersMap = new Map(membersData?.map(m => [m.id, `${m.first_name} ${m.last_name}`]) || []);
      const pizzasMap = new Map(pizzasData?.map(p => [p.id, p.name]) || []);
      // Convert starts_at timestamp to readable time format (HH:MM)
      const timeSlotsMap = new Map(timeSlotsData?.map(t => {
        if (!t.starts_at) return [t.id, '—'];
        const date = new Date(t.starts_at);
        const hours = date.getUTCHours();
        const minutes = date.getUTCMinutes();
        const timeStr = `${hours}:${minutes.toString().padStart(2, '0')}`;
        return [t.id, timeStr];
      }) || []);
      const nightsMap = new Map(nightsData?.map(n => [n.id, n.day_of_week]) || []);

      // Transform orders with human-readable values
      const transformedOrders: OrderWithDetails[] = ordersData?.map(order => {
        // Handle both schema types: new orders have pizza_name/time_slot directly, old ones have IDs
        const pizzaName = (order as any).pizza_name || (order.pizza_id ? pizzasMap.get(order.pizza_id) : null) || '—';
        // Get time slot - either from direct time_slot field or lookup by time_slot_id
        let timeSlot = (order as any).time_slot;
        if (!timeSlot && order.time_slot_id) {
          timeSlot = timeSlotsMap.get(order.time_slot_id) || '—';
        }
        if (!timeSlot) timeSlot = '—';
        const memberName = order.member_id ? membersMap.get(order.member_id) || '—' : '—';
        const nightDay = order.night_id ? (nightsMap.get(order.night_id) as 'Friday' | 'Saturday') || '—' : '—';
        
        return {
          ...order,
          // Use direct values if available, otherwise lookup from IDs
          member_name: memberName,
          pizza_name: pizzaName,
          time_slot_starts_at: timeSlot, // Display time from starts_at
          night_day: nightDay,
          // Add fallback values for missing columns
          member_id: order.member_id || 0,
          pizza_id: order.pizza_id || 0,
          time_slot_id: order.time_slot_id || 0,
          night_id: order.night_id || 0,
          status: order.status || 'pending',
          quantity: order.quantity || 1,
          total_price: order.total_price || (order as any).pizza_price || 0,
        };
      });

      // 🔧 TODO: Filter by current user once auth context is finalized
      // For now, show all orders as placeholder
      setOrders(transformedOrders);
      
    } catch (error) {
      console.error('Error loading order history:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return green;
      case 'in_progress': return '#FFA500';
      case 'pending': return '#FFA500';
      case 'cancelled': return '#FF4444';
      default: return green;
    }
  };

  const getNightIndicatorColor = (nightDay: string) => {
    switch (nightDay) {
      case 'Friday': return '#FFD700';
      case 'Saturday': return '#87CEEB';
      default: return '#999';
    }
  };

  const renderOrder = ({ item }: { item: OrderWithDetails }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.pizzaName}>{item.pizza_name}</Text>
          <View style={[styles.nightBadge, { backgroundColor: getNightIndicatorColor(item.night_day || 'Friday') }]}>
            <Text style={styles.nightText}>{item.night_day || 'Friday'} Night</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.timeSlot}>Pickup: {item.time_slot_starts_at || '—'}</Text>
      <Text style={styles.orderDate}>Ordered: {new Date(item.created_at || '').toLocaleDateString()}</Text>
      <Text style={styles.price}>${item.total_price?.toFixed(2) || '0.00'}</Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Order History</Text>
      <Text style={styles.emptyText}>
        {isLoggedIn 
          ? "You haven't placed any orders yet. Start by choosing a pizza from the menu!"
          : "Sign in to view your order history."
        }
      </Text>
    </View>
  );

  const styles = createStyles(responsive);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ORDER HISTORY</Text>
        <Text style={styles.subtitle}>Your Pizza Journey</Text>
      </View>

      {!isLoggedIn && (
        <View style={styles.noticeBar}>
          <Text style={styles.noticeText}>Signed-out preview</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading order history...</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.ordersList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          numColumns={responsive.gridColumns}
          columnWrapperStyle={responsive.gridColumns > 1 ? styles.row : undefined}
        />
      )}
      <BottomNav currentPage="history" username={username} />
    </SafeAreaView>
  );
}

const createStyles = (responsive: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: bg,
  },
  header: {
    padding: responsive.padding.lg,
    borderBottomWidth: 1,
    borderBottomColor: green,
  },
  title: {
    color: green,
    fontSize: responsive.fontSize.title,
    fontFamily: 'VT323_400Regular',
    textAlign: 'center',
  },
  subtitle: {
    color: green,
    fontSize: responsive.fontSize.lg,
    fontFamily: 'VT323_400Regular',
    textAlign: 'center',
    opacity: 0.8,
    marginTop: 4,
  },
  noticeBar: {
    backgroundColor: 'rgba(0, 255, 102, 0.1)',
    borderWidth: 1,
    borderColor: green,
    padding: responsive.padding.md,
    margin: responsive.margin.lg,
    borderRadius: 4,
  },
  noticeText: {
    color: green,
    fontSize: responsive.fontSize.md,
    fontFamily: 'VT323_400Regular',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: responsive.padding.xl,
  },
  loadingText: {
    color: green,
    fontSize: responsive.fontSize.lg,
    fontFamily: 'VT323_400Regular',
  },
  ordersList: {
    padding: responsive.padding.lg,
  },
  row: {
    justifyContent: 'space-between',
  },
  orderCard: {
    backgroundColor: darkGray,
    padding: responsive.padding.md,
    marginBottom: responsive.margin.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: green,
    shadowColor: green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    flex: responsive.gridColumns > 1 ? 1 : undefined,
    marginHorizontal: responsive.gridColumns > 1 ? responsive.margin.xs : 0,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: responsive.margin.sm,
  },
  orderInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsive.margin.sm,
  },
  pizzaName: {
    color: green,
    fontSize: responsive.fontSize.xl,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
  },
  nightBadge: {
    paddingHorizontal: responsive.padding.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  nightText: {
    color: bg,
    fontSize: responsive.fontSize.xs,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  statusBadge: {
    paddingHorizontal: responsive.padding.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    color: bg,
    fontSize: responsive.fontSize.sm,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
  },
  timeSlot: {
    color: green,
    fontSize: responsive.fontSize.md,
    fontFamily: 'VT323_400Regular',
    marginBottom: 2,
  },
  orderDate: {
    color: '#999',
    fontSize: responsive.fontSize.sm,
    fontFamily: 'VT323_400Regular',
    marginBottom: 2,
  },
  price: {
    color: green,
    fontSize: responsive.fontSize.lg,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: responsive.padding.xl,
  },
  emptyTitle: {
    color: green,
    fontSize: responsive.fontSize.xxl,
    fontFamily: 'VT323_400Regular',
    textAlign: 'center',
    marginBottom: responsive.margin.md,
  },
  emptyText: {
    color: '#666',
    fontSize: responsive.fontSize.md,
    fontFamily: 'VT323_400Regular',
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 24,
  },
});

