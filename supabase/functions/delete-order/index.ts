// Supabase Edge Function: admin/delete-order
// Handles deleting orders for admin users
// Server-side only - service role key is secure here

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  // Handle CORS preflight - respond to Access-Control-Request-Headers dynamically
  if (req.method === 'OPTIONS') {
    const requestedHeaders = req.headers.get('Access-Control-Request-Headers')
    const allowedHeaders = 'authorization, x-client-info, apikey, content-type, x-admin-secret'
    
    return new Response(null, { 
      status: 204, 
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': requestedHeaders || allowedHeaders,
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false',
      }
    })
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://bvmwcswddbepelgctybs.supabase.co'
    const supabaseServiceRoleKey = Deno.env.get('SERVICE_ROLE_KEY')
    const adminSecret = Deno.env.get('ADMIN_SECRET')
    
    if (!supabaseServiceRoleKey) {
      console.error('❌ SERVICE_ROLE_KEY environment variable is missing')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Server configuration error: SERVICE_ROLE_KEY not set' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!adminSecret) {
      console.error('❌ ADMIN_SECRET environment variable is missing')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Server configuration error: ADMIN_SECRET not set' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify admin secret from request header
    const providedSecret = req.headers.get('x-admin-secret')
    if (!providedSecret || providedSecret !== adminSecret) {
      console.error('❌ Invalid or missing admin secret')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Unauthorized: Invalid admin secret' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    // Create admin client (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Parse request body
    const { adminUsername, orderId } = await req.json()

    // Validate input
    if (!adminUsername || !orderId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: adminUsername, orderId' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify admin exists in admins table
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('admins')
      .select('username')
      .eq('username', adminUsername)
      .single()

    if (adminError || !adminData) {
      console.error('Admin verification failed:', adminError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Unauthorized: Admin verification failed' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`✅ Admin verified: ${adminUsername}`)

    // Delete the order
    const { error: deleteError } = await supabaseAdmin
      .from('orders')
      .delete()
      .eq('id', orderId)

    if (deleteError) {
      console.error('Error deleting order:', deleteError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to delete order: ${deleteError.message}` 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Internal server error: ${error.message}` 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

