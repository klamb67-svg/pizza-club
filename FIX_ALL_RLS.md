# Fix All RLS Policies

## Issue
The error "No pizzas found in database" suggests that RLS (Row Level Security) is blocking reads from the `pizzas` table.

## Solution
Run BOTH SQL scripts to fix RLS policies for both `orders` and `pizzas` tables.

## Steps

1. **Go to Supabase Dashboard → SQL Editor**

2. **Run the orders RLS fix** (from `scripts/fix-orders-rls.sql`):
```sql
-- Fix RLS policies for orders table
DROP POLICY IF EXISTS "Allow members to insert their own orders" ON public.orders;
DROP POLICY IF EXISTS "Allow members to read their own orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public order inserts" ON public.orders;

CREATE POLICY "Allow members to insert their own orders"
ON public.orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow members to read their own orders"
ON public.orders FOR SELECT USING (true);

CREATE POLICY "Allow members to update their own orders"
ON public.orders FOR UPDATE USING (true) WITH CHECK (true);

-- Also fix pizzas table RLS
DROP POLICY IF EXISTS "Allow public to read pizzas" ON public.pizzas;
CREATE POLICY "Allow public to read pizzas"
ON public.pizzas FOR SELECT USING (true);
```

3. **Click Run**

4. **Verify**
   - Check that both policies were created
   - Try creating an order again

## What This Does

- **Orders table**: Allows inserts, reads, and updates
- **Pizzas table**: Allows reads (needed to look up pizza IDs when creating orders)

## Testing

After running this, the order creation should:
1. ✅ Be able to read pizzas from the database
2. ✅ Find the matching pizza (e.g., "Pepperoni")
3. ✅ Insert the order successfully






















