-- ITIL V5 Milestone: Vibe Engine v3.0 Base Schema
-- Service: Movie Recommendation Engine

create table if not exists public.movie_vibes (
  id uuid default uuid_generate_v4() primary key,
  movie_id uuid not null, -- references movies(id) - assuming id is uuid
  vibe_name text not null,
  intensity float check (intensity >= 0 and intensity <= 1),
  ai_metadata jsonb,
  created_at timestamp with time zone default now()
);

-- Indices for performance
create index if not exists idx_movie_vibes_name on public.movie_vibes(vibe_name);
create index if not exists idx_movie_vibes_movie_id on public.movie_vibes(movie_id);

-- Simple view for vibe exploration
create or replace view public.vibe_explorer as
select v.vibe_name, count(*) as frequency, avg(v.intensity) as avg_intensity
from public.movie_vibes v
group by v.vibe_name;
