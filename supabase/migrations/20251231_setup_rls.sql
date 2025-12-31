-- 1. Ensure user_id column exists and defaults to the current user
-- This allows inserts without explicitly sending user_id
ALTER TABLE movies 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();

-- 2. Enable RLS (just in case)
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can insert their own movies" ON movies;
DROP POLICY IF EXISTS "Users can view their own movies" ON movies;
DROP POLICY IF EXISTS "Users can update their own movies" ON movies;
DROP POLICY IF EXISTS "Users can delete their own movies" ON movies;

-- 4. Create comprehensive RLS policies

-- INSERT: Allow if the user_id matches the auth uid (or is default)
CREATE POLICY "Users can insert their own movies"
ON movies FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- SELECT: Only see your own movies
CREATE POLICY "Users can view their own movies"
ON movies FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- UPDATE: Only update your own movies
CREATE POLICY "Users can update their own movies"
ON movies FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- DELETE: Only delete your own movies
CREATE POLICY "Users can delete their own movies"
ON movies FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
