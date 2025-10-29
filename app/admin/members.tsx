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
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { adminAuth } from '../../lib/adminAuth';

const green = "#00FF66";
const bg = "#001a00";
const darkGray = "#1a1a1a";

// Member interface for admin display
interface AdminMember {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  phone: string;
  address?: string;
  created_at: string;
  has_order: boolean;
  order_info?: string;
}

export default function Members() {
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Check admin access
    checkAdminAccess();
    loadMembers();
  }, []);

  const checkAdminAccess = async () => {
    const admin = adminAuth.getCurrentAdmin();
    if (!admin) {
      Alert.alert('Access Denied', 'Admin access required');
      return;
    }
  };

  const loadMembers = async () => {
    try {
      setLoading(true);
      console.log('👥 Loading members for admin...');
      
      // Get all members from database
      const { data: membersData, error } = await supabase
        .from('members')
        .select('id, first_name, last_name, username, phone, address, created_at')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error loading members:', error);
        Alert.alert('Error', 'Failed to load members');
        return;
      }
      
      // Transform data for admin display
      const adminMembers: AdminMember[] = membersData?.map(member => ({
        id: member.id,
        first_name: member.first_name,
        last_name: member.last_name,
        username: member.username,
        phone: member.phone,
        address: member.address,
        created_at: member.created_at,
        has_order: member.address ? member.address.includes('ORDER_') : false,
        order_info: member.address?.includes('ORDER_') ? member.address : undefined
      })) || [];
      
      console.log('✅ Loaded members:', adminMembers.length);
      setMembers(adminMembers);
      
    } catch (error) {
      console.error('❌ Error loading members:', error);
      Alert.alert('Error', 'Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMembers();
    setRefreshing(false);
  };

  const deleteMember = async (memberId: string, memberName: string) => {
    Alert.alert(
      'Delete Member',
      `Are you sure you want to delete ${memberName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ Deleting member:', memberId);
              
              const { error } = await supabase
                .from('members')
                .delete()
                .eq('id', memberId);
              
              if (error) {
                console.error('❌ Member deletion failed:', error);
                Alert.alert('Error', 'Failed to delete member');
                return;
              }
              
              // Update local state
              setMembers(members.filter(member => member.id !== memberId));
              
              console.log('✅ Member deleted successfully');
              Alert.alert('Success', 'Member deleted successfully');
              
            } catch (error) {
              console.error('❌ Member deletion error:', error);
              Alert.alert('Error', 'Failed to delete member');
            }
          }
        }
      ]
    );
  };

  const clearMemberOrder = async (memberId: string, memberName: string) => {
    Alert.alert(
      'Clear Order',
      `Clear order information for ${memberName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          onPress: async () => {
            try {
              console.log('🧹 Clearing order for member:', memberId);
              
              const { error } = await supabase
                .from('members')
                .update({ 
                  address: null,
                  updated_at: new Date().toISOString()
                })
                .eq('id', memberId);
              
              if (error) {
                console.error('❌ Order clear failed:', error);
                Alert.alert('Error', 'Failed to clear order');
                return;
              }
              
              // Update local state
              setMembers(members.map(member => 
                member.id === memberId 
                  ? { ...member, has_order: false, order_info: undefined, address: undefined }
                  : member
              ));
              
              console.log('✅ Order cleared successfully');
              Alert.alert('Success', 'Order cleared successfully');
              
            } catch (error) {
              console.error('❌ Order clear error:', error);
              Alert.alert('Error', 'Failed to clear order');
            }
          }
        }
      ]
    );
  };

  const filteredMembers = members.filter(member =>
    `${member.first_name} ${member.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.phone.includes(searchQuery)
  );

  const renderMemberItem = ({ item }: { item: AdminMember }) => (
    <View style={styles.memberCard}>
      <View style={styles.memberHeader}>
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{item.first_name} {item.last_name}</Text>
          <Text style={styles.memberUsername}>@{item.username}</Text>
        </View>
        {item.has_order && (
          <View style={styles.orderBadge}>
            <Text style={styles.orderBadgeText}>ORDER</Text>
          </View>
        )}
      </View>
      
      <View style={styles.memberDetails}>
        <Text style={styles.memberPhone}>📞 {item.phone}</Text>
        <Text style={styles.memberDate}>
          Joined: {new Date(item.created_at).toLocaleDateString()}
        </Text>
        {item.order_info && (
          <View style={styles.orderInfo}>
            <Text style={styles.orderInfoTitle}>Current Order:</Text>
            <Text style={styles.orderInfoText}>{item.order_info}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.memberActions}>
        {item.has_order && (
          <TouchableOpacity
            style={[styles.actionButton, styles.clearButton]}
            onPress={() => clearMemberOrder(item.id, `${item.first_name} ${item.last_name}`)}
          >
            <Text style={styles.actionButtonText}>CLEAR ORDER</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => deleteMember(item.id, `${item.first_name} ${item.last_name}`)}
        >
          <Text style={styles.actionButtonText}>DELETE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading members...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MEMBERS</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Ionicons name="refresh" size={24} color={green} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search members..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{members.length}</Text>
          <Text style={styles.statLabel}>Total Members</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{members.filter(m => m.has_order).length}</Text>
          <Text style={styles.statLabel}>With Orders</Text>
        </View>
      </View>
      
      <FlatList
        data={filteredMembers}
        renderItem={renderMemberItem}
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
    borderBottomWidth: 1,
    borderBottomColor: green,
  },
  title: {
    fontSize: 24,
    color: green,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchInput: {
    backgroundColor: darkGray,
    color: green,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    fontFamily: 'VT323_400Regular',
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 15,
    gap: 20,
  },
  statItem: {
    flex: 1,
    backgroundColor: darkGray,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: green,
  },
  statNumber: {
    color: green,
    fontSize: 24,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#ccc',
    fontSize: 12,
    fontFamily: 'VT323_400Regular',
    marginTop: 5,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  memberCard: {
    backgroundColor: darkGray,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: green,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    color: green,
    fontSize: 18,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
  },
  memberUsername: {
    color: '#ccc',
    fontSize: 14,
    fontFamily: 'VT323_400Regular',
  },
  orderBadge: {
    backgroundColor: '#FFA500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  orderBadgeText: {
    color: bg,
    fontSize: 10,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
  },
  memberDetails: {
    marginBottom: 15,
  },
  memberPhone: {
    color: '#ccc',
    fontSize: 14,
    fontFamily: 'VT323_400Regular',
    marginBottom: 5,
  },
  memberDate: {
    color: '#666',
    fontSize: 12,
    fontFamily: 'VT323_400Regular',
  },
  orderInfo: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#001a00',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#FFA500',
  },
  orderInfoTitle: {
    color: '#FFA500',
    fontSize: 12,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  orderInfoText: {
    color: '#ccc',
    fontSize: 11,
    fontFamily: 'VT323_400Regular',
  },
  memberActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#FFA500',
  },
  deleteButton: {
    backgroundColor: '#FF4444',
  },
  actionButtonText: {
    color: bg,
    fontSize: 12,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
  },
});