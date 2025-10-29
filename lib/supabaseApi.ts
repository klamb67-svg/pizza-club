// lib/supabaseApi.ts
import { supabase } from './supabase';
import type {
  Member,
  Order,
  Pizza,
  TimeSlot,
  Night,
  Setting,
  OrderWithDetails,
  TimeSlotWithOrder,
  NightWithSlots,
  CreateMemberInput,
  UpdateMemberInput,
  CreateOrderInput,
  CreatePizzaInput,
  UpdatePizzaInput,
  CreateTimeSlotInput,
  CreateNightInput,
  CreateSettingInput,
} from './supabaseTypes';

// ==============================================
// MEMBERS API
// ==============================================

export const membersApi = {
  // Get all members
  async getAll(): Promise<Member[]> {
    try {
      // 🔧 TODO: Add admin authentication check
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching members:', error);
      return [];
    }
  },

  // Get member by ID
  async getById(id: number): Promise<Member | null> {
    try {
      // 🔧 TODO: Add admin authentication check
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching member:', error);
      return null;
    }
  },

  // Create new member
  async create(member: CreateMemberInput): Promise<Member | null> {
    try {
      // 🔧 TODO: Add admin authentication check
      const { data, error } = await supabase
        .from('members')
        .insert([member])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating member:', error);
      return null;
    }
  },

  // Update member
  async update(id: number, updates: UpdateMemberInput): Promise<Member | null> {
    try {
      // 🔧 TODO: Add admin authentication check
      const { data, error } = await supabase
        .from('members')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating member:', error);
      return null;
    }
  },

  // Delete member
  async delete(id: number): Promise<boolean> {
    try {
      // 🔧 TODO: Add admin authentication check
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting member:', error);
      return false;
    }
  },

  // Search members
  async search(query: string): Promise<Member[]> {
    try {
      // 🔧 TODO: Add admin authentication check
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching members:', error);
      return [];
    }
  },
};

// ==============================================
// ORDERS API
// ==============================================

