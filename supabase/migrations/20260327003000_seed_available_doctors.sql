-- Ensure default available doctors exist for appointment booking.
-- Mirrors supabase/seed.sql and is idempotent.

insert into public.doctors (
    id,
    user_id,
    name,
    specialty,
    location,
    meet_link,
    image_color,
    available
) values
    (
        '8aa1f4be-8869-4d75-95c8-6a1f5bb7d001',
        null,
        'Dr. Sarah Chen',
        'General Physician',
        'Bengaluru',
        'https://meet.google.com/med-ai-gp',
        'bg-blue-500',
        true
    ),
    (
        '8aa1f4be-8869-4d75-95c8-6a1f5bb7d002',
        null,
        'Dr. Emily Park',
        'Cardiologist',
        'Mumbai',
        'https://meet.google.com/med-ai-cardio',
        'bg-rose-500',
        true
    ),
    (
        '8aa1f4be-8869-4d75-95c8-6a1f5bb7d003',
        null,
        'Dr. James Wilson',
        'Dermatologist',
        'Delhi',
        'https://meet.google.com/med-ai-derm',
        'bg-emerald-500',
        true
    ),
    (
        '8aa1f4be-8869-4d75-95c8-6a1f5bb7d004',
        null,
        'Dr. Priya Nair',
        'Neurologist',
        'Hyderabad',
        'https://meet.google.com/med-ai-neuro',
        'bg-purple-500',
        true
    )
on conflict (id) do update
set
    name = excluded.name,
    specialty = excluded.specialty,
    location = excluded.location,
    meet_link = excluded.meet_link,
    image_color = excluded.image_color,
    available = true;
