-- Update rating field to allow 1-10 scale
ALTER TABLE public.diary_entries 
ALTER COLUMN rating TYPE numeric(3,1) 
USING rating::numeric(3,1);

-- Update constraint to allow 1-10
ALTER TABLE public.diary_entries 
DROP CONSTRAINT IF EXISTS diary_entries_rating_check;

ALTER TABLE public.diary_entries 
ADD CONSTRAINT diary_entries_rating_check 
CHECK (rating >= 0.5 and rating <= 10);
