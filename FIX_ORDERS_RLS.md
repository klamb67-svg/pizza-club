# Fix Orders Table RLS Policy

## Issue
The orders table has Row Level Security (RLS) enabled, but there's no policy allowing members to insert orders. This causes the error:
```
new row violates row-level security policy for table "orders"
```

## Solution
Run the SQL in `scripts/fix-orders-rls.sql` in your Supabase SQL Editor.

## Steps

1. **Go to Supabase Dashboard**
   - Navigate to https://supabase.com/dashboard
   - Select your Pizza Club project
   - Click **SQL Editor** in the left sidebar

2. **Run the SQL**
   - Copy the contents of `scripts/fix-orders-rls.sql`
   - Paste it into the SQL Editor
   - Click **Run** or press `Ctrl+Enter`

3. **Verify**
   - The policies should be created successfully
   - Try creating an order again in the app

## What the SQL Does

- **Drops existing policies** (if any) to avoid conflicts
- **Creates INSERT policy**: Allows members to insert orders
- **Creates SELECT policy**: Allows members to read orders
- **Creates UPDATE policy**: Allows members to update their orders (optional)

## Security Note

The current policies use `WITH CHECK (true)` and `USING (true)`, which allows all operations. For production, you may want to restrict this to:
- Only allow members to insert orders with their own `member_id`
- Only allow members to read their own orders
- Only allow members to update their own orders

Example of more restrictive policy:
```sql
-- Only allow inserting orders with your own member_id
CREATE POLICY "Allow members to insert their own orders"
ON public.orders
FOR INSERT
WITH CHECK (
  member_id IN (
    SELECT id FROM public.members 
    WHERE username = current_setting('app.current_user', true)
  )
);
```

But for now, the simple `true` policies will get orders working!























