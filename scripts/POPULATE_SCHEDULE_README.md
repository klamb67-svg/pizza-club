# Populate Schedule Instructions

## Step 1: Add Missing Columns

The `nights` and `time_slots` tables exist but are missing required columns.

**Action Required:** Run this SQL in your Supabase SQL Editor:

```sql
-- Add missing columns to nights table
ALTER TABLE nights 
ADD COLUMN IF NOT EXISTS date DATE,
ADD COLUMN IF NOT EXISTS day_of_week VARCHAR(10) CHECK (day_of_week IN ('Friday', 'Saturday')),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS max_capacity INTEGER DEFAULT 20,
ADD COLUMN IF NOT EXISTS start_time TIME DEFAULT '17:00',
ADD COLUMN IF NOT EXISTS end_time TIME DEFAULT '21:00',
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to time_slots table  
ALTER TABLE time_slots
ADD COLUMN IF NOT EXISTS max_orders INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS current_orders INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
```

**Location:** The full SQL is in `scripts/setup-nights-schema.sql`

## Step 2: Run Populate Script

After running the SQL above, execute:

```bash
npx tsx scripts/populate-schedule.ts
```

This will:
- Delete any existing nights and time_slots
- Create 8 nights (next 4 Fridays and Saturdays)
- Create time slots every 15 minutes from 5:00 PM to 9:00 PM for each night
- Set `is_available = true` and `max_orders = 1` for each slot

## Verification

After running, verify in Supabase:
- `nights` table should have 8 rows
- `time_slots` table should have 128 rows (16 slots × 8 nights)

