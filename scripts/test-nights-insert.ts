import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://bvmwcswddbepelgctybs.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_2-7AUXVus7corG_aVvM2gQ_uRqAuYoo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  console.log('🧪 Testing nights table insert...');
  
  // Try 1: Just id (will fail but show us the error)
  console.log('\n1. Testing with just id...');
  const { error: e1 } = await supabase.from('nights').insert([{ id: 1 }]);
  console.log('Error:', e1?.message);
  
  // Try 2: Minimal fields that setup-database.ts uses
  console.log('\n2. Testing with date, day_of_week...');
  const { error: e2 } = await supabase.from('nights').insert([{
    date: '2025-11-29',
    day_of_week: 'Friday'
  }]);
  console.log('Error:', e2?.message);
  
  // Try 3: Check if table exists by selecting
  console.log('\n3. Testing select...');
  const { data, error: e3 } = await supabase.from('nights').select('*').limit(0);
  console.log('Select error:', e3?.message);
  if (e3?.code === 'PGRST106') {
    console.log('❌ Table does not exist!');
  } else if (e3?.code === 'PGRST204') {
    console.log('⚠️ Table exists but schema cache issue');
  } else {
    console.log('✅ Table exists and is queryable');
  }
  
  // Try 4: Check time_slots
  console.log('\n4. Testing time_slots select...');
  const { error: e4 } = await supabase.from('time_slots').select('*').limit(0);
  console.log('Time slots error:', e4?.message);
}

testInsert();

