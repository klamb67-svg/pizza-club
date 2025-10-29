import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkOrdersTable() {
  console.log('🔍 Checking orders table structure...');
  
  try {
    // Try to get any existing orders to see the structure
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .limit(1);
    
    if (ordersError) {
      console.error('❌ Orders table error:', ordersError);
      
      // Try to get table info differently
      const { data: tableInfo, error: tableError } = await supabase
        .from('orders')
        .select('*')
        .limit(0);
      
      if (tableError) {
        console.error('❌ Table info error:', tableError);
      }
    } else {
      console.log('✅ Orders table columns:', Object.keys(ordersData?.[0] || {}));
    }
    
    // Try to insert a minimal order to see what columns are expected
    console.log('🧪 Testing minimal order insert...');
    
    const { data: members } = await supabase
      .from('members')
      .select('id')
      .limit(1);
    
    if (members && members.length > 0) {
      const memberId = members[0].id;
      
      // Try different column combinations
      const testOrders = [
        { member_id: memberId },
        { member_id: memberId, status: 'pending' },
        { member_id: memberId, status: 'pending', created_at: new Date().toISOString() }
      ];
      
      for (const testOrder of testOrders) {
        const { data, error } = await supabase
          .from('orders')
          .insert([testOrder])
          .select()
          .single();
        
        if (error) {
          console.log(`❌ Test order failed:`, error.message);
        } else {
          console.log(`✅ Test order succeeded:`, Object.keys(data));
          console.log('📋 Available columns:', Object.keys(data));
          
          // Clean up test data
          await supabase
            .from('orders')
            .delete()
            .eq('id', data.id);
          
          break;
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Orders table check failed:', error);
  }
}

checkOrdersTable();
