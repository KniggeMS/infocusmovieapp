# Supabase Setup - Jetzt sofort durchführen!

## 🚀 Schnellste Methode (5 Minuten)

### 1. Supabase Dashboard öffnen
**URL:** https://supabase.com/dashboard/project/ekbpexbhuochrplzorce

### 2. SQL Editor → Tabellen erstellen
**Klick:** Links auf "SQL Editor"

**Füge diesen Code ein:**
```sql
-- Profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy if not exists "profiles_select_all" on public.profiles for select using (true);
create policy if not exists "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy if not exists "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile trigger
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

-- Diary entries
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
create policy if not exists "diary_select_all" on public.diary_entries for select using (true);
create policy if not exists "diary_insert_own" on public.diary_entries for insert with check (auth.uid() = user_id);
create policy if not exists "diary_update_own" on public.diary_entries for update using (auth.uid() = user_id);
create policy if not exists "diary_delete_own" on public.diary_entries for delete using (auth.uid() = user_id);

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
create policy if not exists "watchlist_select_all" on public.watchlist for select using (true);
create policy if not exists "watchlist_insert_own" on public.watchlist for insert with check (auth.uid() = user_id);
create policy if not exists "watchlist_delete_own" on public.watchlist for delete using (auth.uid() = user_id);

-- Lists
create table if not exists public.lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz default now()
);

alter table public.lists enable row level security;
create policy if not exists "lists_select_all" on public.lists for select using (true);
create policy if not exists "lists_insert_own" on public.lists for insert with check (auth.uid() = user_id);
create policy if not exists "lists_update_own" on public.lists for update using (auth.uid() = user_id);
create policy if not exists "lists_delete_own" on public.lists for delete using (auth.uid() = user_id);

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
create policy if not exists "list_items_select_all" on public.list_items for select using (true);
create policy if not exists "list_items_insert_own" on public.list_items for insert 
  with check (exists (select 1 from public.lists where id = list_id and user_id = auth.uid()));
create policy if not exists "list_items_delete_own" on public.list_items for delete 
  using (exists (select 1 from public.lists where id = list_id and user_id = auth.uid()));

-- Likes
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  diary_entry_id uuid not null references public.diary_entries(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, diary_entry_id)
);

alter table public.likes enable row level security;
create policy if not exists "likes_select_all" on public.likes for select using (true);
create policy if not exists "likes_insert_own" on public.likes for insert with check (auth.uid() = user_id);
create policy if not exists "likes_delete_own" on public.likes for delete using (auth.uid() = user_id);
```

**Klick:** "RUN" → Alle Tabellen werden erstellt!

### 3. Authentication konfigurieren
**Gehe zu:** Authentication → Settings

**Setze:**
- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/auth/callback`
- Enable email confirmations: **YES**

### 4. FERTIG! 🎉
Jetzt kannst du:
- Benutzer registrieren
- Email-Bestätigung erhalten
- Filme loggen
- Watchlist verwenden
- Listen erstellen

### ⚡ Für schnelle Tests (ohne Email)
Im Supabase Dashboard: **Disable email confirmations** → Registrierung funktioniert sofort
