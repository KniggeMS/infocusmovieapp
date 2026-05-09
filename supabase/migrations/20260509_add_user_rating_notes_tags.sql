-- Adds user-personal fields (rating, notes, tags) and persisted genres to movies.
-- Safe to run multiple times. Apply via Supabase SQL editor or `supabase db push`.

ALTER TABLE public.movies
    ADD COLUMN IF NOT EXISTS user_rating NUMERIC(3,1),
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    ADD COLUMN IF NOT EXISTS genres TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Optional sanity constraint for rating range (0..10)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage
        WHERE table_name = 'movies' AND constraint_name = 'movies_user_rating_range'
    ) THEN
        ALTER TABLE public.movies
            ADD CONSTRAINT movies_user_rating_range
            CHECK (user_rating IS NULL OR (user_rating >= 0 AND user_rating <= 10));
    END IF;
END $$;

-- GIN index for tag filtering
CREATE INDEX IF NOT EXISTS idx_movies_tags ON public.movies USING GIN (tags);
