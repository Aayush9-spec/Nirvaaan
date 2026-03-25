-- ============================================================
-- MedAI Platform — Phase 2 Schema Migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================================

-- ─── 1. VITALS TABLE ─────────────────────────────────────────
create table if not exists public.vitals (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references auth.users(id) on delete cascade,
  heart_rate integer,
  systolic integer,
  diastolic integer,
  spo2 numeric(5,2),
  temperature numeric(5,2),
  respiratory_rate integer,
  notes text,
  recorded_at timestamptz default now(),
  created_at timestamptz default now()
);

alter table public.vitals enable row level security;

create policy "Patients can view own vitals"
  on public.vitals for select
  using (auth.uid() = patient_id);

create policy "Patients can insert own vitals"
  on public.vitals for insert
  with check (auth.uid() = patient_id);

create policy "Doctors can view patient vitals"
  on public.vitals for select
  using (
    patient_id in (
      select a.patient_id from public.appointments a
      join public.doctors d on d.id = a.doctor_id
      where d.user_id = auth.uid()
    )
  );


-- ─── 2. LAB TESTS CATALOG ───────────────────────────────────
create table if not exists public.lab_tests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('pathlab', 'radiology')),
  description text,
  price numeric(10, 2) default 0,
  duration text,
  preparation text,
  available boolean default true,
  created_at timestamptz default now()
);

alter table public.lab_tests enable row level security;

create policy "Anyone can view lab tests"
  on public.lab_tests for select
  using (true);


-- ─── 3. LAB BOOKINGS ────────────────────────────────────────
create table if not exists public.lab_bookings (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references auth.users(id) on delete cascade,
  test_id uuid not null references public.lab_tests(id) on delete cascade,
  date date not null,
  time text,
  location text default 'Home Collection',
  status text default 'booked' check (status in ('booked', 'sample_collected', 'processing', 'completed', 'cancelled')),
  result_summary text,
  created_at timestamptz default now()
);

alter table public.lab_bookings enable row level security;

create policy "Patients can view own bookings"
  on public.lab_bookings for select
  using (auth.uid() = patient_id);

create policy "Patients can insert bookings"
  on public.lab_bookings for insert
  with check (auth.uid() = patient_id);

create policy "Patients can update own bookings"
  on public.lab_bookings for update
  using (auth.uid() = patient_id);


-- ─── 4. UPDATE PROFILES TRIGGER FOR ROLE ─────────────────────
-- Update the handle_new_user function to also handle role from metadata
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'role', 'patient')
  );

  -- If role is doctor, auto-create a doctors row
  if coalesce(new.raw_user_meta_data ->> 'role', 'patient') = 'doctor' then
    insert into public.doctors (user_id, name, specialty, location, meet_link)
    values (
      new.id,
      coalesce(new.raw_user_meta_data ->> 'full_name', 'Doctor'),
      coalesce(new.raw_user_meta_data ->> 'specialty', 'General Physician'),
      coalesce(new.raw_user_meta_data ->> 'location', ''),
      coalesce(new.raw_user_meta_data ->> 'meet_link', '')
    );
  end if;

  return new;
end;
$$ language plpgsql security definer;


-- ─── 5. SEED DATA — Lab Tests ────────────────────────────────

-- Pathlab tests
insert into public.lab_tests (name, category, description, price, duration, preparation) values
  ('Complete Blood Count (CBC)', 'pathlab', 'Measures red & white blood cells, hemoglobin, hematocrit, and platelets', 299, '4-6 hours', 'No fasting required'),
  ('Lipid Profile', 'pathlab', 'Total cholesterol, HDL, LDL, triglycerides, VLDL', 499, '6-8 hours', '12-hour fasting required'),
  ('Thyroid Panel (T3, T4, TSH)', 'pathlab', 'Complete thyroid function assessment', 599, '24 hours', 'No fasting required'),
  ('HbA1c (Glycated Hemoglobin)', 'pathlab', '3-month average blood sugar level', 449, '4-6 hours', 'No fasting required'),
  ('Liver Function Test (LFT)', 'pathlab', 'ALT, AST, bilirubin, albumin, alkaline phosphatase', 549, '6-8 hours', '10-12 hour fasting recommended'),
  ('Kidney Function Test (KFT)', 'pathlab', 'Creatinine, BUN, uric acid, electrolytes', 499, '6-8 hours', 'No fasting required'),
  ('Vitamin D (25-OH)', 'pathlab', 'Vitamin D deficiency screening', 799, '24-48 hours', 'No fasting required'),
  ('Complete Urine Examination', 'pathlab', 'Physical, chemical, and microscopic analysis', 199, '2-4 hours', 'Midstream sample preferred')
on conflict do nothing;

-- Radiology tests
insert into public.lab_tests (name, category, description, price, duration, preparation) values
  ('Chest X-Ray (PA View)', 'radiology', 'Standard chest radiograph for lung and heart assessment', 399, '30 minutes', 'Remove metal jewelry'),
  ('MRI Brain', 'radiology', 'Detailed brain imaging with contrast if needed', 4999, '45-60 minutes', 'Remove all metal objects, inform about implants'),
  ('CT Scan Abdomen', 'radiology', 'Cross-sectional imaging of abdominal organs', 3499, '30-45 minutes', '4-hour fasting, contrast may be given'),
  ('Ultrasound Abdomen', 'radiology', 'Non-invasive imaging of liver, kidney, spleen, pancreas', 999, '20-30 minutes', '6-hour fasting required'),
  ('DEXA Bone Density Scan', 'radiology', 'Bone mineral density measurement for osteoporosis screening', 1499, '15-20 minutes', 'No preparation needed'),
  ('Mammography', 'radiology', 'Breast cancer screening using low-dose X-rays', 1299, '20-30 minutes', 'Avoid deodorant/powder on exam day')
on conflict do nothing;
