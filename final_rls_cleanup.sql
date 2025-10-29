-- Final RLS Policy Cleanup
-- Consolidates 7 policies down to 3 clean, non-redundant policies

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow anon read" ON public.members;
DROP POLICY IF EXISTS "Allow authenticated read" ON public.members;
DROP POLICY IF EXISTS "Allow profile updates" ON public.members;
DROP POLICY IF EXISTS "Allow public signup" ON public.members;
DROP POLICY IF EXISTS "Allow select for authenticated users" ON public.members;
DROP POLICY IF EXISTS "Allow updates for own row" ON public.members;
DROP POLICY IF EXISTS "Public inserts for signup" ON public.members;

-- Create clean, consolidated policy set (3 policies total)
-- 1. Allow anonymous signup
CREATE POLICY "Allow public signup"
ON public.members 
FOR INSERT 
TO public
WITH CHECK (true);

-- 2. Allow authenticated users to read records
CREATE POLICY "Allow authenticated read"
ON public.members 
FOR SELECT 
TO authenticated 
USING (true);

-- 3. Allow anonymous users to update profiles (for account editing)
CREATE POLICY "Allow profile updates"
ON public.members 
FOR UPDATE 
TO public
USING (true)
WITH CHECK (true);

-- Verify final policy count (should be 3)
SELECT COUNT(*) as policy_count, policyname, cmd, roles
FROM pg_policies 
WHERE tablename = 'members' AND schemaname = 'public'
GROUP BY policyname, cmd, roles
ORDER BY policyname;

