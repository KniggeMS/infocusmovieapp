-- Add media_type column to movies table
ALTER TABLE public.movies 
ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'movie';
