-- The Chronicler MVP Supabase schema + RLS policies
-- Run this in Supabase SQL Editor after creating the project.

create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.issues (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  volume text,
  issue_number text,
  academic_year text,
  cover_image text,
  pdf_path text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_by uuid references public.users(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.issues(id) on delete cascade,
  page_number integer not null check (page_number > 0),
  image_path text not null,
  thumbnail_path text,
  created_at timestamptz not null default now(),
  unique (issue_id, page_number)
);

create index if not exists issues_status_published_idx on public.issues(status, published_at desc);
create index if not exists pages_issue_page_idx on public.pages(issue_id, page_number);

alter table public.users enable row level security;
alter table public.issues enable row level security;
alter table public.pages enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

-- users policies
drop policy if exists "Users can read own admin profile" on public.users;
create policy "Users can read own admin profile"
on public.users
for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "Admins can manage users" on public.users;
create policy "Admins can manage users"
on public.users
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- issues policies
drop policy if exists "Public can read published issues" on public.issues;
create policy "Public can read published issues"
on public.issues
for select
to anon, authenticated
using (status = 'published' or public.is_admin());

drop policy if exists "Admins can insert issues" on public.issues;
create policy "Admins can insert issues"
on public.issues
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update issues" on public.issues;
create policy "Admins can update issues"
on public.issues
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete issues" on public.issues;
create policy "Admins can delete issues"
on public.issues
for delete
to authenticated
using (public.is_admin());

-- pages policies
drop policy if exists "Public can read pages for published issues" on public.pages;
create policy "Public can read pages for published issues"
on public.pages
for select
to anon, authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.issues i
    where i.id = pages.issue_id
      and i.status = 'published'
  )
);

drop policy if exists "Admins can insert pages" on public.pages;
create policy "Admins can insert pages"
on public.pages
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update pages" on public.pages;
create policy "Admins can update pages"
on public.pages
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete pages" on public.pages;
create policy "Admins can delete pages"
on public.pages
for delete
to authenticated
using (public.is_admin());

-- Storage buckets
insert into storage.buckets (id, name, public)
values
  ('public-issues', 'public-issues', true),
  ('private-uploads', 'private-uploads', false)
on conflict (id) do nothing;

-- Storage policies
-- public-issues holds generated WebP pages. Table RLS controls which issue rows expose paths.
drop policy if exists "Public can read issue assets" on storage.objects;
create policy "Public can read issue assets"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'public-issues');

drop policy if exists "Admins can upload issue assets" on storage.objects;
create policy "Admins can upload issue assets"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'public-issues' and public.is_admin());

drop policy if exists "Admins can update issue assets" on storage.objects;
create policy "Admins can update issue assets"
on storage.objects
for update
to authenticated
using (bucket_id = 'public-issues' and public.is_admin())
with check (bucket_id = 'public-issues' and public.is_admin());

drop policy if exists "Admins can delete issue assets" on storage.objects;
create policy "Admins can delete issue assets"
on storage.objects
for delete
to authenticated
using (bucket_id = 'public-issues' and public.is_admin());

drop policy if exists "Admins can manage private uploads" on storage.objects;
create policy "Admins can manage private uploads"
on storage.objects
for all
to authenticated
using (bucket_id = 'private-uploads' and public.is_admin())
with check (bucket_id = 'private-uploads' and public.is_admin());
