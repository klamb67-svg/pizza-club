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

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  phone: string;
  address?: string;
  created_at: string;
}

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
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
      
      const { data, error } = await supabase
        .from('members')
        .select('id, first_name, last_name, username, phone, address, created_at')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error loading members:', error);
        Alert.alert('Error', 'Failed to load members');
        return;
      }
      
      setMembers(data || []);
      
    } catch (error) {
      console.error('Error loading members:', error);
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

  const deleteMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', memberId);
      
      if (error) {
        console.error('Member deletion failed:', error);
        return;
      }
      
      // Update local state
      setMembers(members.filter(member => member.id !== memberId));
      
    } catch (error) {
      console.error('Member deletion error:', error);
    }
  };

  const filteredMembers = members.filter(member =>
    `${member.first_name} ${member.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.phone.includes(searchQuery)
  );

  const renderMemberItem = ({ item }: { item: Member }) => (
    <View style={styles.memberCard}>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.first_name} {item.last_name}</Text>
        <Text style={styles.memberUsername}>@{item.username}</Text>
        <Text style={styles.memberPhone}>📞 {item.phone}</Text>
        {item.address && (
          <Text style={styles.memberAddress}>📍 {item.address}</Text>
        )}
        <Text style={styles.memberDate}>
          Joined: {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteMember(item.id)}
      >
        <Ionicons name="trash" size={20} color={bg} />
      </TouchableOpacity>
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
          <Text style={styles.statNumber}>{filteredMembers.length}</Text>
          <Text style={styles.statLabel}>Search Results</Text>
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
    borderWidth: 1,
    borderColor: green,
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
    color: green,
    fontSize: 12,
    fontFamily: 'VT323_400Regular',
    marginTop: 5,
    opacity: 0.7,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberInfo: {
    flex: 1,
    marginRight: 15,
  },
  memberName: {
    color: green,
    fontSize: 18,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  memberUsername: {
    color: green,
    fontSize: 14,
    fontFamily: 'VT323_400Regular',
    opacity: 0.8,
    marginBottom: 4,
  },
  memberPhone: {
    color: green,
    fontSize: 14,
    fontFamily: 'VT323_400Regular',
    marginBottom: 4,
  },
  memberAddress: {
    color: green,
    fontSize: 14,
    fontFamily: 'VT323_400Regular',
    opacity: 0.7,
    marginBottom: 4,
  },
  memberDate: {
    color: green,
    fontSize: 12,
    fontFamily: 'VT323_400Regular',
    opacity: 0.6,
    marginTop: 4,
  },
  deleteButton: {
    backgroundColor: '#FF4444',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});