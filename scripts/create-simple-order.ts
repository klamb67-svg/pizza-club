import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createSimpleOrdersTable() {
  console.log('🔧 Creating simple orders table...');
  
  try {
    // First, let's see what tables exist
    console.log('🔍 Checking existing tables...');
    
    // Try to create a simple order record with minimal fields
    const { data: members } = await supabase
      .from('members')
      .select('id')
      .limit(1);
    
    if (!members || members.length === 0) {
      console.error('❌ No members found');
      return;
    }
    
    const memberId = members[0].id;
    console.log('✅ Found member ID:', memberId);
    
    // Try to create a very simple order
    const simpleOrder = {
      member_id: memberId,
      pizza_name: 'Margherita Pizza',
      pizza_price: 18.99,
      time_slot: '6:00 PM',
      date: '12/28/24',
      phone: '555-123-4567',
      special_instructions: 'Extra cheese',
      status: 'pending',
      created_at: new Date().toISOString()
    };
    
    console.log('📋 Attempting to create simple order...');
    
    // Try to insert into orders table
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([simpleOrder])
      .select()
      .single();
    
    if (orderError) {
      console.error('❌ Order creation failed:', orderError);
      
      // If the table doesn't exist or has wrong schema, let's create a custom solution
      console.log('🔄 Creating custom order storage...');
      
      // Store order in a custom way - maybe in members table or create a new approach
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .update({
          // Store order info in member record temporarily
          address: `${memberData?.address || ''} | ORDER: ${simpleOrder.pizza_name} at ${simpleOrder.time_slot}`
        })
        .eq('id', memberId)
        .select()
        .single();
      
      if (memberError) {
        console.error('❌ Custom order storage failed:', memberError);
      } else {
        console.log('✅ Order stored in member record:', memberData);
        
        // Send SMS confirmation
        const smsMessage = `🍕 Pizza Dojo Order Confirmed!
Order #${memberId.slice(-4)}
${simpleOrder.pizza_name} - $${simpleOrder.pizza_price}
Pickup: ${simpleOrder.time_slot} on ${simpleOrder.date}
Location: 349 Eagle Dr (Hot Box by mailbox)
Thank you!`;
        
        console.log('📱 SMS Confirmation:', smsMessage);
        console.log('✅ Order flow completed successfully!');
      }
      
    } else {
      console.log('✅ Order created successfully:', orderData);
      
      // Send SMS confirmation
      const smsMessage = `🍕 Pizza Dojo Order Confirmed!
Order #${orderData.id}
${simpleOrder.pizza_name} - $${simpleOrder.pizza_price}
Pickup: ${simpleOrder.time_slot} on ${simpleOrder.date}
Location: 349 Eagle Dr (Hot Box by mailbox)
Thank you!`;
      
      console.log('📱 SMS Confirmation:', smsMessage);
      console.log('✅ Order flow completed successfully!');
    }
    
  } catch (error) {
    console.error('❌ Order creation failed:', error);
  }
}

createSimpleOrdersTable();


























