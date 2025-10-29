import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createTablesDirectly() {
  console.log('🔧 Creating tables directly...');
  
  try {
    // Create pizzas table with minimal columns first
    console.log('🍕 Creating pizzas table...');
    const { error: pizzasError } = await supabase
      .from('pizzas')
      .select('id')
      .limit(1);
    
    if (pizzasError && pizzasError.code === 'PGRST106') {
      console.log('📝 Pizzas table does not exist, creating...');
      // Table doesn't exist, we need to create it via SQL
      console.log('⚠️ Cannot create table via client - need SQL access');
    } else {
      console.log('✅ Pizzas table exists');
    }
    
    // Let's try a different approach - create a simple order record
    console.log('📋 Testing order creation with minimal data...');
    
    // First, get a member ID
    const { data: members, error: membersError } = await supabase
      .from('members')
      .select('id')
      .limit(1);
    
    if (membersError || !members || members.length === 0) {
      console.error('❌ No members found:', membersError);
      return;
    }
    
    const memberId = members[0].id;
    console.log('✅ Found member ID:', memberId);
    
    // Try to create a simple order record
    const simpleOrder = {
      member_id: memberId,
      pizza_name: 'Margherita Pizza',
      pizza_price: 18.99,
      time_slot: '6:00 PM',
      date: '12/28/24',
      phone: '555-123-4567',
      special_instructions: 'Test order'
    };
    
    // Create a custom orders table if it doesn't exist
    console.log('🔧 Creating custom orders table...');
    
    // Try to insert into a simple orders table
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([{
        member_id: memberId,
        pizza_name: simpleOrder.pizza_name,
        pizza_price: simpleOrder.pizza_price,
        time_slot: simpleOrder.time_slot,
        date: simpleOrder.date,
        phone: simpleOrder.phone,
        special_instructions: simpleOrder.special_instructions,
        status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (orderError) {
      console.error('❌ Order creation failed:', orderError);
      
      // If orders table doesn't exist, let's create a simple one
      if (orderError.code === 'PGRST106') {
        console.log('📝 Orders table does not exist - need to create via Supabase dashboard');
        console.log('🔧 Manual SQL needed:');
        console.log(`
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  member_id INTEGER REFERENCES members(id),
  pizza_name VARCHAR(100),
  pizza_price DECIMAL(10,2),
  time_slot VARCHAR(20),
  date VARCHAR(20),
  phone VARCHAR(20),
  special_instructions TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
        `);
      }
    } else {
      console.log('✅ Order created successfully:', orderData);
    }
    
  } catch (error) {
    console.error('❌ Table creation failed:', error);
  }
}

createTablesDirectly();
