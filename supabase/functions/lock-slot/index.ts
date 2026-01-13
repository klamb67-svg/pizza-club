// Supabase Edge Function: admin/lock-slot
// Handles locking and unlocking time slots for admin users
// Server-side only - service role key is secure here

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders })
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://bvmwcswddbepelgctybs.supabase.co'
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'sb_secret_VxWID9s9wXpKCe5zLXRMNw_kqh1qWPP'
    
    // Create admin client (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Parse request body
    const { adminUsername, pickupDate, pickupTime, action } = await req.json()

    // Validate input
    if (!adminUsername || !pickupDate || !pickupTime || !action) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: adminUsername, pickupDate, pickupTime, action' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (action !== 'lock' && action !== 'unlock') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid action. Must be "lock" or "unlock"' 
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

    // Perform the operation
    if (action === 'lock') {
      // Insert into locked_slots
      const { error: insertError } = await supabaseAdmin
        .from('locked_slots')
        .insert({
          pickup_date: pickupDate,
          pickup_time: pickupTime
        })

      if (insertError) {
        console.error('Error locking slot:', insertError)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Failed to lock slot: ${insertError.message}` 
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
    } else {
      // Delete from locked_slots
      const { error: deleteError } = await supabaseAdmin
        .from('locked_slots')
        .delete()
        .eq('pickup_date', pickupDate)
        .eq('pickup_time', pickupTime)

      if (deleteError) {
        console.error('Error unlocking slot:', deleteError)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Failed to unlock slot: ${deleteError.message}` 
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
    }

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

