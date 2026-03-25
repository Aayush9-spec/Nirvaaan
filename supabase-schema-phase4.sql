-- ============================================================
-- Phase 5: Doctor Profile & Payments
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Update DOCTORS table with profile fields
alter table public.doctors 
add column if not exists bio text,
add column if not exists experience integer default 0,
add column if not exists consultation_fee numeric(10, 2) default 0,
add column if not exists phone text;

-- 2. Update APPOINTMENTS table for payments
alter table public.appointments
add column if not exists payment_status text default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
add column if not exists payment_id text, -- Razorpay payment_id
add column if not exists order_id text,   -- Razorpay order_id
add column if not exists amount numeric(10, 2) default 0;

-- 3. Policy to allow doctors to update their own profile (already exists but ensuring specific columns)
-- Existing policy: "Doctors can update own row" using (auth.uid() = user_id);

-- 4. Enable RLS on doctors if not already (it is)

-- 5. Payments Table (Optional, but good for audit)
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  appointment_id uuid references public.appointments(id),
  amount numeric(10, 2) not null,
  currency text default 'INR',
  provider text default 'razorpay',
  status text default 'pending',
  order_id text,
  payment_id text,
  signature text,
  created_at timestamptz default now()
);

alter table public.payments enable row level security;

create policy "Users can view own payments"
  on public.payments for select
  using (auth.uid() = user_id);

create policy "Users can insert own payments"
  on public.payments for insert
  with check (auth.uid() = user_id);
