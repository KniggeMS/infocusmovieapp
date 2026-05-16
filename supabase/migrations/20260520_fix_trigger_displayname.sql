-- Fix: display_name and theme constraints break the trigger on signup

-- Remove NOT NULL constraint from display_name (should be nullable)
ALTER TABLE public.profiles ALTER COLUMN display_name DROP NOT NULL;

-- Drop CHECK constraint on theme (it restricts valid values)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_theme_check;

-- Set safe defaults
ALTER TABLE public.profiles ALTER COLUMN theme SET DEFAULT 'noir';

-- Re-create trigger function to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, username)
  VALUES (
    NEW.id,
    'user',
    NEW.raw_user_meta_data->>'username'
  )
  ON CONFLICT (id) DO UPDATE
    SET username = COALESCE(
      EXCLUDED.username,
      public.profiles.username
    );

  INSERT INTO public.admin_notifications (type, payload)
  VALUES (
    'new_registration',
    jsonb_build_object(
      'user_id',       NEW.id,
      'email',         NEW.email,
      'username',      NEW.raw_user_meta_data->>'username',
      'registered_at', now()
    )
  );

  RETURN NEW;
END;
$$;
