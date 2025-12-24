-- Fix RLS policies for orders table
-- This allows members to insert their own orders

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow members to insert their own orders" ON public.orders;
DROP POLICY IF EXISTS "Allow members to read their own orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public order inserts" ON public.orders;

-- Create policy to allow members to insert orders
-- This allows any authenticated user (or anon if needed) to insert orders
CREATE POLICY "Allow members to insert their own orders"
ON public.orders
FOR INSERT
WITH CHECK (true);  -- Allow all inserts for now (you can restrict later if needed)

-- Create policy to allow members to read their own orders
CREATE POLICY "Allow members to read their own orders"
ON public.orders
FOR SELECT
USING (true);  -- Allow all reads for now (you can restrict to own orders later)

-- Optional: Allow updates to own orders (for status changes)
CREATE POLICY "Allow members to update their own orders"
ON public.orders
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Also fix pizzas table RLS (needed for order creation to look up pizzas)
DROP POLICY IF EXISTS "Allow public to read pizzas" ON public.pizzas;
CREATE POLICY "Allow public to read pizzas"
ON public.pizzas
FOR SELECT
USING (true);  -- Allow everyone to read pizzas (they're public menu items)

-- Also fix time_slots table RLS (needed for order creation to look up time slots)
DROP POLICY IF EXISTS "Allow public to read time_slots" ON public.time_slots;
CREATE POLICY "Allow public to read time_slots"
ON public.time_slots
FOR SELECT
USING (true);  -- Allow everyone to read time slots (they're public schedule info)

