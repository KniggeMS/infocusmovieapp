-- Ensure username and last_login_at columns exist on profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- Backfill usernames for existing users who don't have one
UPDATE public.profiles
SET username = LOWER(SPLIT_PART(email, '@', 1))
WHERE (username IS NULL OR username = '') AND email IS NOT NULL;

-- Ensure the columns are included in RLS policies
-- (Re-apply clean select policy that allows reading all columns)
DROP POLICY IF EXISTS "Users can read own profile (no recursion)" ON public.profiles;
CREATE POLICY "Users can read own profile (no recursion)"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Refresh PostgREST schema cache to pick up new columns
SELECT pg_notify('pgrst', 'reload schema');
