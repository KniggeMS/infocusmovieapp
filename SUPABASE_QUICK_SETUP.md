# Supabase Quick Setup

## Methode 1: Supabase Dashboard (Empfohlen)

### 1. Öffne Supabase Dashboard
- Gehe zu: https://supabase.com/dashboard
- Login mit deinem Account
- Wähle Projekt: `ekbpexbhuochrplzorce`

### 2. Tabellen erstellen
**SQL Editor öffnen:**
- Links auf "SQL Editor" klicken
- Neues Query erstellen

**Schema erstellen:**
```sql
-- Führe diesen Code aus:
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
```

**Weitere Tabellen:**
```sql
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
```

### 3. Authentifizierung konfigurieren
**Authentication Settings:**
- Gehe zu **Authentication > Settings**
- Setze **Site URL**: `http://localhost:3000`
- Füge hinzu zu **Redirect URLs**: `http://localhost:3000/auth/callback`
- Aktiviere **Enable email confirmations**

### 4. Testen
- Registriere neuen Benutzer
- Bestätigungs-Email sollte ankommen
- Nach Bestätigung sollte Benutzer eingeloggt sein

## Methode 2: MCP Server (Wenn verfügbar)

Wenn der Supabase MCP Server funktioniert:
1. Füge den MCP Code zu deiner IDE Konfiguration hinzu
2. Starte IDE neu
3. MCP sollte automatisch Tabellen erstellen können

## Schneller Test (Ohne Email-Bestätigung)
Für Entwicklung:
- Im Supabase Dashboard: **Authentication > Settings**
- Deaktiviere **Enable email confirmations**
- Registrierung funktioniert sofort ohne Email
