import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export type UIStyle = 'minimal' | 'cinematic' | 'modern' | 'editorial';

const UI_STYLE_KEY = 'infocus_ui_style';

const UI_STYLE_LABELS: Record<UIStyle, { name: string; description: string; icon: string }> = {
  minimal: {
    name: 'Premium & Minimal',
    description: 'Klare Ästhetik, viel Whitespace – inspiriert von Letterboxd',
    icon: '◻',
  },
  cinematic: {
    name: 'Cineastisch',
    description: 'Dunkel, dramatisch, filmisch – inspiriert von Mubi',
    icon: '🎬',
  },
  modern: {
    name: 'Modern & Lebendig',
    description: 'Dashboard-Stil mit Sidebar – inspiriert von Vercel',
    icon: '⚡',
  },
  editorial: {
    name: 'Bold & Editorial',
    description: 'Starke Typografie, hell – inspiriert von Stripe Press',
    icon: '📰',
  },
};

export { UI_STYLE_LABELS };

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
  const { user } = useAuth();
  const [uiStyle, setUIStyleState] = useState<UIStyle>(getStoredUIStyle);
  const [loading, setLoading] = useState(false);

  // Beim Login: Style aus Supabase laden
  useEffect(() => {
    if (!user) return;
    const loadStyle = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('ui_style')
        .eq('id', user.id)
        .single();
      if (data?.ui_style) {
        const style = data.ui_style as UIStyle;
        setUIStyleState(style);
        applyUIStyle(style);
      }
    };
    loadStyle();
  }, [user]);

  // Beim ersten Render: gespeicherten Style anwenden
  useEffect(() => {
    applyUIStyle(uiStyle);
  }, []);

  const setUIStyle = useCallback(async (style: UIStyle) => {
    setUIStyleState(style);
    applyUIStyle(style);

    if (!user) return;
    setLoading(true);
    try {
      await supabase
        .from('profiles')
        .update({ ui_style: style })
        .eq('id', user.id);
    } catch (err) {
      console.error('Fehler beim Speichern des UI-Styles:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  return { uiStyle, setUIStyle, loading, labels: UI_STYLE_LABELS };
}
