-- RADICAL FIX: Drop ALL policies on profiles and recreate minimal, non-recursive ones

-- Drop all existing policies on profiles (regardless of name)
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
    END LOOP;
END $$;

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Single minimal SELECT policy: users can only see their own row
CREATE POLICY "select_own"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- Single minimal INSERT policy: users can insert their own profile
CREATE POLICY "insert_own"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Single minimal UPDATE policy: users can only update their own row
CREATE POLICY "update_own"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Single minimal DELETE policy: users can only delete their own row (unlikely needed)
CREATE POLICY "delete_own"
    ON public.profiles FOR DELETE
    USING (auth.uid() = id);

-- Refresh PostgREST schema cache
SELECT pg_notify('pgrst', 'reload schema');
