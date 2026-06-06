-- Migration: add ui_style to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ui_style TEXT
    NOT NULL
    DEFAULT 'minimal'
    CHECK (ui_style IN ('minimal', 'cinematic', 'modern', 'editorial'));

COMMENT ON COLUMN public.profiles.ui_style IS
  'UI layout style: minimal, cinematic, modern, editorial';