export const ordersApi = {
  // Get all orders with joined data
  async getAll(): Promise<OrderWithDetails[]> {
    try {
      // 🔧 TODO: Add admin authentication check
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          members!inner(name),
          pizzas!inner(name),
          time_slots!inner(start_time),
          nights!inner(date)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform joined data
      return (data || []).map(order => ({
        ...order,
        member_name: order.members?.name,
        pizza_name: order.pizzas?.name,
        time_slot_start: order.time_slots?.start_time,
        time_slot_end: order.time_slots?.end_time,
        night_date: order.nights?.date,
        night_day: order.nights?.day_of_week,
        // 🔧 TODO: Add missing field mappings for member_phone, pizza_price when database schema is finalized
      }));
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  },

  // Get orders by status
  async getByStatus(status: Order['status']): Promise<OrderWithDetails[]> {
    try {
      // 🔧 TODO: Add admin authentication check
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          members!inner(name),
          pizzas!inner(name),
          time_slots!inner(start_time),
          nights!inner(date)
        `)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(order => ({
        ...order,
        member_name: order.members?.name,
        pizza_name: order.pizzas?.name,
        time_slot_start: order.time_slots?.start_time,
        time_slot_end: order.time_slots?.end_time,
        night_date: order.nights?.date,
        night_day: order.nights?.day_of_week,
        // 🔧 TODO: Add missing field mappings for member_phone, pizza_price when database schema is finalized
      }));
    } catch (error) {
      console.error('Error fetching orders by status:', error);
      return [];
    }
  },

  // Create new order
  async create(order: CreateOrderInput): Promise<Order | null> {
    try {
      // 🔧 TODO: Add admin authentication check
      const { data, error } = await supabase
        .from('orders')
        .insert([order])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      return null;
    }
  },

  // Update order status
  async updateStatus(id: number, status: Order['status']): Promise<Order | null> {
    try {
      // 🔧 TODO: Add admin authentication check
      const { data, error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating order status:', error);
      return null;
    }
  },

  // Delete order
  async delete(id: number): Promise<boolean> {
    try {
      // 🔧 TODO: Add admin authentication check
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting order:', error);
      return false;
    }
  },
};

// ==============================================
// MENU/PIZZAS API
// ==============================================

export const menuApi = {
  // Get all pizzas
  async getAll(): Promise<Pizza[]> {
    try {
      // 🔧 TODO: Add admin authentication check
      const { data, error } = await supabase
        .from('pizzas')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching pizzas:', error);
      return [];
    }
  },

  // Get available pizzas only
  async getAvailable(): Promise<Pizza[]> {
    try {
      // 🔧 TODO: Add admin authentication check
      const { data, error } = await supabase
        .from('pizzas')
        .select('*')
        .eq('available', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching available pizzas:', error);
      return [];
    }
  },

  // Create new pizza
  async create(pizza: CreatePizzaInput): Promise<Pizza | null> {
    try {
      // 🔧 TODO: Add admin authentication check
      const { data, error } = await supabase
        .from('pizzas')
        .insert([pizza])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating pizza:', error);
      return null;
    }
  },

  // Update pizza
  async update(id: number, updates: UpdatePizzaInput): Promise<Pizza | null> {
    try {
      // 🔧 TODO: Add admin authentication check
      const { data, error } = await supabase
        .from('pizzas')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating pizza:', error);
      return null;
    }
  },

  // Toggle pizza availability
  async toggleAvailability(id: number): Promise<Pizza | null> {
    try {
      // 🔧 TODO: Add admin authentication check
      const { data: currentPizza, error: fetchError } = await supabase
        .from('pizzas')
        .select('available')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const { data, error } = await supabase
        .from('pizzas')
        .update({ 
          available: !currentPizza.available, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error toggling pizza availability:', error);
      return null;
    }
  },

  // Delete pizza
  async delete(id: number): Promise<boolean> {
    try {
      // 🔧 TODO: Add admin authentication check
      const { error } = await supabase
        .from('pizzas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting pizza:', error);
      return false;
    }
  },
};

// ==============================================
// SCHEDULE/TIME SLOTS API
// ==============================================

export const scheduleApi = {
  // Get all time slots for a specific night
  async getByNight(nightId: number): Promise<TimeSlot[]> {
    try {
      // 🔧 TODO: Add admin authentication check
      const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .eq('night_id', nightId)
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching time slots:', error);
      return [];
    }
  },

  // Get available time slots for a night
  async getAvailableByNight(nightId: number): Promise<TimeSlot[]> {
    try {
      // 🔧 TODO: Add admin authentication check
      const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .eq('night_id', nightId)
        .eq('is_available', true)
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching available time slots:', error);
      return [];
    }
  },

  // Assign order to time slot
  async assignOrder(timeSlotId: number, orderId: number): Promise<boolean> {
    try {
      // 🔧 TODO: Add admin authentication check
      const { error } = await supabase
        .from('time_slots')
        .update({ 
          is_available: false, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', timeSlotId);

      if (error) throw error;

      // Update order with time slot
      const { error: orderError } = await supabase
        .from('orders')
        .update({ 
          time_slot_id: timeSlotId, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderId);

      if (orderError) throw orderError;
      return true;
    } catch (error) {
      console.error('Error assigning order to time slot:', error);
      return false;
    }
  },

  // Release time slot
  async releaseTimeSlot(timeSlotId: number): Promise<boolean> {
    try {
      // 🔧 TODO: Add admin authentication check
      const { error } = await supabase
        .from('time_slots')
        .update({ 
          is_available: true, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', timeSlotId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error releasing time slot:', error);
      return false;
    }
  },
};

// ==============================================
// NIGHTS API
// ==============================================

export const nightsApi = {
  // Get all nights
  async getAll(): Promise<Night[]> {
    try {
      // 🔧 TODO: Add admin authentication check
      const { data, error } = await supabase
        .from('nights')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching nights:', error);
      return [];
    }
  },

  // Get active nights
  async getActive(): Promise<Night[]> {
    try {
      // 🔧 TODO: Add admin authentication check
      const { data, error } = await supabase
        .from('nights')
        .select('*')
        .eq('is_active', true)
        .order('date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching active nights:', error);
      return [];
    }
  },

  // Create new night
  async create(night: CreateNightInput): Promise<Night | null> {
    try {
      // 🔧 TODO: Add admin authentication check
      const { data, error } = await supabase
        .from('nights')
        .insert([night])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating night:', error);
      return null;
    }
  },

  // Update night
  async update(id: number, updates: Partial<Night>): Promise<Night | null> {
    try {
      // 🔧 TODO: Add admin authentication check
      const { data, error } = await supabase
        .from('nights')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating night:', error);
      return null;
    }
  },
};

// ==============================================
// SETTINGS API
// ==============================================

export const settingsApi = {
  // Get all settings
  async getAll(): Promise<Setting[]> {
    try {
      // 🔧 TODO: Add admin authentication check
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .order('key', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching settings:', error);
      return [];
    }
  },

  // Get setting by key
  async getByKey(key: string): Promise<Setting | null> {
    try {
      // 🔧 TODO: Add admin authentication check
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('key', key)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching setting:', error);
      return null;
    }
  },

  // Update setting
  async update(key: string, value: string): Promise<Setting | null> {
    try {
      // 🔧 TODO: Add admin authentication check
      const { data, error } = await supabase
        .from('settings')
        .update({ 
          value, 
          updated_at: new Date().toISOString() 
        })
        .eq('key', key)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating setting:', error);
      return null;
    }
  },

  // Create new setting
  async create(setting: CreateSettingInput): Promise<Setting | null> {
    try {
      // 🔧 TODO: Add admin authentication check
      const { data, error } = await supabase
        .from('settings')
        .insert([setting])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating setting:', error);
      return null;
    }
  },
};

// ==============================================
// EXPORT ALL APIs
// ==============================================

export const supabaseApi = {
  members: membersApi,
  orders: ordersApi,
  menu: menuApi,
  schedule: scheduleApi,
  nights: nightsApi,
  settings: settingsApi,
};

export default supabaseApi;
