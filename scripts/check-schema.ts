import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

async function checkDatabaseSchema() {
  console.log('🔍 Checking database schema...');
  
  try {
    // Check members table
    console.log('👥 Checking members table...');
    const { data: membersData, error: membersError } = await supabase
      .from('members')
      .select('*')
      .limit(1);
    
    if (membersError) {
      console.error('❌ Members table error:', membersError);
    } else {
      console.log('✅ Members table columns:', Object.keys(membersData?.[0] || {}));
    }
    
    // Check orders table
    console.log('🍕 Checking orders table...');
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .limit(1);
    
    if (ordersError) {
      console.error('❌ Orders table error:', ordersError);
    } else {
      console.log('✅ Orders table columns:', Object.keys(ordersData?.[0] || {}));
    }
    
    // Check pizzas table
    console.log('🍕 Checking pizzas table...');
    const { data: pizzasData, error: pizzasError } = await supabase
      .from('pizzas')
      .select('*')
      .limit(1);
    
    if (pizzasError) {
      console.error('❌ Pizzas table error:', pizzasError);
    } else {
      console.log('✅ Pizzas table columns:', Object.keys(pizzasData?.[0] || {}));
    }
    
    // Check time_slots table
    console.log('⏰ Checking time_slots table...');
    const { data: timeSlotsData, error: timeSlotsError } = await supabase
      .from('time_slots')
      .select('*')
      .limit(1);
    
    if (timeSlotsError) {
      console.error('❌ Time slots table error:', timeSlotsError);
    } else {
      console.log('✅ Time slots table columns:', Object.keys(timeSlotsData?.[0] || {}));
    }
    
    // Check nights table
    console.log('🌙 Checking nights table...');
    const { data: nightsData, error: nightsError } = await supabase
      .from('nights')
      .select('*')
      .limit(1);
    
    if (nightsError) {
      console.error('❌ Nights table error:', nightsError);
    } else {
      console.log('✅ Nights table columns:', Object.keys(nightsData?.[0] || {}));
    }
    
  } catch (error) {
    console.error('❌ Schema check failed:', error);
  }
}

checkDatabaseSchema();



























