import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://bvmwcswddbepelgctybs.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_2-7AUXVus7corG_aVvM2gQ_uRqAuYoo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('🔍 Checking nights table schema...');
  
  // Try to get one row to see what columns exist
  const { data, error } = await supabase
    .from('nights')
    .select('*')
    .limit(1);
  
  if (error) {
    console.log('❌ Error querying nights:', error);
    console.log('   This might mean the table doesn\'t exist or has RLS blocking access');
    
    // Try to check if table exists by attempting to select just id
    const { error: idError } = await supabase
      .from('nights')
      .select('id')
      .limit(0);
    
    if (idError) {
      console.log('❌ Table might not exist. Error:', idError.message);
    }
  } else {
    if (data && data.length > 0) {
      console.log('✅ Nights table exists. Sample row:');
      console.log(JSON.stringify(data[0], null, 2));
      console.log('\n📋 Columns found:', Object.keys(data[0]));
    } else {
      console.log('✅ Nights table exists but is empty');
      // Try to get column info by attempting inserts with different field names
      console.log('\n🔍 Attempting to determine schema by testing field names...');
    }
  }
  
  // Check time_slots too
  console.log('\n🔍 Checking time_slots table schema...');
  const { data: timeSlotsData, error: timeSlotsError } = await supabase
    .from('time_slots')
    .select('*')
    .limit(1);
  
  if (timeSlotsError) {
    console.log('❌ Error querying time_slots:', timeSlotsError);
  } else {
    if (timeSlotsData && timeSlotsData.length > 0) {
      console.log('✅ Time_slots table exists. Sample row:');
      console.log(JSON.stringify(timeSlotsData[0], null, 2));
      console.log('\n📋 Columns found:', Object.keys(timeSlotsData[0]));
    } else {
      console.log('✅ Time_slots table exists but is empty');
    }
  }
}

checkSchema();


