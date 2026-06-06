import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export type UIStyle = 'minimal' | 'cinematic' | 'modern' | 'editorial';

const UI_STYLE_KEY = 'infocus_ui_style';

export const UI_STYLE_LABELS: Record<UIStyle, { name: string; description: string; icon: string }> = {
  minimal:    { name: 'Premium & Minimal',   description: 'Klare Ästhetik, viel Whitespace',       icon: '◻' },
  cinematic:  { name: 'Cineastisch',          description: 'Dunkel, dramatisch, filmisch',           icon: '🎬' },
  modern:     { name: 'Modern & Lebendig',   description: 'Dashboard-Stil mit Sidebar',             icon: '⚡' },
  editorial:  { name: 'Bold & Editorial',    description: 'Starke Typografie, hell',                icon: '📰' },
};

function applyUIStyle(style: UIStyle) {
  document.documentElement.setAttribute('data-ui-style', style);
  try { localStorage.setItem(UI_STYLE_KEY, style); } catch { /* sandboxed */ }
}

function getStoredUIStyle(): UIStyle {
  try {
    const stored = localStorage.getItem(UI_STYLE_KEY);
    if (stored && ['minimal', 'cinematic', 'modern', 'editorial'].includes(stored)) {
      return stored as UIStyle;
    }
  } catch { /* sandboxed */ }
  return 'minimal';
}

export function useUIStyle() {
  const [uiStyle, setUIStyleState] = useState<UIStyle>(getStoredUIStyle);
  const [loading, setLoading] = useState(false);

  // Beim ersten Render: Style sofort anwenden
  useEffect(() => {
    applyUIStyle(uiStyle);

    // Style aus Supabase laden falls eingeloggt
    const loadFromDB = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('ui_style')
        .eq('id', user.id)
        .single();

      // any-Cast nötig bis Supabase-Typen regeneriert werden
      const dbStyle = (data as any)?.ui_style as UIStyle | undefined;
      if (dbStyle && ['minimal', 'cinematic', 'modern', 'editorial'].includes(dbStyle)) {
        setUIStyleState(dbStyle);
        applyUIStyle(dbStyle);
      }
    };

    loadFromDB();
  }, []);

  const setUIStyle = useCallback(async (style: UIStyle) => {
    setUIStyleState(style);
    applyUIStyle(style);

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('profiles')
        .update({ ui_style: style } as any)  // any-Cast bis Typen regeneriert
        .eq('id', user.id);
    } catch (err) {
      console.error('Fehler beim Speichern des UI-Styles:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { uiStyle, setUIStyle, loading, labels: UI_STYLE_LABELS };
}