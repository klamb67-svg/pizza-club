-- Create pizzas in the pizzas table
-- These match the pizzas shown in the menu (Cheese, Pepperoni, Sausage, Special)
-- Schema: id (uuid), name (text), image_url (text), is_active (bool), created_at (timestamptz)

-- First, delete any existing pizzas with these names to avoid duplicates
DELETE FROM public.pizzas WHERE name IN ('Cheese', 'Pepperoni', 'Sausage', 'Special');

-- Insert the pizzas with only the columns that exist
-- Cheese Pizza
INSERT INTO public.pizzas (name, image_url, is_active)
VALUES (
  'Cheese',
  'https://bvmwcswddbepelgctybs.supabase.co/storage/v1/object/public/pizza/CPizza.png',
  true
);

-- Pepperoni Pizza
INSERT INTO public.pizzas (name, image_url, is_active)
VALUES (
  'Pepperoni',
  'https://bvmwcswddbepelgctybs.supabase.co/storage/v1/object/public/pizza/PPizza1.png',
  true
);

-- Sausage Pizza
INSERT INTO public.pizzas (name, image_url, is_active)
VALUES (
  'Sausage',
  'https://bvmwcswddbepelgctybs.supabase.co/storage/v1/object/public/pizza/SPizza.png',
  true
);

-- Special Pizza
INSERT INTO public.pizzas (name, image_url, is_active)
VALUES (
  'Special',
  'https://bvmwcswddbepelgctybs.supabase.co/storage/v1/object/public/pizza/LPizza.png',
  true
);

