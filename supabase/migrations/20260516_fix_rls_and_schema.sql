-- Fix 1: Drop and recreate profiles RLS policies to prevent infinite recursion
-- The error "infinite recursion detected in policy for relation 'profiles'" occurs
-- when policies on profiles query the profiles table itself (e.g., admin subquery).

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access to own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable update access to own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert access to all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable all access to own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile (no recursion)" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

-- Clean, non-recursive policies for profiles
-- IMPORTANT: Do NOT add policies that query profiles from within a profiles policy
CREATE POLICY "Users can read own profile (no recursion)"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile (no recursion)"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Fix 2: Ensure custom_lists and list_items tables exist with proper relationships

CREATE TABLE IF NOT EXISTS public.custom_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.list_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    list_id UUID REFERENCES public.custom_lists(id) ON DELETE CASCADE NOT NULL,
    movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE NOT NULL,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(list_id, movie_id)
);

-- Ensure RLS is enabled
ALTER TABLE IF EXISTS public.custom_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.list_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to avoid duplicates on re-run
DROP POLICY IF EXISTS "Users can view their own lists" ON public.custom_lists;
DROP POLICY IF EXISTS "Users can insert their own lists" ON public.custom_lists;
DROP POLICY IF EXISTS "Users can update their own lists" ON public.custom_lists;
DROP POLICY IF EXISTS "Users can delete their own lists" ON public.custom_lists;
DROP POLICY IF EXISTS "Users can view items in their own lists" ON public.list_items;
DROP POLICY IF EXISTS "Users can insert items into their own lists" ON public.list_items;
DROP POLICY IF EXISTS "Users can delete items from their own lists" ON public.list_items;

-- Recreate list policies
CREATE POLICY "custom_lists_select"
    ON public.custom_lists FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "custom_lists_insert"
    ON public.custom_lists FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "custom_lists_update"
    ON public.custom_lists FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "custom_lists_delete"
    ON public.custom_lists FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "list_items_select"
    ON public.list_items FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.custom_lists
            WHERE custom_lists.id = list_items.list_id
            AND custom_lists.user_id = auth.uid()
        )
    );

CREATE POLICY "list_items_insert"
    ON public.list_items FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.custom_lists
            WHERE custom_lists.id = list_items.list_id
            AND custom_lists.user_id = auth.uid()
        )
    );

CREATE POLICY "list_items_delete"
    ON public.list_items FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.custom_lists
            WHERE custom_lists.id = list_items.list_id
            AND custom_lists.user_id = auth.uid()
        )
    );

-- Fix 3: Refresh PostgREST schema cache
-- This ensures PostgREST recognizes the relationship between custom_lists and list_items
SELECT pg_notify('pgrst', 'reload schema');
