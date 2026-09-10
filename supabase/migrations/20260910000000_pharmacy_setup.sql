-- Migration for Phase 5: Pharmacy and Inventory Management
-- Add pharmacy roles and tables

-- 1. Extend Profiles for Pharmacy Role
-- Assuming profiles table exists with a 'role' column
-- We will add pharmacy and delivery to the accepted roles in application logic, 
-- but for DB constraints if any, we ensure they are handled.

-- 2. Create Pharmacy Details Table
CREATE TABLE IF NOT EXISTS public.pharmacy_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    license_number TEXT UNIQUE NOT NULL,
    address TEXT,
    contact_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Create Medicine Inventory Table
CREATE TABLE IF NOT EXISTS public.pharmacy_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pharmacy_id UUID REFERENCES public.pharmacy_details(id) ON DELETE CASCADE,
    medicine_name TEXT NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    unit_price DECIMAL(10, 2) NOT NULL,
    category TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Update Orders Table
-- Add pharmacy_id and status enhancements
-- Note: using a check constraint for status if possible, or just relying on application logic
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS pharmacy_id UUID REFERENCES public.pharmacy_details(id),
ADD COLUMN IF NOT EXISTS fulfillment_status TEXT DEFAULT 'pending'; 
-- Statuses: pending, validated, preparing, ready_for_pickup, shipped, delivered

-- 5. Set up RLS (Row Level Security)
ALTER TABLE public.pharmacy_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_inventory ENABLE ROW LEVEL SECURITY;

-- Pharmacy can manage their own details
CREATE POLICY "Pharmacies can manage their own details" 
ON public.pharmacy_details 
FOR ALL 
USING (auth.uid() = user_id);

-- Pharmacy can manage their own inventory
CREATE POLICY "Pharmacies can manage their own inventory" 
ON public.pharmacy_inventory 
FOR ALL 
USING (
    pharmacy_id IN (
        SELECT id FROM public.pharmacy_details WHERE user_id = auth.uid()
    )
);

-- Users can view inventory of pharmacies (for browsing)
CREATE POLICY "Anyone can view pharmacy inventory" 
ON public.pharmacy_inventory 
FOR SELECT 
USING (true);
