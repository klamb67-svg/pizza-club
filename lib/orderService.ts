import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from './supabaseAdmin';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://bvmwcswddbepelgctybs.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2bXdjc3dkZGJlcGVsZ2N0eWJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3OTgzMjYsImV4cCI6MjA3MDM3NDMyNn0._eI2GVgkTRZoD7J1Y-LurfIPPwqrJBVBuERfDB5uNL8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// SMS Service Interface
export interface SMSConfig {
  provider: 'twilio' | 'supabase_edge' | 'mock';
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioPhoneNumber?: string;
}

// Mock SMS service for development
export class MockSMSService {
  static async sendSMS(phone: string, message: string): Promise<boolean> {
    console.log(`📱 MOCK SMS to ${phone}: ${message}`);
    return true;
  }
}

// Twilio SMS service
export class TwilioSMSService {
  private config: SMSConfig;
  
  constructor(config: SMSConfig) {
    this.config = config;
  }
  
  async sendSMS(phone: string, message: string): Promise<boolean> {
    try {
      // For now, use mock service
      console.log(`📱 TWILIO SMS to ${phone}: ${message}`);
      return true;
    } catch (error) {
      console.error('SMS sending failed:', error);
      return false;
    }
  }
}

// Order Service - Updated for existing database schema
export interface OrderData {
  member_id: string;
  pizza_name: string;
  pizza_price: number;
  time_slot: string;
  time_slot_id?: string; // NEW: Direct time slot ID from menu
  date: string;
  phone: string;
  special_instructions?: string;
}

export class OrderService {
  private smsService: MockSMSService | TwilioSMSService;
  
  constructor(smsConfig: SMSConfig = { provider: 'mock' }) {
    if (smsConfig.provider === 'twilio') {
      this.smsService = new TwilioSMSService(smsConfig);
    } else {
      this.smsService = new MockSMSService();
    }
  }
  
