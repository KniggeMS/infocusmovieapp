-- InFocus MVP migration: profiles, roles, username login, admin notifications

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  username text unique,
  display_name text,
  role text not null default 'user' check (role in ('admin', 'manager', 'user')),
  created_at timestamptz not null default now(),
  last_login_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists email text,
  add column if not exists username text,
  add column if not exists display_name text,
  add column if not exists role text not null default 'user',
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists last_login_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists profiles_username_unique_idx on public.profiles (lower(username));
create unique index if not exists profiles_email_unique_idx on public.profiles (lower(email));

create table if not exists public.admin_notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'new_registration',
  user_id uuid references public.profiles(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.admin_notifications
  add column if not exists type text not null default 'new_registration',
  add column if not exists user_id uuid references public.profiles(id) on delete cascade,
  add column if not exists payload jsonb not null default '{}'::jsonb,
  add column if not exists read_at timestamptz,
  add column if not exists created_at timestamptz not null default now();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, username, display_name, role, created_at, last_login_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    case
      when lower(new.email) = lower('martinstaiger72@gmail.com') then 'admin'
      else 'user'
    end,
    coalesce(new.created_at, now()),
    new.last_sign_in_at
  )
  on conflict (id) do update
    set email = excluded.email,
        username = coalesce(excluded.username, public.profiles.username),
        display_name = coalesce(excluded.display_name, public.profiles.display_name),
        updated_at = now();

  insert into public.admin_notifications (type, user_id, payload)
  select
    'new_registration',
    new.id,
    jsonb_build_object('email', new.email, 'username', coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)))
  where exists (
    select 1 from public.profiles p
    where p.id = new.id
      and p.role = 'user'
  );

  return new;
end;
$$;

create or replace function public.touch_login_timestamp()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.last_login_at = now();
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.get_email_by_username(p_username text)
returns text
language sql
security definer
set search_path = public
as $$
  select email
  from public.profiles
  where lower(username) = lower(p_username)
  limit 1;
$$;

create or replace function public.get_profile_by_identifier(p_identifier text)
returns table (
  id uuid,
  email text,
  username text,
  role text,
  created_at timestamptz,
  last_login_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select id, email, username, role, created_at, last_login_at
  from public.profiles
  where lower(email) = lower(p_identifier)
     or lower(username) = lower(p_identifier)
  limit 1;
$$;

create or replace view public.public_profiles as
select id, username, display_name, role, created_at, last_login_at
from public.profiles;

alter table public.profiles enable row level security;
alter table public.admin_notifications enable row level security;

-- Profiles policies
create policy if not exists "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy if not exists "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy if not exists "Admins can read all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Admin notifications policies
create policy if not exists "Admins can read notifications"
  on public.admin_notifications for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy if not exists "Admins can update notifications"
  on public.admin_notifications for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Trigger attachment (idempotent recreation)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update of last_sign_in_at on auth.users
  for each row execute procedure public.touch_login_timestamp();

-- Minimal helper to set admin role for the requested user later in SQL execution:
-- update public.profiles set role = 'admin' where lower(email) = lower('martinstaiger72@gmail.com');
