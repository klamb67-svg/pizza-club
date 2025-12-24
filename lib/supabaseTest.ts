// lib/supabaseTest.ts - Node.js compatible Supabase connection test
import { createClient } from '@supabase/supabase-js';

// Direct Supabase configuration (Node.js compatible)
const SUPABASE_URL = 'https://bvmwcswddbepelgctybs.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_2-7AUXVus7corG_aVvM2gQ_uRqAuYoo';

// Create Supabase client for Node.js
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function testConnection() {
  console.log('🔧 Testing Supabase connection...');
  console.log('Supabase URL:', SUPABASE_URL);
  console.log('Supabase Key (first 20 chars):', SUPABASE_ANON_KEY.substring(0, 20) + '...');
  
  try {
    const { data, error } = await supabase.from('members').select('*').limit(1);
    
    if (error) {
      console.error('❌ Supabase Error:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful!');
    console.log('📊 Test Data:', data);
    console.log('📈 Records found:', data?.length || 0);
    return true;
  } catch (err) {
    console.error('❌ Connection failed:', err);
    return false;
  }
}

// Run the test
testConnection().then(success => {
  if (success) {
    console.log('🎉 Supabase test completed successfully!');
  } else {
    console.log('💥 Supabase test failed!');
    process.exit(1);
  }
});
