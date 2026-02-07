-- Profiles table (auto-created on signup via trigger)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Diary entries (film log with rating + review)
create table if not exists public.diary_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  tmdb_movie_id integer not null,
  movie_title text not null,
  movie_poster_path text,
  movie_year text,
  rating numeric(2,1) check (rating >= 0.5 and rating <= 5),
  review text,
  watched_on date default current_date,
  created_at timestamptz default now()
);

alter table public.diary_entries enable row level security;
create policy "diary_select_all" on public.diary_entries for select using (true);
create policy "diary_insert_own" on public.diary_entries for insert with check (auth.uid() = user_id);
create policy "diary_update_own" on public.diary_entries for update using (auth.uid() = user_id);
create policy "diary_delete_own" on public.diary_entries for delete using (auth.uid() = user_id);

-- Watchlist
create table if not exists public.watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  tmdb_movie_id integer not null,
  movie_title text not null,
  movie_poster_path text,
  movie_year text,
  added_at timestamptz default now(),
  unique(user_id, tmdb_movie_id)
);

alter table public.watchlist enable row level security;
create policy "watchlist_select_all" on public.watchlist for select using (true);
create policy "watchlist_insert_own" on public.watchlist for insert with check (auth.uid() = user_id);
create policy "watchlist_delete_own" on public.watchlist for delete using (auth.uid() = user_id);

-- Custom lists
create table if not exists public.lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz default now()
);

alter table public.lists enable row level security;
create policy "lists_select_all" on public.lists for select using (true);
create policy "lists_insert_own" on public.lists for insert with check (auth.uid() = user_id);
create policy "lists_update_own" on public.lists for update using (auth.uid() = user_id);
create policy "lists_delete_own" on public.lists for delete using (auth.uid() = user_id);

-- List items
create table if not exists public.list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.lists(id) on delete cascade,
  tmdb_movie_id integer not null,
  movie_title text not null,
  movie_poster_path text,
  movie_year text,
  position integer default 0,
  added_at timestamptz default now(),
  unique(list_id, tmdb_movie_id)
);

alter table public.list_items enable row level security;
create policy "list_items_select_all" on public.list_items for select using (true);
create policy "list_items_insert_own" on public.list_items for insert 
  with check (exists (select 1 from public.lists where id = list_id and user_id = auth.uid()));
create policy "list_items_delete_own" on public.list_items for delete 
  using (exists (select 1 from public.lists where id = list_id and user_id = auth.uid()));

-- Likes (for diary entries)
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  diary_entry_id uuid not null references public.diary_entries(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, diary_entry_id)
);

alter table public.likes enable row level security;
create policy "likes_select_all" on public.likes for select using (true);
create policy "likes_insert_own" on public.likes for insert with check (auth.uid() = user_id);
create policy "likes_delete_own" on public.likes for delete using (auth.uid() = user_id);
