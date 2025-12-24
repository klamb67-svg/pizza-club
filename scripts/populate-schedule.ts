import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://bvmwcswddbepelgctybs.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_VxWID9s9wXpKCe5zLXRMNw_kqh1qWPP';

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to format date as YYYY-MM-DD without timezone issues
function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper function to get the next Friday from a given date
function getNextFriday(fromDate: Date): Date {
  const date = new Date(fromDate);
  const dayOfWeek = date.getDay(); // 0 = Sunday, 5 = Friday, 6 = Saturday
  
  let daysToAdd: number;
  
  if (dayOfWeek === 5) {
    // Today is Friday - use today
    daysToAdd = 0;
  } else if (dayOfWeek === 6) {
    // Today is Saturday - next Friday is 6 days away
    daysToAdd = 6;
  } else if (dayOfWeek === 0) {
    // Today is Sunday - Friday is 5 days away
    daysToAdd = 5;
  } else {
    // Monday (1) = 4 days, Tuesday (2) = 3 days, Wednesday (3) = 2 days, Thursday (4) = 1 day
    daysToAdd = 5 - dayOfWeek;
  }
  
  date.setDate(date.getDate() + daysToAdd);
  return date;
}

// Helper function to get the next Saturday from a given date
function getNextSaturday(fromDate: Date): Date {
  const date = new Date(fromDate);
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
  
  let daysToAdd: number;
  
  if (dayOfWeek === 6) {
    // Today is Saturday - use today
    daysToAdd = 0;
  } else if (dayOfWeek === 0) {
    // Today is Sunday - Saturday is 6 days away
    daysToAdd = 6;
  } else {
    // Monday (1) = 5 days, Tuesday (2) = 4 days, etc.
    daysToAdd = 6 - dayOfWeek;
  }
  
  date.setDate(date.getDate() + daysToAdd);
  return date;
}

