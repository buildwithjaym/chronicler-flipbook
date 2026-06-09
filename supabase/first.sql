-- Chronicler Phase 1: Auth + Staff Users only

create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,

  full_name text,
  email text not null unique,

  role text not null default 'pending'
    check (role in ('pending', 'staff', 'editor', 'admin')),

  status text not null default 'pending'
    check (status in ('pending', 'active', 'disabled')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists users_email_idx on public.users(email);
create index if not exists users_role_status_idx on public.users(role, status);

alter table public.users enable row level security;

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_set_updated_at on public.users;

create trigger users_set_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

-- Admin checker
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
      and u.status = 'active'
  );
$$;

-- Staff checker: admin, editor, and staff can enter staff area
create or replace function public.is_staff()
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
      and u.role in ('admin', 'editor', 'staff')
      and u.status = 'active'
  );
$$;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_staff() to authenticated;

-- Auto-create public user profile when auth user is created.
-- New users are pending by default. They cannot enter admin until activated.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (
    id,
    full_name,
    email,
    role,
    status
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    'pending',
    'pending'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_auth_user();

-- RLS policies

drop policy if exists "Users can read own profile" on public.users;

create policy "Users can read own profile"
on public.users
for select
to authenticated
using (
  id = auth.uid()
  or public.is_admin()
);

drop policy if exists "Admins can insert users" on public.users;

create policy "Admins can insert users"
on public.users
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update users" on public.users;

create policy "Admins can update users"
on public.users
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete users" on public.users;

create policy "Admins can delete users"
on public.users
for delete
to authenticated
using (public.is_admin());

grant select, insert, update, delete on public.users to authenticated;