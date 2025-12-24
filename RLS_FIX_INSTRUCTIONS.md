# RLS Policy Fix Instructions

## Issue Confirmed
✅ **RLS Violation Detected**: The members table is blocking inserts with the error:
```
new row violates row-level security policy for table "members"
```

## Solution
The current RLS policy uses `FOR ALL` which may not work correctly for inserts. We need to create specific policies for INSERT, SELECT, and UPDATE operations.

## Manual Fix Steps

### 1. Access Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Navigate to your Pizza Club project
3. Go to **SQL Editor** in the left sidebar

### 2. Execute the Following SQL

```sql
-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow authenticated access" ON public.members;

-- Create specific policies for different operations
CREATE POLICY "Allow inserts for authenticated users"
ON public.members
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow select for authenticated users"
ON public.members
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow updates for authenticated users"
ON public.members
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
```

### 3. Verify the Fix
After executing the SQL, test by:
1. Going to the **Table Editor** in Supabase dashboard
2. Navigate to the `members` table
3. Try to insert a new row manually
4. Or test through the app's signup functionality

## Alternative: Use Service Role Key

If you have access to the service role key, you can also apply this fix programmatically by:

1. Using the service role key instead of the anon key
2. Running the SQL commands through the Supabase client
3. This requires admin access to the Supabase project

## Expected Result
After applying this fix:
- ✅ Users should be able to sign up without RLS violations
- ✅ The app's signup flow should work correctly
- ✅ New members can be inserted into the database
- ✅ Existing functionality (login, profile viewing) should continue to work

## Files Updated
- `fix_rls_policies.sql` - Updated with specific INSERT/SELECT/UPDATE policies
- `lib/applyRLSFix.ts` - Test script to verify the issue and fix

## Testing
Run the test script to verify the fix:
```bash
npx tsx lib/applyRLSFix.ts
```

The script will:
1. Test current access to members table
2. Attempt to insert a test member
3. Report success or failure
4. Clean up test data if successful

































