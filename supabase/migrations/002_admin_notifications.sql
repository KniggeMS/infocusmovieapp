-- Migration 002: Admin notifications table
-- Stores in-app notifications for admins about new user registrations.
-- No external dependencies — pure Postgres.

CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type        TEXT NOT NULL DEFAULT 'new_registration',
  payload     JSONB NOT NULL DEFAULT '{}',
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Only admins can read
DROP POLICY IF EXISTS "admin_read_notifications" ON public.admin_notifications;
CREATE POLICY "admin_read_notifications" ON public.admin_notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Only admins can update (mark as read)
DROP POLICY IF EXISTS "admin_update_notifications" ON public.admin_notifications;
CREATE POLICY "admin_update_notifications" ON public.admin_notifications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Service role can insert (triggered by auth.users)
DROP POLICY IF EXISTS "service_insert_notifications" ON public.admin_notifications;
CREATE POLICY "service_insert_notifications" ON public.admin_notifications
  FOR INSERT WITH CHECK (true);
