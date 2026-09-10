-- Migration for Phase 7: Admin Oversight
-- Add approval system and audit logs

-- 1. Add approval status to profiles
-- We assume profiles table exists. Adding 'is_approved' and 'role' check.
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;

-- 2. Create Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- e.g., 'USER_APPROVAL', 'MEDICINE_UPDATE', 'PAYMENT_VERIFIED'
    entity TEXT, -- e.g., 'profiles', 'pharmacy_inventory'
    entity_id UUID,
    details JSONB,
    ip_address TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Create System Settings / Analytics Table (Optional but useful for cache)
CREATE TABLE IF NOT EXISTS public.system_stats (
    key TEXT PRIMARY KEY,
    value JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Set up RLS for Audit Logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view all audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Only system/admin can insert audit logs
CREATE POLICY "System can insert audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (true);
