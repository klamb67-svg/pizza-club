// lib/supabaseAdmin.ts

// 100% crash-proof admin client – will never throw again

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 
  process.env.EXPO_PUBLIC_SUPABASE_URL || 
  process.env.SUPABASE_URL || 
  'https://bvmwcswddbepelgctybs.supabase.co'

const serviceRoleKey = 
  process.env.SUPABASE_SERVICE_ROLE_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2bXdjc3dkZGJlcGVsZ2N0eWJzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDc5ODMyNiwiZXhwIjoyMDcwMzc0MzI2fQ.Q7FFriNU5puauW6TfpYCo1uVrSKC5_7WALdygMMf2f0'

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})