async function populateSchedule() {
  console.log('🗓️ Starting schedule population...');
  console.log('📍 Timezone: Central (America/Chicago)');
  
  const today = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  console.log(`📅 Today is: ${dayNames[today.getDay()]}, ${formatDateLocal(today)} (Day of week: ${today.getDay()})`);
  
  try {
    // Step 1: Delete old time slots
    console.log('🧹 Cleaning up old time slots...');
    const { data: allTimeSlots } = await supabase.from('time_slots').select('id');
    if (allTimeSlots && allTimeSlots.length > 0) {
      const { error: deleteTimeSlotsError } = await supabase
        .from('time_slots')
        .delete()
        .in('id', allTimeSlots.map(ts => ts.id));
      
      if (deleteTimeSlotsError) {
        console.log('⚠️ Warning deleting time slots:', deleteTimeSlotsError.message);
      } else {
        console.log(`✅ Deleted ${allTimeSlots.length} old time slots`);
      }
    }
    
    // Step 2: Delete old nights
    console.log('🧹 Cleaning up old nights...');
    const { data: allNights } = await supabase.from('nights').select('id');
    if (allNights && allNights.length > 0) {
      const { error: deleteNightsError } = await supabase
        .from('nights')
        .delete()
        .in('id', allNights.map(n => n.id));
      
      if (deleteNightsError) {
        console.log('⚠️ Warning deleting nights:', deleteNightsError.message);
      } else {
        console.log(`✅ Deleted ${allNights.length} old nights`);
      }
    }
    
    // Step 3: Calculate next Friday and Saturday
    const nextFriday = getNextFriday(today);
    const nextSaturday = getNextSaturday(today);
    
    // Use local date formatting to avoid timezone shifts
    const fridayStr = formatDateLocal(nextFriday);
    const saturdayStr = formatDateLocal(nextSaturday);
    
    console.log(`🎯 Next Friday: ${fridayStr} (${dayNames[nextFriday.getDay()]})`);
    console.log(`🎯 Next Saturday: ${saturdayStr} (${dayNames[nextSaturday.getDay()]})`);
    
    // Verify the days are correct
    if (nextFriday.getDay() !== 5) {
      console.error(`❌ ERROR: Calculated Friday is actually a ${dayNames[nextFriday.getDay()]}!`);
      process.exit(1);
    }
    if (nextSaturday.getDay() !== 6) {
      console.error(`❌ ERROR: Calculated Saturday is actually a ${dayNames[nextSaturday.getDay()]}!`);
      process.exit(1);
    }
    
    // Build nights array - always Friday first, then Saturday (chronological order)
    const nights: Array<{ date: string; day_of_week: 'Friday' | 'Saturday' }> = [];
    
    // Add in chronological order
    if (fridayStr < saturdayStr) {
      nights.push({ date: fridayStr, day_of_week: 'Friday' });
      nights.push({ date: saturdayStr, day_of_week: 'Saturday' });
    } else {
      // Saturday is today, Friday is next week
      nights.push({ date: saturdayStr, day_of_week: 'Saturday' });
      nights.push({ date: fridayStr, day_of_week: 'Friday' });
    }
    
    console.log(`📅 Creating ${nights.length} nights:`, nights.map(n => `${n.date} (${n.day_of_week})`).join(', '));
    
    // Step 4: Create nights and time slots
    for (const night of nights) {
      console.log(`\n🌙 Creating night: ${night.date} (${night.day_of_week})`);
      
      const { data: nightData, error: nightError } = await supabase
        .from('nights')
        .insert([{
          date: night.date,
          day_of_week: night.day_of_week,
          is_active: true,
          max_capacity: 10,
          nightly_capacity: 10,
          start_time: '17:15',
          end_time: '19:30',
          notes: `Pizza Dojo ${night.day_of_week} Night`
        }])
        .select()
        .single();
      
      if (nightError) {
        console.error(`❌ Error creating night ${night.date}:`, nightError);
        continue;
      }
      
      console.log(`✅ Night created with ID: ${nightData.id}`);
      
      // Step 5: Create 10 time slots (5:15 PM to 7:30 PM Central)
      const slotTimes = [
        { hour: 17, minute: 15 },
        { hour: 17, minute: 30 },
        { hour: 17, minute: 45 },
        { hour: 18, minute: 0 },
        { hour: 18, minute: 15 },
        { hour: 18, minute: 30 },
        { hour: 18, minute: 45 },
        { hour: 19, minute: 0 },
        { hour: 19, minute: 15 },
        { hour: 19, minute: 30 },
      ];
      
      const timeSlots = slotTimes.map(({ hour, minute }) => {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
        const timestamp = `${night.date}T${timeStr}`;
        
        return {
          night_id: nightData.id,
          starts_at: timestamp,
          is_available: true,
          max_orders: 1,
          current_orders: 0
        };
      });
      
      console.log(`⏰ Creating ${timeSlots.length} time slots (5:15 PM - 7:30 PM Central)...`);
      
      const { error: timeSlotsError } = await supabase
        .from('time_slots')
        .insert(timeSlots);
      
      if (timeSlotsError) {
        console.error(`❌ Error creating time slots for ${night.date}:`, timeSlotsError);
      } else {
        console.log(`✅ ${timeSlots.length} time slots created for ${night.date}`);
      }
    }
    
    // Step 6: Verify
    console.log('\n🔍 Verifying data...');
    const { count: nightsCount } = await supabase
      .from('nights')
      .select('*', { count: 'exact', head: true });
    
    const { count: timeSlotsCount } = await supabase
      .from('time_slots')
      .select('*', { count: 'exact', head: true });
    
    console.log(`✅ Verification complete:`);
    console.log(`   - Nights created: ${nightsCount}`);
    console.log(`   - Time slots created: ${timeSlotsCount}`);
    console.log(`   - Expected: 2 nights × 10 slots = 20 time slots`);
    
    console.log('\n🎉 Schedule population complete!');
    
  } catch (error) {
    console.error('❌ Schedule population failed:', error);
    process.exit(1);
  }
}

populateSchedule();