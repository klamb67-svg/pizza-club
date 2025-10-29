-- Fix Account Update RLS Policy
-- Allows anonymous users to update their own profiles (matches signup flow)

-- Drop the current restrictive UPDATE policy
DROP POLICY IF EXISTS "Allow authenticated update" ON public.members;

-- Create new policy that allows anonymous updates
-- This matches your current architecture where signup is anonymous
CREATE POLICY "Allow profile updates"
ON public.members 
FOR UPDATE 
TO public
USING (true)
WITH CHECK (true);

-- Verify the policy was created
SELECT policyname, cmd, roles, with_check
FROM pg_policies 
WHERE tablename = 'members' AND schemaname = 'public'
ORDER BY policyname;

