// app/account.tsx
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import type { Member, UpdateMemberInput } from '../lib/supabaseTypes';
import { useResponsiveValues } from '../lib/responsive';
import BottomNav from '../components/BottomNav';

const green = "#00FF66";
const bg = "#001a00";
const darkGray = "#1a1a1a";

export default function Account() {
  const params = useLocalSearchParams<{ username?: string | string[] }>();
  const router = useRouter();
  const responsive = useResponsiveValues();
  
  // Handle username param - can be string or array in Expo Router
  const username = Array.isArray(params.username) 
    ? params.username[0] 
    : params.username;
  
  // State management
  const [member, setMember] = useState<Member | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
  });

  const isLoggedIn = !!username;

  // Fetch member data on component mount
  useEffect(() => {
    if (username) {
      fetchMemberData();
    } else {
      setLoading(false);
    }
  }, [username]);

  const fetchMemberData = async () => {
    try {
      setLoading(true);
      
      // Fetch member by username (since we don't have user_id yet)
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('username', username)
        .single();

      if (error) {
        console.error('Error fetching member data:', error);
        Alert.alert('Error', 'Could not load profile data');
      } else {
        setMember(data);
        setEditForm({
          first_name: data?.first_name || '',
          last_name: data?.last_name || '',
          email: '',
          phone: data?.phone || '',
          address: data?.address || '',
          password: '',
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (member) {
      setEditForm({
        first_name: member.first_name || '',
        last_name: member.last_name || '',
        email: '',
        phone: member.phone || '',
        address: member.address || '',
        password: '',
      });
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!member) return;

    try {
      setSaving(true);
      
      const updateData: any = {
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        email: editForm.email || undefined,
        phone: editForm.phone,
        address: editForm.address || undefined,
      };

      // Only update password if user entered a new one
      if (editForm.password.trim()) {
        updateData.password_hash = editForm.password;
      }

      // Update using username instead of id to avoid RLS issues
      const { data, error } = await supabase
        .from('members')
        .update(updateData)
        .eq('username', member.username)
        .select()
        .single();

      if (error) {
        console.error('Error updating member:', error);
        if (error.code === 'PGRST116') {
          Alert.alert('Error', 'Profile not found. Please try refreshing the page.');
        } else {
          Alert.alert('Error', `Could not update profile: ${error.message}`);
        }
        setSaving(false);
        return;
      }

      if (data) {
        setMember(data);
        setEditForm({
          ...editForm,
          password: '',
        });
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        Alert.alert('Error', 'No data returned from update');
        setSaving(false);
        return;
      }
    } catch (error: any) {
      console.error('Unexpected error:', error);
      Alert.alert('Error', `An unexpected error occurred: ${error.message}`);
      setSaving(false);
    }
  };

  const handleLogout = () => {
    console.log('Logout clicked');
    router.push('/login');
  };

  const styles = createStyles(responsive);

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={green} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show placeholder for non-logged-in users
  if (!isLoggedIn || !member) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>ACCOUNT</Text>
            <Text style={styles.subtitle}>User Profile</Text>
          </View>
          <View style={styles.noticeBar}>
            <Text style={styles.noticeText}>Please log in to view your profile</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>ACCOUNT</Text>
          <Text style={styles.subtitle}>User Profile</Text>
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PROFILE</Text>
          <View style={styles.card}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>First Name</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editForm.first_name}
                  onChangeText={(text) => setEditForm({...editForm, first_name: text})}
                  placeholder="Enter first name"
                  placeholderTextColor="rgba(0, 255, 102, 0.5)"
                />
              ) : (
                <Text style={styles.fieldValue}>{member.first_name}</Text>
              )}
            </View>
            
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Last Name</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editForm.last_name}
                  onChangeText={(text) => setEditForm({...editForm, last_name: text})}
                  placeholder="Enter last name"
                  placeholderTextColor="rgba(0, 255, 102, 0.5)"
                />
              ) : (
                <Text style={styles.fieldValue}>{member.last_name}</Text>
              )}
            </View>
            
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Username</Text>
              <Text style={styles.fieldValue}>{member.username}</Text>
            </View>
            
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Member Since</Text>
              <Text style={styles.fieldValue}>{new Date(member.created_at).toLocaleDateString()}</Text>
            </View>
          </View>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONTACT</Text>
          <View style={styles.card}>
            
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Phone</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editForm.phone}
                  onChangeText={(text) => setEditForm({...editForm, phone: text})}
                  placeholder="Enter phone number"
                  placeholderTextColor="rgba(0, 255, 102, 0.5)"
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={styles.fieldValue}>{member.phone}</Text>
              )}
            </View>
            
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Address</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editForm.address}
                  onChangeText={(text) => setEditForm({...editForm, address: text})}
                  placeholder="Enter address"
                  placeholderTextColor="rgba(0, 255, 102, 0.5)"
                  multiline
                  numberOfLines={2}
                />
              ) : (
                <Text style={styles.fieldValue}>{member.address || 'Not provided'}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Security Section - Only show when editing */}
        {isEditing && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SECURITY</Text>
            <View style={styles.card}>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>New Password</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.password}
                  onChangeText={(text) => setEditForm({...editForm, password: text})}
                  placeholder="Leave blank to keep current"
                  placeholderTextColor="rgba(0, 255, 102, 0.5)"
                />
                <Text style={styles.fieldHint}>Only fill this if you want to change your password</Text>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {isEditing ? (
            <>
              <TouchableOpacity 
                style={[styles.button, styles.saveButton]} 
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={bg} />
                ) : (
                  <Text style={[styles.buttonText, styles.saveButtonText]}>SAVE</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={handleCancel}
                disabled={saving}
              >
                <Text style={styles.buttonText}>CANCEL</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.button} onPress={handleEdit}>
                <Text style={styles.buttonText}>EDIT</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
                <Text style={styles.buttonText}>LOG OUT</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
      <BottomNav currentPage="account" username={username} />
    </SafeAreaView>
  );
}

