# Signup RLS Fix - Network Request Failed Error

## Problem Summary

**Error:** `TypeError: Network request failed` when creating a new user, but existing users can log in successfully.

**Root Cause:** 
- The signup flow needs to check username availability (SELECT query) before inserting a new member
- The current RLS policies only allow `TO authenticated` for SELECT operations
- Anonymous users (during signup) cannot SELECT, causing the query to fail
- The error manifests as "Network request failed" but is actually an RLS permissions issue

## Solution

The `members` table needs a policy that allows anonymous users to SELECT (at least for username checking during signup).

### Step 1: Apply the SQL Fix

Run the SQL in `fix_signup_rls.sql` in your Supabase SQL Editor:

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `fix_signup_rls.sql`
3. Execute the SQL

This will:
- Add a policy to allow anonymous SELECT (needed for username availability check)
- Keep the existing INSERT policy for anonymous signup
- Maintain authenticated user policies for logged-in operations

### Step 2: Verify the Fix

After applying the SQL, test signup again. The signup flow should now work because:
- ✅ Anonymous users can SELECT to check username availability
- ✅ Anonymous users can INSERT to create new members
- ✅ Existing authenticated user access remains unchanged

## Technical Details

**Current Issue:**
```sql
-- Old policy (line 22-26 in final_rls_cleanup.sql)
CREATE POLICY "Allow authenticated read"
ON public.members 
FOR SELECT 
TO authenticated  -- ❌ Only authenticated users can SELECT
USING (true);
```

**Fixed Policy:**
```sql
-- New policy allows anonymous SELECT
CREATE POLICY "Allow anon read"
ON public.members 
FOR SELECT 
TO public  -- ✅ Anonymous users can also SELECT
USING (true);
```

## Testing

1. Try to sign up a new user through the app
2. The username availability check should work
3. The insert operation should complete successfully
4. The new user should be able to log in

## Related Files

- `fix_signup_rls.sql` - SQL script to apply the fix
- `app/signup.tsx` - Signup flow (enhanced error handling added)
- `final_rls_cleanup.sql` - Previous RLS policy setup (missing anonymous SELECT)
























