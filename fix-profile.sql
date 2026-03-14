-- Check if profile exists for current user and create if missing
-- Replace 'YOUR_USER_ID' with the actual user ID from the error

-- First, let's check what users exist in auth but not in profiles
SELECT 
  au.id,
  au.email,
  au.created_at,
  p.id as profile_id
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- If you find your user, create the profile manually:
INSERT INTO public.profiles (id, display_name, avatar_url, created_at)
VALUES 
(
  'b1a41b03-afa6-4ba4-ade0-30b1bb404af5', -- Replace with your actual user ID
  'Test User', -- You can change this
  NULL,
  NOW()
)
ON CONFLICT (id) DO NOTHING;
