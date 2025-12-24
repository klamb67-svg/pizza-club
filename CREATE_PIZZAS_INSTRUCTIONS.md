# Create Pizzas in Database

## Issue
The pizzas table is empty, so when users try to order "Sausage Pizza", it can't find a matching pizza in the database.

## Solution
Run the SQL in `scripts/create-pizzas.sql` to insert the pizzas.

## Steps

1. **Go to Supabase Dashboard**
   - Navigate to https://supabase.com/dashboard
   - Select your Pizza Club project
   - Click **SQL Editor** in the left sidebar

2. **Run the SQL**
   - Copy the contents of `scripts/create-pizzas.sql`
   - Paste it into the SQL Editor
   - Click **Run** or press `Ctrl+Enter`

3. **Verify**
   - Go to **Table Editor** → `pizzas` table
   - You should see 4 pizzas: Cheese, Pepperoni, Sausage, Special

4. **Test**
   - Try creating an order again in the app
   - It should now find the pizza!

## What the SQL Does

- Deletes any existing pizzas with those names (to avoid duplicates)
- Inserts 4 pizzas:
  - **Cheese** - $18.99
  - **Pepperoni** - $19.99
  - **Sausage** - $18.99
  - **Special** - $21.99

## If You Get Errors

If you get errors about missing columns, the pizzas table might have a different schema. In that case:

1. Check the pizzas table schema in Supabase
2. Adjust the INSERT statements to match your actual columns
3. Or just insert with minimal required fields (name, price, available)























