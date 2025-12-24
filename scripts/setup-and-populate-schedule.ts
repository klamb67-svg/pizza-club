import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://bvmwcswddbepelgctybs.supabase.co';
// Try service role key first, fall back to anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_2-7AUXVus7corG_aVvM2gQ_uRqAuYoo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupAndPopulate() {
  console.log('🔧 Setting up nights and time_slots schema...\n');
  
  // Step 1: Try to add missing columns via RPC (may not work without service role)
  const alterSQL = `
    ALTER TABLE nights 
    ADD COLUMN IF NOT EXISTS date DATE,
    ADD COLUMN IF NOT EXISTS day_of_week VARCHAR(10) CHECK (day_of_week IN ('Friday', 'Saturday')),
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
    ADD COLUMN IF NOT EXISTS max_capacity INTEGER DEFAULT 20,
    ADD COLUMN IF NOT EXISTS start_time TIME DEFAULT '17:00',
    ADD COLUMN IF NOT EXISTS end_time TIME DEFAULT '21:00',
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    
    ALTER TABLE time_slots
    ADD COLUMN IF NOT EXISTS max_orders INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS current_orders INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  `;
  
  console.log('⚠️ Attempting to add columns via RPC (may require service role key)...');
  const { error: rpcError } = await supabase.rpc('exec', { sql: alterSQL });
  
  if (rpcError) {
    console.log('❌ RPC execution failed (this is expected if exec function doesn\'t exist)');
    console.log('   Error:', rpcError.message);
    console.log('\n📋 MANUAL STEP REQUIRED:');
    console.log('   Please run the SQL in scripts/setup-nights-schema.sql in Supabase SQL Editor');
    console.log('   Then run this script again: npx tsx scripts/populate-schedule.ts\n');
    return;
  }
  
  console.log('✅ Columns added successfully!\n');
  
  // Step 2: Now populate (same logic as populate-schedule.ts)
  console.log('🗓️ Starting schedule population...');
  
  try {
    // Delete old data
    console.log('🧹 Cleaning up old data...');
    const { data: allTimeSlots } = await supabase.from('time_slots').select('id');
    if (allTimeSlots && allTimeSlots.length > 0) {
      await supabase.from('time_slots').delete().in('id', allTimeSlots.map(ts => ts.id));
      console.log(`✅ Deleted ${allTimeSlots.length} old time slots`);
    }
    
    const { data: allNights } = await supabase.from('nights').select('id');
    if (allNights && allNights.length > 0) {
      await supabase.from('nights').delete().in('id', allNights.map(n => n.id));
      console.log(`✅ Deleted ${allNights.length} old nights`);
    }
    
    // Find next 4 Fridays and Saturdays
    const today = new Date();
    const nights: Array<{ date: string; day_of_week: 'Friday' | 'Saturday' }> = [];
    
    let currentDate = new Date(today);
    let fridayCount = 0;
    let saturdayCount = 0;
    
    while (fridayCount < 4 || saturdayCount < 4) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek === 5 && fridayCount < 4) {
        nights.push({ date: currentDate.toISOString().split('T')[0], day_of_week: 'Friday' });
        fridayCount++;
      } else if (dayOfWeek === 6 && saturdayCount < 4) {
        nights.push({ date: currentDate.toISOString().split('T')[0], day_of_week: 'Saturday' });
        saturdayCount++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    nights.sort((a, b) => a.date.localeCompare(b.date));
    console.log(`📅 Creating ${nights.length} nights...`);
    
    // Create nights and time slots
    for (const night of nights) {
      console.log(`\n🌙 Creating night: ${night.date} (${night.day_of_week})`);
      
      const { data: nightData, error: nightError } = await supabase
        .from('nights')
        .insert([{
          date: night.date,
          day_of_week: night.day_of_week,
          is_active: true,
          max_capacity: 20,
          start_time: '17:00',
          end_time: '21:00',
          notes: `Pizza Dojo ${night.day_of_week} Night`
        }])
        .select()
        .single();
      
      if (nightError) {
        console.error(`❌ Error:`, nightError);
        continue;
      }
      
      console.log(`✅ Night created: ${nightData.id}`);
      
      // Create time slots (5:00 PM to 9:00 PM, every 15 minutes)
      const timeSlots = [];
      for (let hour = 17; hour < 21; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
          const slotDate = new Date(`${night.date}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`);
          timeSlots.push({
            night_id: nightData.id,
            starts_at: slotDate.toISOString(),
            is_available: true
          });
        }
      }
      
      const { error: timeSlotsError } = await supabase
        .from('time_slots')
        .insert(timeSlots);
      
      if (timeSlotsError) {
        console.error(`❌ Time slots error:`, timeSlotsError);
      } else {
        console.log(`✅ ${timeSlots.length} time slots created`);
      }
    }
    
    // Verify
    const { count: nightsCount } = await supabase
      .from('nights')
      .select('*', { count: 'exact', head: true });
    
    const { count: timeSlotsCount } = await supabase
      .from('time_slots')
      .select('*', { count: 'exact', head: true });
    
    console.log(`\n✅ Complete! Nights: ${nightsCount}, Time slots: ${timeSlotsCount}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

setupAndPopulate();

