-- Migration 003: Triggers + helper functions
-- 1. handle_new_user: On new signup → upsert profile, create admin notification
-- 2. get_email_by_username: RPC to resolve username → email for login

-- Function: called on new auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Upsert profile with username from metadata
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

  -- Insert admin notification
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

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RPC: resolve username → email (SECURITY DEFINER so it can read auth.users)
CREATE OR REPLACE FUNCTION public.get_email_by_username(p_username TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT;
BEGIN
  SELECT u.email INTO v_email
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE lower(p.username) = lower(p_username)
  LIMIT 1;

  RETURN v_email;
END;
$$;

-- Grant execute to authenticated + anon (needed for login flow before session)
GRANT EXECUTE ON FUNCTION public.get_email_by_username(TEXT) TO anon, authenticated;
