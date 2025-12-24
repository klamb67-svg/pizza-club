import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://bvmwcswddbepelgctybs.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2bXdjc3dkZGJlcGVsZ2N0eWJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3OTgzMjYsImV4cCI6MjA3MDM3NDMyNn0._eI2GVgkTRZoD7J1Y-LurfIPPwqrJBVBuERfDB5uNL8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  // Try to get schema by attempting to select specific columns
  const columnsToTry = [
    'id', 'date', 'day_of_week', 'is_active', 'max_capacity', 
    'current_bookings', 'start_time', 'end_time', 'starts_at', 
    'notes', 'created_at', 'updated_at'
  ];
  
  console.log('🔍 Testing which columns exist in nights table...\n');
  
  for (const col of columnsToTry) {
    const { error } = await supabase.from('nights').select(col).limit(0);
    if (error) {
      if (error.code === 'PGRST204') {
        console.log(`❌ ${col}: NOT FOUND`);
      } else {
        console.log(`⚠️ ${col}: ${error.message}`);
      }
    } else {
      console.log(`✅ ${col}: EXISTS`);
    }
  }
  
  // Try time_slots columns
  console.log('\n🔍 Testing time_slots columns...\n');
  const timeSlotColumns = [
    'id', 'night_id', 'start_time', 'end_time', 'starts_at',
    'is_available', 'max_orders', 'current_orders', 'created_at'
  ];
  
  for (const col of timeSlotColumns) {
    const { error } = await supabase.from('time_slots').select(col).limit(0);
    if (error) {
      if (error.code === 'PGRST204') {
        console.log(`❌ ${col}: NOT FOUND`);
      } else {
        console.log(`⚠️ ${col}: ${error.message}`);
      }
    } else {
      console.log(`✅ ${col}: EXISTS`);
    }
  }
}

inspect();

