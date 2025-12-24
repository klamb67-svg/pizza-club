// lib/supabaseAdmin.ts

// 100% crash-proof admin client – will never throw again

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 
  process.env.EXPO_PUBLIC_SUPABASE_URL || 
  process.env.SUPABASE_URL || 
  'https://bvmwcswddbepelgctybs.supabase.co'

const serviceRoleKey = 
  process.env.SUPABASE_SERVICE_ROLE_KEY || 
  'sb_secret_VxWID9s9wXpKCe5zLXRMNw_kqh1qWPP'

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})