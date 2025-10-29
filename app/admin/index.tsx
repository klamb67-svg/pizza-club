import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { adminAuth } from '../../lib/adminAuth';
import { supabase } from '../../lib/supabase';

const green = "#00FF66";
const bg = "#001a00";
const darkGray = "#1a1a1a";

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalMembers: number;
  activeOrders: number;
  completedToday: number;
  revenue: number;
}

export default function AdminIndex() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    totalMembers: 0,
    activeOrders: 0,
    completedToday: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    checkAdminAccess();
    loadDashboardData();
  }, []);

  const checkAdminAccess = async () => {
    const admin = adminAuth.getCurrentAdmin();
    if (!admin) {
      // Redirect to login if not admin
      router.replace('/login');
      return;
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('📊 Loading admin dashboard data...');
      
      // Get total members count
      const { count: totalMembers } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true });
      
      // Get members with orders
      const { data: membersWithOrders } = await supabase
        .from('members')
        .select('address')
        .not('address', 'is', null);
      
      // Calculate order statistics
      let totalOrders = 0;
      let pendingOrders = 0;
      let activeOrders = 0;
      let completedToday = 0;
      let revenue = 0;
      
      membersWithOrders?.forEach(member => {
        if (member.address && member.address.includes('ORDER_')) {
          totalOrders++;
          
          // Parse order information
          const orderMatch = member.address.match(/ORDER_(\d+): (.+) - \$(\d+\.\d+) at (.+) on (.+)/);
          if (orderMatch) {
            const [, , , price] = orderMatch;
            revenue += parseFloat(price);
            
            // Check status
            if (member.address.includes('STATUS_in_progress_')) {
              activeOrders++;
            } else if (member.address.includes('STATUS_completed_')) {
              completedToday++;
            } else {
              pendingOrders++;
            }
          }
        }
      });
      
      const dashboardStats: DashboardStats = {
        totalOrders,
        pendingOrders,
        totalMembers: totalMembers || 0,
        activeOrders,
        completedToday,
        revenue: Math.round(revenue * 100) / 100
      };
      
      console.log('✅ Dashboard data loaded:', dashboardStats);
      setStats(dashboardStats);
      
    } catch (error) {
      console.error('❌ Dashboard data load failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const StatCard = ({ title, value, icon, color = green }: {
    title: string;
    value: string | number;
    icon: string;
    color?: string;
  }) => (
    <View style={[styles.statCard, { borderColor: color }]}>
      <View style={styles.statHeader}>
        <Ionicons name={icon as any} size={24} color={color} />
        <Text style={[styles.statValue, { color }]}>{value}</Text>
      </View>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  const QuickAction = ({ title, icon, onPress, color = green }: {
    title: string;
    icon: string;
    onPress: () => void;
    color?: string;
  }) => (
    <TouchableOpacity style={[styles.quickAction, { borderColor: color }]} onPress={onPress}>
      <Ionicons name={icon as any} size={32} color={color} />
      <Text style={[styles.quickActionText, { color }]}>{title}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={green}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>ADMIN DASHBOARD</Text>
          <TouchableOpacity onPress={onRefresh}>
            <Ionicons name="refresh" size={24} color={green} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon="receipt-outline"
            color={green}
          />
          <StatCard
            title="Pending Orders"
            value={stats.pendingOrders}
            icon="time-outline"
            color="#FFA500"
          />
          <StatCard
            title="Active Orders"
            value={stats.activeOrders}
            icon="play-outline"
            color="#00BFFF"
          />
          <StatCard
            title="Completed Today"
            value={stats.completedToday}
            icon="checkmark-circle-outline"
            color={green}
          />
          <StatCard
            title="Total Members"
            value={stats.totalMembers}
            icon="people-outline"
            color="#9C27B0"
          />
          <StatCard
            title="Revenue"
            value={`$${stats.revenue}`}
            icon="cash-outline"
            color="#4CAF50"
          />
        </View>
        
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
          <View style={styles.quickActionsGrid}>
            <QuickAction
              title="Orders"
              icon="receipt-outline"
              onPress={() => router.push('/admin/orders')}
            />
            <QuickAction
              title="Members"
              icon="people-outline"
              onPress={() => router.push('/admin/members')}
            />
            <QuickAction
              title="Menu"
              icon="restaurant-outline"
              onPress={() => router.push('/admin/menu')}
            />
            <QuickAction
              title="KDS"
              icon="restaurant-outline"
              onPress={() => router.push('/admin/kds')}
            />
            <QuickAction
              title="Schedule"
              icon="calendar-outline"
              onPress={() => router.push('/admin/schedule')}
            />
            <QuickAction
              title="Settings"
              icon="settings-outline"
              onPress={() => Alert.alert('Settings', 'Settings panel coming soon!')}
            />
          </View>
        </View>
        
        <View style={styles.recentActivitySection}>
          <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>
          <View style={styles.activityCard}>
            <Text style={styles.activityText}>
              🍕 {stats.pendingOrders} orders pending preparation
            </Text>
            <Text style={styles.activityText}>
              👥 {stats.totalMembers} total members registered
            </Text>
            <Text style={styles.activityText}>
              💰 ${stats.revenue} total revenue generated
            </Text>
            <Text style={styles.activityText}>
              ✅ {stats.completedToday} orders completed today
            </Text>
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
  },
  scrollView: {
    flex: 1,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 15,
  },
  statCard: {
    width: '47%',
    backgroundColor: darkGray,
    borderRadius: 12,
    padding: 15,
    borderWidth: 2,
    alignItems: 'center',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
  },
  statTitle: {
    color: '#ccc',
    fontSize: 12,
    fontFamily: 'VT323_400Regular',
    textAlign: 'center',
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    color: green,
    fontSize: 18,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  quickAction: {
    width: '30%',
    backgroundColor: darkGray,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
  },
  quickActionText: {
    fontSize: 12,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  recentActivitySection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  activityCard: {
    backgroundColor: darkGray,
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: green,
  },
  activityText: {
    color: '#ccc',
    fontSize: 14,
    fontFamily: 'VT323_400Regular',
    marginBottom: 8,
  },
});