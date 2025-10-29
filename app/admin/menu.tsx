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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Pizza, CreatePizzaInput, UpdatePizzaInput } from '../../lib/supabaseTypes';
import { supabaseApi } from '../../lib/supabaseApi';

const green = "#00FF66";
const bg = "#001a00";
const darkGray = "#1a1a1a";

// 🔧 TODO: replace mock data with Supabase query
const sampleMenuItems: Pizza[] = [
  { 
    id: 1, 
    name: 'Pepperoni', 
    description: 'Classic pepperoni with mozzarella', 
    price: 18.99,
    image_url: 'https://via.placeholder.com/150x100/00FF66/001a00?text=Pepperoni',
    available: true,
    category: 'classic',
    ingredients: ['pepperoni', 'mozzarella', 'tomato sauce'],
    size_options: ['small', 'medium', 'large'],
    is_featured: true,
    preparation_time: 15,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  { 
    id: 2, 
    name: 'Margherita', 
    description: 'Fresh basil, mozzarella, and tomato sauce', 
    price: 16.99,
    image_url: 'https://via.placeholder.com/150x100/00FF66/001a00?text=Margherita',
    available: true,
    category: 'classic',
    ingredients: ['fresh basil', 'mozzarella', 'tomato sauce'],
    size_options: ['small', 'medium', 'large'],
    is_featured: false,
    preparation_time: 12,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  { 
    id: 3, 
    name: 'Meatball', 
    description: 'Homemade meatballs with marinara', 
    price: 20.99,
    image_url: 'https://via.placeholder.com/150x100/00FF66/001a00?text=Meatball',
    available: true,
    category: 'meat_lovers',
    ingredients: ['meatballs', 'marinara', 'mozzarella'],
    size_options: ['small', 'medium', 'large'],
    is_featured: true,
    preparation_time: 18,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  { 
    id: 4, 
    name: 'Supreme', 
    description: 'Pepperoni, sausage, peppers, onions, mushrooms', 
    price: 22.99,
    image_url: 'https://via.placeholder.com/150x100/00FF66/001a00?text=Supreme',
    available: false,
    category: 'meat_lovers',
    ingredients: ['pepperoni', 'sausage', 'peppers', 'onions', 'mushrooms'],
    size_options: ['small', 'medium', 'large'],
    is_featured: false,
    preparation_time: 20,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  { 
    id: 5, 
    name: 'Hawaiian', 
    description: 'Ham, pineapple, and mozzarella', 
    price: 19.99,
    image_url: 'https://via.placeholder.com/150x100/00FF66/001a00?text=Hawaiian',
    available: true,
    category: 'specialty',
    ingredients: ['ham', 'pineapple', 'mozzarella'],
    size_options: ['small', 'medium', 'large'],
    is_featured: false,
    preparation_time: 16,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function Menu() {
  const [menuItems, setMenuItems] = useState<Pizza[]>([]);
  const [editingItem, setEditingItem] = useState<Pizza | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({ 
    name: '', 
    description: '', 
    price: '', 
    available: true 
  });
  const [loading, setLoading] = useState(true);

  // 🔧 TODO: Add SUPABASE_URL and SUPABASE_ANON_KEY environment variables
  // 🔧 TODO: Add admin authentication check before loading menu items
  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      // 🔧 TODO: Replace with real Supabase query when environment variables are configured
      // const menuData = await supabaseApi.menu.getAll();
      // setMenuItems(menuData);
      
      // Temporary fallback to mock data
      setMenuItems(sampleMenuItems);
    } catch (error) {
      console.error('Error loading menu items:', error);
      // Fallback to mock data on error
      setMenuItems(sampleMenuItems);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (item: Pizza) => {
    setEditingItem(item);
    setEditForm({ 
      name: item.name, 
      description: item.description, 
      price: item.price.toString(), 
      available: item.available 
    });
    setIsEditModalVisible(true);
  };

  const saveMenuItem = () => {
    if (!editingItem) return;

    // 🔧 TODO: update menu item in Supabase
    setMenuItems(menuItems.map(item =>
      item.id === editingItem.id
        ? { 
            ...item, 
            name: editForm.name,
            description: editForm.description,
            price: parseFloat(editForm.price),
            available: editForm.available
          }
        : item
    ));
    setIsEditModalVisible(false);
    setEditingItem(null);
  };

  const deleteMenuItem = (id: number) => {
    Alert.alert(
      'Delete Menu Item',
      'Are you sure you want to delete this menu item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // 🔧 TODO: delete menu item from Supabase
            setMenuItems(menuItems.filter(item => item.id !== id));
          },
        },
      ]
    );
  };

  const toggleAvailability = (id: number) => {
    // 🔧 TODO: update availability in Supabase
    setMenuItems(menuItems.map(item =>
      item.id === id ? { ...item, available: !item.available } : item
    ));
  };

  const addNewMenuItem = () => {
    // 🔧 TODO: implement add new menu item functionality
    Alert.alert('Add Menu Item', 'Add new menu item functionality will be implemented with Supabase integration');
  };

  const uploadImage = () => {
    // 🔧 TODO: implement image upload functionality
    Alert.alert('Upload Image', 'Image upload functionality will be implemented with Supabase storage');
  };

  const renderMenuItem = ({ item }: { item: Pizza }) => (
    <View style={[styles.menuCard, !item.available && styles.unavailableCard]}>
      <Image source={{ uri: item.image_url }} style={styles.menuImage} />
      <View style={styles.menuInfo}>
        <View style={styles.menuHeader}>
          <Text style={[styles.menuName, !item.available && styles.unavailableText]}>
            {item.name}
          </Text>
          <TouchableOpacity
            style={[styles.availabilityButton, { 
              backgroundColor: item.available ? green : '#FF4444' 
            }]}
            onPress={() => toggleAvailability(item.id)}
          >
            <Text style={styles.availabilityText}>
              {item.available ? 'AVAILABLE' : 'UNAVAILABLE'}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.menuDescription, !item.available && styles.unavailableText]}>
          {item.description}
        </Text>
        <Text style={[styles.menuPrice, !item.available && styles.unavailableText]}>
          ${item.price.toFixed(2)}
        </Text>
        <View style={styles.menuActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: green }]}
            onPress={() => openEditModal(item)}
          >
            <Ionicons name="pencil" size={16} color={bg} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#FF4444' }]}
            onPress={() => deleteMenuItem(item.id)}
          >
            <Ionicons name="trash" size={16} color={bg} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MENU</Text>
        <Text style={styles.subtitle}>Pizza Management</Text>
      </View>

      <TouchableOpacity style={styles.addButton} onPress={addNewMenuItem}>
        <Ionicons name="add" size={20} color={bg} />
        <Text style={styles.addButtonText}>ADD PIZZA</Text>
      </TouchableOpacity>

      <FlatList
        data={menuItems}
        renderItem={renderMenuItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.menuList}
        showsVerticalScrollIndicator={false}
      />

      {/* Edit Menu Item Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Menu Item</Text>
            
            <TouchableOpacity style={styles.imageUploadButton} onPress={uploadImage}>
              <Ionicons name="camera" size={24} color={green} />
              <Text style={styles.imageUploadText}>Upload Card Image</Text>
            </TouchableOpacity>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Pizza Name"
              placeholderTextColor="#666"
              value={editForm.name}
              onChangeText={(text) => setEditForm({ ...editForm, name: text })}
            />
            
            <TextInput
              style={[styles.modalInput, styles.descriptionInput]}
              placeholder="Description"
              placeholderTextColor="#666"
              value={editForm.description}
              onChangeText={(text) => setEditForm({ ...editForm, description: text })}
              multiline
              numberOfLines={3}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Price"
              placeholderTextColor="#666"
              value={editForm.price}
              onChangeText={(text) => setEditForm({ ...editForm, price: text })}
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={[styles.availabilityToggle, { 
                backgroundColor: editForm.available ? green : '#FF4444' 
              }]}
              onPress={() => setEditForm({ ...editForm, available: !editForm.available })}
            >
              <Text style={styles.availabilityToggleText}>
                {editForm.available ? 'AVAILABLE' : 'UNAVAILABLE'}
              </Text>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#666' }]}
                onPress={() => setIsEditModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: green }]}
                onPress={saveMenuItem}
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
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
  menuList: {
    padding: 20,
  },
  menuCard: {
    backgroundColor: darkGray,
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: green,
    flexDirection: 'row',
  },
  unavailableCard: {
    opacity: 0.6,
    borderColor: '#666',
  },
  menuImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  menuInfo: {
    flex: 1,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuName: {
    color: green,
    fontSize: 18,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
    flex: 1,
  },
  unavailableText: {
    color: '#666',
  },
  availabilityButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  availabilityText: {
    color: bg,
    fontSize: 10,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
  },
  menuDescription: {
    color: green,
    fontSize: 14,
    fontFamily: 'VT323_400Regular',
    marginBottom: 4,
  },
  menuPrice: {
    color: green,
    fontSize: 16,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  menuActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    color: green,
    fontSize: 24,
    fontFamily: 'VT323_400Regular',
    textAlign: 'center',
    marginBottom: 20,
  },
  imageUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: bg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: green,
    borderStyle: 'dashed',
    marginBottom: 15,
    gap: 8,
  },
  imageUploadText: {
    color: green,
    fontSize: 14,
    fontFamily: 'VT323_400Regular',
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
  descriptionInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  availabilityToggle: {
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 20,
  },
  availabilityToggleText: {
    color: bg,
    fontSize: 14,
    fontFamily: 'VT323_400Regular',
    fontWeight: 'bold',
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
