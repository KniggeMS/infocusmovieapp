-- Create custom_lists table
CREATE TABLE IF NOT EXISTS public.custom_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create list_items junction table
CREATE TABLE IF NOT EXISTS public.list_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    list_id UUID REFERENCES public.custom_lists(id) ON DELETE CASCADE NOT NULL,
    movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE NOT NULL,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(list_id, movie_id)
);

-- Enable RLS
ALTER TABLE public.custom_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for custom_lists
CREATE POLICY "Users can view their own lists"
ON public.custom_lists FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lists"
ON public.custom_lists FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lists"
ON public.custom_lists FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lists"
ON public.custom_lists FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies for list_items
CREATE POLICY "Users can view items in their own lists"
ON public.list_items FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.custom_lists
        WHERE custom_lists.id = list_items.list_id
        AND custom_lists.user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert items into their own lists"
ON public.list_items FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.custom_lists
        WHERE custom_lists.id = list_items.list_id
        AND custom_lists.user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete items from their own lists"
ON public.list_items FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.custom_lists
        WHERE custom_lists.id = list_items.list_id
        AND custom_lists.user_id = auth.uid()
    )
);
