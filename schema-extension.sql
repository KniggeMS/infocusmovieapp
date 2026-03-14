-- Schema Erweiterung für Serien und externe Bewertungen

-- 1. Add theme field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS theme text DEFAULT 'apple-frosted-light' CHECK (theme IN ('apple-frosted-light', 'apple-frosted-dark', 'cinema-noir', 'ocean-blue', 'sunset-purple', 'forest-green'));

-- 2. Diary Entries für Serien und externe Ratings erweitern
ALTER TABLE public.diary_entries 
ADD COLUMN IF NOT EXISTS media_type text NOT NULL DEFAULT 'movie' CHECK (media_type IN ('movie', 'tv_show'));

ALTER TABLE public.diary_entries 
ADD COLUMN IF NOT EXISTS imdb_rating numeric(3,1) CHECK (imdb_rating >= 0.0 and imdb_rating <= 10.0);

ALTER TABLE public.diary_entries 
ADD COLUMN IF NOT EXISTS rotten_tomatoes_rating numeric(3,1) CHECK (rotten_tomatoes_rating >= 0.0 and rotten_tomatoes_rating <= 100.0);

ALTER TABLE public.diary_entries 
ADD COLUMN IF NOT EXISTS season_number integer;
ALTER TABLE public.diary_entries 
ADD COLUMN IF NOT EXISTS episode_number integer;

-- 2. Watchlist für Serien erweitern
ALTER TABLE public.watchlist 
ADD COLUMN IF NOT EXISTS media_type text NOT NULL DEFAULT 'movie' CHECK (media_type IN ('movie', 'tv_show'));

ALTER TABLE public.watchlist 
ADD COLUMN IF NOT EXISTS season_number integer;
ALTER TABLE public.watchlist 
ADD COLUMN IF NOT EXISTS episode_number integer;

-- 3. Lists für Serien erweitern  
ALTER TABLE public.list_items 
ADD COLUMN IF NOT EXISTS media_type text NOT NULL DEFAULT 'movie' CHECK (media_type IN ('movie', 'tv_show'));

ALTER TABLE public.list_items 
ADD COLUMN IF NOT EXISTS season_number integer;
ALTER TABLE public.list_items 
ADD COLUMN IF NOT EXISTS episode_number integer;

-- 4. Likes für Serien erweitern
ALTER TABLE public.likes 
ADD COLUMN IF NOT EXISTS media_type text NOT NULL DEFAULT 'movie' CHECK (media_type IN ('movie', 'tv_show'));

-- 5. Externe Ratings Cache Tabelle
CREATE TABLE IF NOT EXISTS public.external_ratings (
  id uuid primary key default gen_random_uuid(),
  tmdb_id integer not null,
  media_type text not null check (media_type IN ('movie', 'tv_show')),
  imdb_id text,
  imdb_rating numeric(3,1),
  imdb_vote_count integer,
  rotten_tomatoes_rating numeric(3,1),
  rotten_tomatoes_fresh integer,
  rotten_tomatoes_rotten integer,
  metacritic_score integer,
  last_updated timestamptz default now(),
  unique(tmdb_id, media_type)
);

alter table public.external_ratings enable row level security;
drop policy if exists "external_ratings_select_all" on public.external_ratings;
create policy "external_ratings_select_all" on public.external_ratings for select using (true);
drop policy if exists "external_ratings_insert_own" on public.external_ratings;
create policy "external_ratings_insert_own" on public.external_ratings for insert with check (true);
drop policy if exists "external_ratings_update_own" on public.external_ratings;
create policy "external_ratings_update_own" on public.external_ratings for update using (true);

-- 6. Indexes für Performance
CREATE INDEX IF NOT EXISTS idx_diary_entries_media_type ON public.diary_entries(media_type);
CREATE INDEX IF NOT EXISTS idx_watchlist_media_type ON public.watchlist(media_type);
CREATE INDEX IF NOT EXISTS idx_list_items_media_type ON public.list_items(media_type);
CREATE INDEX IF NOT EXISTS idx_external_ratings_tmdb ON public.external_ratings(tmdb_id, media_type);
