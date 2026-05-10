-- Migration 001: Extend profiles table
-- Safe: ADD COLUMN IF NOT EXISTS — non-destructive, idempotent
-- Run in Supabase Dashboard > SQL Editor AFTER confirming with user.

-- Add username column (unique, case-insensitive index)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- Unique index on lowercase username for fast lookup
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_idx
  ON public.profiles (lower(username))
  WHERE username IS NOT NULL;

-- Assign admin role to martinstaiger72@gmail.com
-- Uses a subquery to avoid hardcoding UUIDs
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'martinstaiger72@gmail.com'
  LIMIT 1
);