const createStyles = (responsive: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: bg,
  },
  content: {
    padding: responsive.padding.lg,
  },
  header: {
    marginBottom: responsive.margin.xl,
    alignItems: 'center',
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
    opacity: 0.8,
    marginTop: 4,
  },
  noticeBar: {
    backgroundColor: 'rgba(0, 255, 102, 0.1)',
    borderWidth: 1,
    borderColor: green,
    padding: responsive.padding.md,
    marginBottom: responsive.margin.lg,
    borderRadius: 4,
  },
  noticeText: {
    color: green,
    fontSize: responsive.fontSize.md,
    fontFamily: 'VT323_400Regular',
    textAlign: 'center',
  },
  section: {
    marginBottom: responsive.margin.xl,
  },
  sectionTitle: {
    color: green,
    fontSize: responsive.fontSize.xl,
    fontFamily: 'VT323_400Regular',
    marginBottom: responsive.margin.sm,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: darkGray,
    padding: responsive.padding.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: green,
    shadowColor: green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  field: {
    marginBottom: responsive.margin.md,
  },
  fieldLabel: {
    color: green,
    fontSize: responsive.fontSize.md,
    fontFamily: 'VT323_400Regular',
    opacity: 0.8,
    marginBottom: 4,
  },
  fieldValue: {
    color: green,
    fontSize: responsive.fontSize.lg,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
  },
  fieldHint: {
    color: green,
    fontSize: responsive.fontSize.sm,
    fontFamily: 'VT323_400Regular',
    opacity: 0.6,
    marginTop: 4,
    fontStyle: 'italic',
  },
  statusBadge: {
    paddingHorizontal: responsive.padding.md,
    paddingVertical: responsive.padding.xs,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: bg,
    fontSize: responsive.fontSize.sm,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginTop: responsive.margin.lg,
    gap: responsive.margin.md,
  },
  button: {
    backgroundColor: darkGray,
    paddingVertical: responsive.padding.md,
    paddingHorizontal: responsive.padding.xl,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: green,
    alignItems: 'center',
    minHeight: responsive.touchTarget,
    justifyContent: 'center',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderColor: '#FF4444',
  },
  saveButton: {
    backgroundColor: green,
    borderColor: green,
  },
  saveButtonText: {
    color: bg,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonText: {
    color: green,
    fontSize: responsive.fontSize.lg,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
  },
  
  // Input styles
  input: {
    borderWidth: 1,
    borderColor: green,
    borderRadius: 4,
    paddingHorizontal: responsive.padding.md,
    paddingVertical: responsive.padding.sm,
    fontSize: responsive.fontSize.lg,
    fontFamily: 'VT323_400Regular',
    color: green,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    minHeight: responsive.touchTarget,
  },
  
  // Loading styles
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
    marginTop: responsive.margin.md,
  },
});