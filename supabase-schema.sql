-- ============================================================
-- MedAI Platform — Supabase Schema Migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================================

-- ─── 1. PROFILES ─────────────────────────────────────────────
-- Auto-created for every new auth user via trigger below.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  role text default 'patient' check (role in ('patient', 'doctor', 'admin')),
  avatar_url text,
  medical_share boolean default true,
  notifications boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop existing trigger if present, then create
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ─── 2. DOCTORS ──────────────────────────────────────────────
create table if not exists public.doctors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  specialty text not null,
  location text,
  meet_link text,
  image_color text default 'bg-blue-500',
  available boolean default true,
  created_at timestamptz default now()
);

alter table public.doctors enable row level security;

-- Everyone can browse doctors
create policy "Anyone can view doctors"
  on public.doctors for select
  using (true);

-- Doctors can update their own row
create policy "Doctors can update own row"
  on public.doctors for update
  using (auth.uid() = user_id);


-- ─── 3. APPOINTMENTS ────────────────────────────────────────
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references auth.users(id) on delete cascade,
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  date date not null,
  time text not null,
  type text default 'offline' check (type in ('online', 'offline')),
  status text default 'upcoming' check (status in ('upcoming', 'completed', 'cancelled', 'rescheduled')),
  meet_link text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.appointments enable row level security;

create policy "Patients can view own appointments"
  on public.appointments for select
  using (auth.uid() = patient_id);

create policy "Patients can insert appointments"
  on public.appointments for insert
  with check (auth.uid() = patient_id);

create policy "Patients can update own appointments"
  on public.appointments for update
  using (auth.uid() = patient_id);

-- Doctors can also see appointments for them
create policy "Doctors can view their appointments"
  on public.appointments for select
  using (
    doctor_id in (
      select id from public.doctors where user_id = auth.uid()
    )
  );


-- ─── 4. MEDICAL RECORDS ─────────────────────────────────────
create table if not exists public.medical_records (
  id uuid primary key default gen_random_uuid(),
  record_number text unique,
  patient_id uuid not null references auth.users(id) on delete cascade,
  doctor_id uuid references public.doctors(id) on delete set null,
  type text default 'Prescription' check (type in ('Prescription', 'Report', 'Lab Result')),
  diagnosis text,
  status text default 'Pending Order' check (status in ('Pending Order', 'Ordered', 'Delivered', 'Archived')),
  date date default current_date,
  created_at timestamptz default now()
);

alter table public.medical_records enable row level security;

create policy "Patients can view own records"
  on public.medical_records for select
  using (auth.uid() = patient_id);

create policy "Doctors can view patient records"
  on public.medical_records for select
  using (
    doctor_id in (
      select id from public.doctors where user_id = auth.uid()
    )
  );

create policy "Doctors can insert records"
  on public.medical_records for insert
  with check (
    doctor_id in (
      select id from public.doctors where user_id = auth.uid()
    )
  );

create policy "Patients can update own record status"
  on public.medical_records for update
  using (auth.uid() = patient_id);


-- ─── 5. RECORD ITEMS (medicines on a medical record) ────────
create table if not exists public.record_items (
  id uuid primary key default gen_random_uuid(),
  record_id uuid not null references public.medical_records(id) on delete cascade,
  name text not null,
  dosage text,
  price numeric(10, 4) default 0
);

alter table public.record_items enable row level security;

create policy "Viewable if parent record is viewable"
  on public.record_items for select
  using (
    record_id in (
      select id from public.medical_records
      where patient_id = auth.uid()
         or doctor_id in (select id from public.doctors where user_id = auth.uid())
    )
  );

create policy "Insertable by doctors"
  on public.record_items for insert
  with check (
    record_id in (
      select id from public.medical_records
      where doctor_id in (select id from public.doctors where user_id = auth.uid())
    )
  );


-- ─── 6. PRESCRIPTIONS (written by doctors) ──────────────────
create table if not exists public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  prescription_number text unique,
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  patient_id uuid not null references auth.users(id) on delete cascade,
  diagnosis text,
  notes text,
  status text default 'sent' check (status in ('draft', 'sent', 'viewed')),
  created_at timestamptz default now()
);

alter table public.prescriptions enable row level security;

create policy "Doctors can view own prescriptions"
  on public.prescriptions for select
  using (
    doctor_id in (
      select id from public.doctors where user_id = auth.uid()
    )
  );

create policy "Patients can view own prescriptions"
  on public.prescriptions for select
  using (auth.uid() = patient_id);

create policy "Doctors can insert prescriptions"
  on public.prescriptions for insert
  with check (
    doctor_id in (
      select id from public.doctors where user_id = auth.uid()
    )
  );


-- ─── 7. PRESCRIPTION ITEMS ──────────────────────────────────
create table if not exists public.prescription_items (
  id uuid primary key default gen_random_uuid(),
  prescription_id uuid not null references public.prescriptions(id) on delete cascade,
  name text not null,
  dosage text,
  duration text
);

alter table public.prescription_items enable row level security;

create policy "Viewable if parent prescription is viewable"
  on public.prescription_items for select
  using (
    prescription_id in (
      select id from public.prescriptions
      where patient_id = auth.uid()
         or doctor_id in (select id from public.doctors where user_id = auth.uid())
    )
  );

create policy "Insertable by prescription's doctor"
  on public.prescription_items for insert
  with check (
    prescription_id in (
      select id from public.prescriptions
      where doctor_id in (select id from public.doctors where user_id = auth.uid())
    )
  );


-- ─── 8. SEED DATA — Doctors ─────────────────────────────────
-- These appear in the appointment booking dropdown immediately.
insert into public.doctors (name, specialty, location, meet_link, image_color) values
  ('Dr. Sarah Chen', 'General Physician', 'Online Meeting', 'https://meet.google.com/med-ai-consult', 'bg-blue-500'),
  ('Dr. Michael Ross', 'Neurologist', 'Neuro Clinic, Downtown', null, 'bg-purple-500'),
  ('Dr. Emily Park', 'Cardiologist', 'Heart Care Center', null, 'bg-red-500'),
  ('Dr. James Liu', 'Dermatologist', 'Skin & Care Clinic', null, 'bg-green-500')
on conflict do nothing;


-- ─── 9. HELPER: updated_at trigger ──────────────────────────
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists appointments_updated_at on public.appointments;
create trigger appointments_updated_at
  before update on public.appointments
  for each row execute function public.set_updated_at();
