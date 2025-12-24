// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

// Debug environment variables
console.log('🔍 Environment Debug:', {
  NODE_ENV: process.env.NODE_ENV,
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? 'present' : 'missing',
  allEnvKeys: Object.keys(process.env).filter(key => key.startsWith('EXPO_PUBLIC_'))
});

// Temporary hardcoded values to get app running
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://bvmwcswddbepelgctybs.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_2-7AUXVus7corG_aVvM2gQ_uRqAuYoo';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Environment variables missing:');
  console.error('  EXPO_PUBLIC_SUPABASE_URL:', supabaseUrl);
  console.error('  EXPO_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'present' : 'missing');
  throw new Error('Missing Supabase environment variables. Please ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set in your .env file.');
}

// Log configuration (without exposing full key)
console.log('🔧 Supabase Config:', {
  url: supabaseUrl,
  keyPresent: !!supabaseAnonKey,
  keyLength: supabaseAnonKey?.length || 0,
  urlValid: supabaseUrl?.startsWith('https://') && supabaseUrl?.endsWith('.supabase.co'),
  envLoaded: !!(process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY)
});

// Create Supabase client with timeout settings
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Diagnostic function to test connectivity
export async function testSupabaseConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🔍 Testing Supabase connection to:', supabaseUrl);
    const { data, error } = await supabase
      .from('members')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Supabase connection successful!');
    return { success: true };
  } catch (err: any) {
    const errorMessage = err?.message || String(err);
    console.error('❌ Network error during Supabase test:', errorMessage);
    
    // Check for common network error patterns
    if (errorMessage.includes('Network request failed') || 
        errorMessage.includes('fetch failed') ||
        errorMessage.includes('ECONNREFUSED')) {
      return { 
        success: false, 
        error: `Network connection failed. Please check:\n1. Your device and computer are on the same Wi-Fi network\n2. The Supabase URL is correct: ${supabaseUrl}\n3. Your internet connection is working.`
      };
    }
    
    return { success: false, error: errorMessage };
  }
}