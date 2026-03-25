-- =============================================
-- Phase 3: Notifications + Storage Policies
-- Run in Supabase Dashboard → SQL Editor
-- =============================================

-- 1. Notifications Table
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  message text not null,
  type text default 'info' check (type in ('info', 'appointment', 'lab', 'prescription', 'vitals', 'system')),
  read boolean default false,
  link text,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;

create policy "Users see their notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can update their notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

create policy "Service can insert notifications"
  on public.notifications for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their notifications"
  on public.notifications for delete
  using (auth.uid() = user_id);

-- Index for fast unread queries
create index if not exists idx_notifications_user_unread
  on public.notifications (user_id, read, created_at desc);

-- 2. Storage Buckets (run these separately if the SQL fails)
-- Note: Bucket creation via SQL may not work on all Supabase plans.
-- If it fails, create them manually in Dashboard → Storage:
--   - "avatars" (public)
--   - "medical-docs" (private)

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('medical-docs', 'medical-docs', false)
on conflict (id) do nothing;

-- Storage policies for avatars (public read, authenticated upload)
create policy "Avatar public read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users upload own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users update own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users delete own avatar"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for medical-docs (owner only)
create policy "Users read own docs"
  on storage.objects for select
  using (bucket_id = 'medical-docs' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users upload own docs"
  on storage.objects for insert
  with check (bucket_id = 'medical-docs' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users delete own docs"
  on storage.objects for delete
  using (bucket_id = 'medical-docs' and auth.uid()::text = (storage.foldername(name))[1]);
