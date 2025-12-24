-- Fix RLS Policies for Signup Flow
-- Problem: SELECT policy requires authentication, but signup needs to check username availability as anonymous
-- Solution: Add policy to allow anonymous SELECT for username checking

-- Drop existing policies (in case they need to be recreated)
DROP POLICY IF EXISTS "Allow anon read" ON public.members;
DROP POLICY IF EXISTS "Allow authenticated read" ON public.members;
DROP POLICY IF EXISTS "Allow profile updates" ON public.members;
DROP POLICY IF EXISTS "Allow public signup" ON public.members;
DROP POLICY IF EXISTS "Allow select for authenticated users" ON public.members;
DROP POLICY IF EXISTS "Allow updates for own row" ON public.members;
DROP POLICY IF EXISTS "Public inserts for signup" ON public.members;

-- Create policies that allow signup flow to work:

-- 1. Allow anonymous users to SELECT (needed for username availability check during signup)
CREATE POLICY "Allow anon read"
ON public.members 
FOR SELECT 
TO public
USING (true);

-- 2. Allow authenticated users to read records (for logged-in users)
CREATE POLICY "Allow authenticated read"
ON public.members 
FOR SELECT 
TO authenticated 
USING (true);

-- 3. Allow anonymous signup (INSERT)
CREATE POLICY "Allow public signup"
ON public.members 
FOR INSERT 
TO public
WITH CHECK (true);

-- 4. Allow anonymous users to update profiles (for account editing)
CREATE POLICY "Allow profile updates"
ON public.members 
FOR UPDATE 
TO public
USING (true)
WITH CHECK (true);

-- Verify policies were created
SELECT policyname, cmd, roles
FROM pg_policies 
WHERE tablename = 'members' AND schemaname = 'public'
ORDER BY cmd, policyname;

-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'members' AND schemaname = 'public';
























