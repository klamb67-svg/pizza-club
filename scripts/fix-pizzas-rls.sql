-- Fix RLS policies for pizzas table
-- Allow reading pizzas so orders can look them up

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public to read pizzas" ON public.pizzas;
DROP POLICY IF EXISTS "Allow members to read pizzas" ON public.pizzas;

-- Create policy to allow reading pizzas (needed for order creation)
CREATE POLICY "Allow public to read pizzas"
ON public.pizzas
FOR SELECT
USING (true);  -- Allow everyone to read pizzas (they're public menu items)






















