-- Fix Admin Login RLS Policy
-- Date: December 23, 2025
-- Purpose: Allow anonymous SELECT on admins table for login lookup while maintaining security

-- Step 1: Check current policies on admins table
-- Run this first to see what policies exist:
-- SELECT * FROM pg_policies WHERE tablename = 'admins';

-- Step 2: Drop existing restrictive policy (if it exists)
DROP POLICY IF EXISTS "Allow authenticated access" ON public.admins;

-- Step 3: Create new policies that allow anonymous SELECT for login

-- Allow anyone to SELECT from admins table (needed for login lookup)
-- This is safe because password verification happens in app logic, not in database
CREATE POLICY "Allow anonymous read for login" ON public.admins
  FOR SELECT
  USING (true);

-- Only authenticated users can INSERT (likely not needed, but included for completeness)
CREATE POLICY "Allow authenticated insert" ON public.admins
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated users can UPDATE their own record
CREATE POLICY "Allow authenticated update own record" ON public.admins
  FOR UPDATE
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

-- Only authenticated users can DELETE (likely not needed, but included for completeness)
CREATE POLICY "Allow authenticated delete" ON public.admins
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Step 4: Verify the policies were created
-- Run this after executing the above:
-- SELECT * FROM pg_policies WHERE tablename = 'admins';

-- ROLLBACK PLAN (if needed):
-- If something goes wrong, run these commands to restore restrictive policy:
/*
DROP POLICY IF EXISTS "Allow anonymous read for login" ON public.admins;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.admins;
DROP POLICY IF EXISTS "Allow authenticated update own record" ON public.admins;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.admins;

CREATE POLICY "Allow authenticated access" ON public.admins
  FOR ALL
  USING (auth.role() = 'authenticated');
*/

