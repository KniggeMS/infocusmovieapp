-- Add watched_at to movies for diary tracking
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS watched_at TIMESTAMPTZ;

-- Backfill watched_at for existing watched movies
UPDATE public.movies SET watched_at = created_at WHERE watched = TRUE AND watched_at IS NULL;

-- Episode tracking table
CREATE TABLE IF NOT EXISTS public.tv_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    tmdb_id BIGINT NOT NULL,
    title TEXT NOT NULL,
    season_number INTEGER NOT NULL,
    episode_number INTEGER NOT NULL,
    watched BOOLEAN DEFAULT FALSE,
    watched_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, tmdb_id, season_number, episode_number)
);

ALTER TABLE public.tv_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own TV progress"
    ON public.tv_progress
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Store total season/episode count per TV show for progress tracking
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS total_seasons INTEGER;
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS total_episodes INTEGER;