  async createOrder(orderData: OrderData): Promise<{ success: boolean; orderId?: number; error?: string }> {
    try {
      console.log('🍕 OrderService: Creating order:', orderData);
      
      // Find the member by phone or use provided member_id
      let memberId: number | string | undefined;
      let memberPhone: string | undefined;
      
      // If member_id is provided and not "0", try that first
      if (orderData.member_id && orderData.member_id !== "0") {
        console.log('🔍 Looking up member by ID:', orderData.member_id);
        const { data: memberById, error: memberByIdError } = await supabase
          .from('members')
          .select('id, first_name, last_name, phone')
          .eq('id', orderData.member_id)
          .single();
        
        if (!memberByIdError && memberById) {
          memberId = memberById.id;
          memberPhone = memberById.phone || orderData.phone;
          console.log('✅ Found member by ID:', { memberId, memberPhone });
        } else {
          console.warn('⚠️ Member not found by ID, trying phone:', memberByIdError);
        }
      }
      
      // If we don't have a member yet, try by phone
      if (!memberId) {
        console.log('🔍 Looking up member by phone:', orderData.phone);
        const { data: member, error: memberError } = await supabase
          .from('members')
          .select('id, first_name, last_name, phone')
          .eq('phone', orderData.phone)
          .single();
        
        if (memberError && memberError.code === 'PGRST116') {
          console.error('❌ Member not found by phone or ID');
          return { success: false, error: 'Member not found. Please ensure you are logged in and your phone number is correct.' };
        } else if (memberError) {
          console.error('❌ Error finding member by phone:', memberError);
          return { success: false, error: `Error finding member account: ${memberError.message}` };
        } else if (member) {
          memberId = member.id;
          memberPhone = member.phone;
          console.log('✅ Found member by phone:', { memberId, memberPhone });
        }
      }
      
      // Final check - if we still don't have a member, fail
      if (!memberId || !memberPhone) {
        console.error('❌ Could not find member with provided data');
        return { success: false, error: 'Could not find your member account. Please log in again.' };
      }
      
      console.log('✅ Found member:', { memberId, memberPhone, memberIdType: typeof memberId });
      
      // Database uses UUID for member_id, not INTEGER - use it directly
      const memberIdUuid = String(memberId);
      console.log('📝 Using member_id (UUID):', memberIdUuid);
      
      // Look up pizza_id from pizzas table by name
      let pizzaNameBase = orderData.pizza_name.trim();
      
      // Remove " Pizza" suffix (with space)
      if (pizzaNameBase.toLowerCase().endsWith(' pizza')) {
        pizzaNameBase = pizzaNameBase.slice(0, -6).trim();
      }
      // Remove "Pizza" suffix (no space)
      else if (pizzaNameBase.toLowerCase().endsWith('pizza')) {
        pizzaNameBase = pizzaNameBase.slice(0, -5).trim();
      }
      // Try regex as fallback
      else {
        pizzaNameBase = pizzaNameBase.replace(/\s+Pizza$/i, '').trim();
      }
      
      console.log('🔍 Pizza lookup:', {
        original: orderData.pizza_name,
        stripped: pizzaNameBase,
        length: pizzaNameBase.length
      });
      
      // Fetch pizzas from database
      console.log('🔍 Fetching pizzas from database...');
      const { data: allPizzas, error: allPizzasError } = await supabase
        .from('pizzas')
        .select('id, name, is_active');
      
      if (allPizzasError) {
        console.error('❌ Error fetching all pizzas:', allPizzasError);
        
        if (allPizzasError.code === '42501' || allPizzasError.message.includes('row-level security') || allPizzasError.message.includes('RLS')) {
          return { 
            success: false, 
            error: `Permission denied: Cannot read pizzas table. RLS policy may be blocking access. Error: ${allPizzasError.message}` 
          };
        }
        
        return { 
          success: false, 
          error: `Database error: Could not fetch pizzas. ${allPizzasError.message} (Code: ${allPizzasError.code})` 
        };
      }
      
      console.log('📋 Pizzas query result:', {
        count: allPizzas?.length || 0,
        pizzas: allPizzas?.map(p => ({ name: p.name, id: p.id, is_active: p.is_active })) || []
      });
      
      if (!allPizzas || allPizzas.length === 0) {
        console.error('❌ No pizzas returned from query');
        return { 
          success: false, 
          error: 'No pizzas found in database. This may be an RLS policy issue. Please check pizzas table permissions.' 
        };
      }
      
      // Find best match
      let pizza = null;
      const searchName = pizzaNameBase.toLowerCase().trim();
      console.log('🔍 Searching for:', searchName);
      
      // Strategy 1: Exact match (case insensitive)
      pizza = allPizzas.find(p => {
        const dbName = p.name.toLowerCase().trim();
        const match = dbName === searchName && p.is_active;
        if (match) console.log(`✅ Exact match: "${p.name}" === "${pizzaNameBase}"`);
        return match;
      });
      
      if (!pizza) {
        // Strategy 2: Reverse contains
        pizza = allPizzas.find(p => {
          const dbName = p.name.toLowerCase().trim();
          const match = searchName.includes(dbName) && p.is_active;
          if (match) console.log(`✅ Reverse match: "${searchName}" contains "${dbName}"`);
          return match;
        });
      }
      
      if (!pizza) {
        // Strategy 3: Pizza name contains search term
        pizza = allPizzas.find(p => {
          const dbName = p.name.toLowerCase().trim();
          const match = dbName.includes(searchName) && p.is_active;
          if (match) console.log(`✅ Contains match: "${dbName}" contains "${searchName}"`);
          return match;
        });
      }
      
      if (!pizza) {
        // Strategy 4: First word match
        const firstWord = searchName.split(' ')[0];
        pizza = allPizzas.find(p => {
          const dbName = p.name.toLowerCase().trim();
          const match = dbName === firstWord && p.is_active;
          if (match) console.log(`✅ First word match: "${dbName}" === "${firstWord}"`);
          return match;
        });
      }
      
      let pizzaId: string | null = null;
      
      if (pizza) {
        pizzaId = pizza.id;
        console.log('✅ Found pizza:', { id: pizzaId, name: pizza.name });
      } else {
        console.error('❌ Pizza lookup completely failed');
        console.error('❌ Searched for:', pizzaNameBase);
        console.error('❌ Available pizzas:', allPizzas.map(p => p.name));
        
        return { 
          success: false, 
          error: `Pizza "${orderData.pizza_name}" not found. Available pizzas: ${allPizzas.map(p => p.name).join(', ')}` 
        };
      }
      
      // USE THE TIME SLOT ID DIRECTLY IF PROVIDED (from menu selection)
      let timeSlotId: string | null = orderData.time_slot_id || null;
      
      if (timeSlotId) {
        console.log('✅ Using provided time_slot_id:', timeSlotId);
        
        // Verify the time slot exists and is available
        const { data: slotCheck, error: slotCheckError } = await supabase
          .from('time_slots')
          .select('id, is_available, current_orders, max_orders')
          .eq('id', timeSlotId)
          .single();
        
        if (slotCheckError || !slotCheck) {
          console.error('❌ Time slot verification failed:', slotCheckError);
          return {
            success: false,
            error: `Time slot not found. Please go back and select a different time.`
          };
        }
        
        if (!slotCheck.is_available || slotCheck.current_orders >= slotCheck.max_orders) {
          console.error('❌ Time slot is no longer available');
          return {
            success: false,
            error: `This time slot is no longer available. Please select a different time.`
          };
        }
        
        console.log('✅ Time slot verified:', slotCheck);
      } else {
        // Fallback: No time_slot_id provided, fail gracefully
        console.error('❌ No time_slot_id provided');
        return {
          success: false,
          error: 'Time slot ID is missing. Please go back to the menu and select a time slot.'
        };
      }
      
      console.log('📝 Inserting order with schema:', {
        member_id: memberIdUuid,
        pizza_id: pizzaId,
        time_slot_id: timeSlotId,
        status: 'pending',
        delivery_or_pickup: 'pickup',
      });
      
      // Insert order into orders table
      const { data: insertedOrder, error: insertError } = await supabase
        .from('orders')
        .insert([
          {
            member_id: memberIdUuid,
            pizza_id: pizzaId,
            time_slot_id: timeSlotId,
            delivery_or_pickup: 'pickup',
            status: 'pending',
          },
        ])
        .select()
        .single();
      
      if (insertError) {
        console.error('❌ Order insert failed:', insertError);
        console.error('❌ Insert error code:', insertError.code);
        
        if (insertError.code === '42501' || insertError.message.includes('permission') || insertError.message.includes('row-level security')) {
          return { 
            success: false, 
            error: `Permission denied (RLS). The orders table has Row Level Security enabled. Error: ${insertError.message}. Code: ${insertError.code}` 
          };
        }
        
        if (insertError.code === '23503' || insertError.message.includes('foreign key')) {
          return { 
            success: false, 
            error: `Foreign key constraint error. ${insertError.message}. Code: ${insertError.code}` 
          };
        }
        
        if (insertError.code === '23502' || insertError.message.includes('null value')) {
          return { 
            success: false, 
            error: `Required field is missing. ${insertError.message}. Code: ${insertError.code}` 
          };
        }
        
        return { 
          success: false, 
          error: `Order creation failed: ${insertError.message} (Code: ${insertError.code})` 
        };
      }
      
      console.log('✅ Order created successfully in database:', insertedOrder);
      const orderId = insertedOrder.id;
      
      // Increment current_orders on time slot using admin client (bypasses RLS)
      if (timeSlotId) {
        const { data: currentSlot, error: fetchError } = await supabaseAdmin
          .from('time_slots')
          .select('current_orders')
          .eq('id', timeSlotId)
          .single();
        
        if (!fetchError && currentSlot) {
          const { error: incrementError } = await supabaseAdmin
            .from('time_slots')
            .update({
              current_orders: (currentSlot.current_orders || 0) + 1
            })
            .eq('id', timeSlotId);
          
          if (incrementError) {
            console.error('Could not update time slot:', incrementError);
            // Don't fail the order, just log the error
          } else {
            console.log('✅ Time slot current_orders incremented successfully');
          }
        } else {
          console.error('Could not fetch time slot:', fetchError);
        }
      }
      
      // Send SMS confirmation
      const smsMessage = `🍕 Pizza Dojo Order Confirmed!
Order #${orderId}
${orderData.pizza_name} - $${orderData.pizza_price}
Pickup: ${orderData.time_slot} on ${orderData.date}
Location: 349 Eagle Dr (Hot Box by mailbox)
Thank you!`;
      
      const smsSent = await MockSMSService.sendSMS(memberPhone!, smsMessage);
      
      if (!smsSent) {
        console.warn('⚠️ SMS confirmation failed, but order was created');
      }
      
      return { success: true, orderId: orderId };
      
    } catch (error: any) {
      console.error('❌ Order service error:', error);
      return { success: false, error: error?.message || 'Order creation failed' };
    }
  }
  
  async getOrderById(orderId: number): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  }
  
  async updateOrderStatus(orderId: number, status: 'pending' | 'in_progress' | 'completed' | 'cancelled'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  }
}

// Export default instance
export const orderService = new OrderService();