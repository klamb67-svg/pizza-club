import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Member, CreateMemberInput, UpdateMemberInput } from '../../lib/supabaseTypes';
import { supabaseApi } from '../../lib/supabaseApi';
import { useResponsiveValues } from '../../lib/responsive';

const green = "#00FF66";
const bg = "#001a00";
const darkGray = "#1a1a1a";

// 🔧 TODO: replace mock data with Supabase query
const sampleMembers: Member[] = [
  { 
    id: 1, 
    first_name: 'Alex',
    last_name: 'Johnson',
    username: 'AlexJ',
    phone: '555-0123',
    address: '123 Main St',
    password_hash: 'hashed_password',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  { 
    id: 2, 
    first_name: 'Kelli',
    last_name: 'Smith',
    username: 'KelliS',
    phone: '555-0124',
    address: '456 Oak Ave',
    password_hash: 'hashed_password',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  { 
    id: 3, 
    first_name: 'Mike',
    last_name: 'Chen',
    username: 'MikeC',
    phone: '555-0125',
    address: '789 Pine St',
    password_hash: 'hashed_password',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  { 
    id: 4, 
    first_name: 'Nimix',
    last_name: 'Patel',
    username: 'NimixP',
    phone: '555-0126',
    address: '321 Elm St',
    password_hash: 'hashed_password',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  { 
    id: 5, 
    first_name: 'Sarah',
    last_name: 'Williams',
    username: 'SarahW',
    phone: '555-0127',
    address: '654 Maple Ave',
    password_hash: 'hashed_password',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const responsive = useResponsiveValues();

  // 🔧 TODO: Add SUPABASE_URL and SUPABASE_ANON_KEY environment variables
  // 🔧 TODO: Add admin authentication check before loading members
  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      // 🔧 TODO: Replace with real Supabase query when environment variables are configured
      // const membersData = await supabaseApi.members.getAll();
      // setMembers(membersData);
      
      // Temporary fallback to mock data
      setMembers(sampleMembers);
    } catch (error) {
      console.error('Error loading members:', error);
      // Fallback to mock data on error
      setMembers(sampleMembers);
    } finally {
      setLoading(false);
    }
  };

  // 🔧 TODO: implement real search functionality with Supabase
  const filteredMembers = members.filter(member =>
    `${member.first_name} ${member.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openEditModal = (member: Member) => {
    setEditingMember(member);
    setEditForm({ 
      first_name: member.first_name, 
      last_name: member.last_name,
      email: '', // Email field removed from schema 
      phone: member.phone 
    });
    setIsEditModalVisible(true);
  };

  const saveMember = async () => {
    if (!editingMember) return;

    try {
      // 🔧 TODO: Replace with real Supabase update when environment variables are configured
      // const updateData: UpdateMemberInput = {
      //   name: editForm.name,
      //   email: editForm.email,
      //   phone: editForm.phone,
      // };
      // const updatedMember = await supabaseApi.members.update(editingMember.id, updateData);
      // if (updatedMember) {
      //   setMembers(members.map(member =>
      //     member.id === editingMember.id ? updatedMember : member
      //   ));
      // }
      
      // Temporary local update
      setMembers(members.map(member =>
        member.id === editingMember.id
          ? { ...member, ...editForm }
          : member
      ));
      setIsEditModalVisible(false);
      setEditingMember(null);
    } catch (error) {
      console.error('Error updating member:', error);
    }
  };

  const deleteMember = (id: number) => {
    Alert.alert(
      'Delete Member',
      'Are you sure you want to delete this member?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // 🔧 TODO: delete member from Supabase
            setMembers(members.filter(member => member.id !== id));
          },
        },
      ]
    );
  };

  const addNewMember = () => {
    // 🔧 TODO: implement add new member functionality
    Alert.alert('Add Member', 'Add new member functionality will be implemented with Supabase integration');
  };

  const renderMember = ({ item }: { item: Member }) => (
    <View style={styles.memberCard}>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.first_name} {item.last_name}</Text>
        <Text style={styles.memberPhone}>{item.phone}</Text>
        <Text style={styles.memberJoinDate}>Joined: {new Date(item.created_at).toLocaleDateString()}</Text>
      </View>
      <View style={styles.memberActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: green }]}
          onPress={() => openEditModal(item)}
        >
          <Ionicons name="pencil" size={16} color={bg} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#FF4444' }]}
          onPress={() => deleteMember(item.id)}
        >
          <Ionicons name="trash" size={16} color={bg} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const styles = createStyles(responsive);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MEMBERS</Text>
        <Text style={styles.subtitle}>Member Management</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={green} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search members..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <TouchableOpacity style={styles.addButton} onPress={addNewMember}>
        <Ionicons name="add" size={20} color={bg} />
        <Text style={styles.addButtonText}>ADD MEMBER</Text>
      </TouchableOpacity>

      <FlatList
        data={filteredMembers}
        renderItem={renderMember}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.membersList}
        showsVerticalScrollIndicator={false}
        numColumns={responsive.gridColumns}
        columnWrapperStyle={responsive.gridColumns > 1 ? styles.row : undefined}
      />

      {/* Edit Member Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Member</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Name"
              placeholderTextColor="#666"
              value={`${editForm.first_name} ${editForm.last_name}`}
              onChangeText={(text) => {
                const parts = text.split(' ');
                setEditForm({ 
                  ...editForm, 
                  first_name: parts[0] || '', 
                  last_name: parts.slice(1).join(' ') || '' 
                });
              }}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Email"
              placeholderTextColor="#666"
              value={editForm.email}
              onChangeText={(text) => setEditForm({ ...editForm, email: text })}
              keyboardType="email-address"
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Phone"
              placeholderTextColor="#666"
              value={editForm.phone}
              onChangeText={(text) => setEditForm({ ...editForm, phone: text })}
              keyboardType="phone-pad"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#666' }]}
                onPress={() => setIsEditModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: green }]}
                onPress={saveMember}
              >
                <Text style={styles.modalButtonText}>SAVE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: responsive.margin.lg,
    paddingHorizontal: responsive.padding.md,
    paddingVertical: responsive.padding.sm,
    backgroundColor: darkGray,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: green,
  },
  searchIcon: {
    marginRight: responsive.margin.sm,
  },
  searchInput: {
    flex: 1,
    color: green,
    fontSize: responsive.fontSize.md,
    fontFamily: 'VT323_400Regular',
  },
  row: {
    justifyContent: 'space-between',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 12,
    backgroundColor: green,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: bg,
    fontSize: 16,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
  },
  membersList: {
    padding: 20,
  },
  memberCard: {
    backgroundColor: darkGray,
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: green,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    color: green,
    fontSize: 18,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  memberEmail: {
    color: green,
    fontSize: 14,
    fontFamily: 'VT323_400Regular',
    marginBottom: 2,
  },
  memberPhone: {
    color: '#999',
    fontSize: 14,
    fontFamily: 'VT323_400Regular',
    marginBottom: 2,
  },
  memberJoinDate: {
    color: '#666',
    fontSize: 12,
    fontFamily: 'VT323_400Regular',
  },
  memberActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 24,
    fontFamily: 'VT323_400Regular',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: bg,
    color: green,
    fontSize: 16,
    fontFamily: 'VT323_400Regular',
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: green,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    flex: 1,
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
