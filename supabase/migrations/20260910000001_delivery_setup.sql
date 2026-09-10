-- Migration for Phase 6: Delivery Flow
-- Add delivery tracking and earnings

-- 1. Create Delivery Partner Profiles/Details
CREATE TABLE IF NOT EXISTS public.delivery_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    vehicle_type TEXT,
    phone_number TEXT,
    current_latitude DECIMAL(10, 8),
    current_longitude DECIMAL(10, 8),
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Create Deliveries Table
CREATE TABLE IF NOT EXISTS public.deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    delivery_partner_id UUID REFERENCES public.delivery_details(id),
    pickup_time TIMESTAMP WITH TIME ZONE,
    delivery_time TIMESTAMP WITH TIME ZONE,
    delivery_proof_url TEXT,
    status TEXT DEFAULT 'assigned', -- assigned, picked_up, out_for_delivery, delivered, cancelled
    earnings DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Set up RLS (Row Level Security)
ALTER TABLE public.delivery_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

-- Delivery partners can manage their own details
CREATE POLICY "Delivery partners can manage their own details" 
ON public.delivery_details 
FOR ALL 
USING (auth.uid() = user_id);

-- Delivery partners can see orders assigned to them
CREATE POLICY "Delivery partners can see their assigned deliveries" 
ON public.deliveries 
FOR ALL 
USING (
    delivery_partner_id IN (
        SELECT id FROM public.delivery_details WHERE user_id = auth.uid()
    )
);

-- Pharmacies can update delivery status when handing over package
CREATE POLICY "Pharmacies can assign deliveries" 
ON public.deliveries 
FOR INSERT 
WITH CHECK (true); -- Refined in app logic to check pharmacy role
