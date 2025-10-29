-- Verification queries to check if account update fix worked

-- 1. Check current policies on members table
SELECT policyname, cmd, roles, with_check
FROM pg_policies 
WHERE tablename = 'members' AND schemaname = 'public'
ORDER BY policyname;

-- 2. Verify RLS is still enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'members' AND schemaname = 'public';

-- 3. Test if we can read a member record (should work)
SELECT id, username, first_name, last_name 
FROM public.members 
LIMIT 1;

-- 4. Check if the new "Allow profile updates" policy exists
SELECT policyname, cmd, roles
FROM pg_policies 
WHERE tablename = 'members' 
  AND schemaname = 'public' 
  AND policyname = 'Allow profile updates';

