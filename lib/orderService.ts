import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

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
  member_id: string; // Changed to string for UUID
  pizza_name: string;
  pizza_price: number;
  time_slot: string;
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
      console.log('🍕 Creating order:', orderData);
      
      // Find the member by phone or use provided member_id
      const { data: member, error: memberError } = await supabase
        .from('members')
        .select('id, first_name, last_name, phone')
        .eq('phone', orderData.phone)
        .single();
      
      if (memberError && memberError.code === 'PGRST116') {
        console.log('⚠️ Member not found by phone, using member_id from order data');
        
        // Get member by ID instead
        const { data: memberById, error: memberByIdError } = await supabase
          .from('members')
          .select('id, first_name, last_name, phone')
          .eq('id', orderData.member_id)
          .single();
        
        if (memberByIdError) {
          console.error('❌ Member not found:', memberByIdError);
          return { success: false, error: 'Member not found' };
        }
        
        const memberId = memberById.id;
        const memberPhone = memberById.phone;
        
        // Create unique order ID
        const orderId = Date.now();
        
        // Store order in member's address field (temporary solution)
        const orderInfo = `ORDER_${orderId}: ${orderData.pizza_name} - $${orderData.pizza_price} at ${orderData.time_slot} on ${orderData.date}`;
        
        const { error: updateError } = await supabase
          .from('members')
          .update({ address: orderInfo })
          .eq('id', memberId);
        
        if (updateError) {
          console.error('❌ Order storage failed:', updateError);
          return { success: false, error: 'Order storage failed' };
        }
        
        console.log('✅ Order stored successfully!');
        
        // Send SMS confirmation
        const smsMessage = `🍕 Pizza Dojo Order Confirmed!
Order #${orderId}
${orderData.pizza_name} - $${orderData.pizza_price}
Pickup: ${orderData.time_slot} on ${orderData.date}
Location: 349 Eagle Dr (Hot Box by mailbox)
Thank you!`;
        
        const smsSent = await MockSMSService.sendSMS(memberPhone, smsMessage);
        
        if (!smsSent) {
          console.warn('⚠️ SMS confirmation failed, but order was created');
        }
        
        return { success: true, orderId: orderId };
      }
      
      const memberId = member.id;
      const memberPhone = member.phone;
      
      // Create unique order ID
      const orderId = Date.now();
      
      // Store order in member's address field (temporary solution)
      const orderInfo = `ORDER_${orderId}: ${orderData.pizza_name} - $${orderData.pizza_price} at ${orderData.time_slot} on ${orderData.date}`;
      
      const { error: updateError } = await supabase
        .from('members')
        .update({ address: orderInfo })
        .eq('id', memberId);
      
      if (updateError) {
        console.error('❌ Order storage failed:', updateError);
        return { success: false, error: 'Order storage failed' };
      }
      
      console.log('✅ Order stored successfully!');
      
      // Send SMS confirmation
      const smsMessage = `🍕 Pizza Dojo Order Confirmed!
Order #${orderId}
${orderData.pizza_name} - $${orderData.pizza_price}
Pickup: ${orderData.time_slot} on ${orderData.date}
Location: 349 Eagle Dr (Hot Box by mailbox)
Thank you!`;
      
      const smsSent = await MockSMSService.sendSMS(memberPhone, smsMessage);
      
      if (!smsSent) {
        console.warn('⚠️ SMS confirmation failed, but order was created');
      }
      
      return { success: true, orderId: orderId };
      
    } catch (error) {
      console.error('❌ Order service error:', error);
      return { success: false, error: 'Order creation failed' };
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
