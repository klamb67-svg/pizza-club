import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://bvmwcswddbepelgctybs.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2bXdjc3dkZGJlcGVsZ2N0eWJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3OTgzMjYsImV4cCI6MjA3MDM3NDMyNn0._eI2GVgkTRZoD7J1Y-LurfIPPwqrJBVBuERfDB5uNL8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function querySchema() {
  console.log('🔍 Querying actual database schema...');
  
  // Query information_schema to get column names
  const { data: nightsColumns, error: nightsError } = await supabase
    .rpc('exec_sql', {
      sql: `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'nights' 
        ORDER BY ordinal_position;
      `
    });
  
  if (nightsError) {
    console.log('⚠️ Could not query information_schema, trying direct approach...');
    
    // Try minimal insert to see what error we get
    const { error: testError } = await supabase
      .from('nights')
      .insert([{ id: 999999 }]); // This will fail but show us the schema
    
    console.log('Test insert error (this is expected):', testError?.message);
    
    // Try with just id field
    const { data, error } = await supabase
      .from('nights')
      .select('*')
      .limit(0);
    
    console.log('Select all error:', error?.message);
  } else {
    console.log('📋 Nights table columns:', nightsColumns);
  }
  
  // Try time_slots
  const { data: timeSlotsColumns, error: timeSlotsError } = await supabase
    .rpc('exec_sql', {
      sql: `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'time_slots' 
        ORDER BY ordinal_position;
      `
    });
  
  if (!timeSlotsError) {
    console.log('📋 Time_slots table columns:', timeSlotsColumns);
  }
}

querySchema();


