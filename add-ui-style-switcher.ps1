<#
.SYNOPSIS
  Fügt einen UI-Style-Switcher (4 Designs) zu InFocus hinzu.
  - Supabase Migration: ui_style Spalte in profiles
  - useUIStyle Hook
  - UIStyleSwitcher Komponente
  - CSS-Variablen für alle 4 Styles in index.css
  - Integration in App.tsx
  - Font-Loader Utility

.NOTES
  Ausführen aus dem Repo-Root: .\add-ui-style-switcher.ps1
  Idempotent: kann mehrfach ausgeführt werden.
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# ── Pfade ──────────────────────────────────────────────────────────────────────
$repoRoot      = $PSScriptRoot
$srcDir        = Join-Path $repoRoot "src"
$hooksDir      = Join-Path $srcDir "hooks"
$componentsDir = Join-Path $srcDir "components"
$indexCss      = Join-Path $srcDir "index.css"

Write-Host "`n🎨 InFocus: UI-Style-Switcher Setup" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────" -ForegroundColor DarkGray

# ── 1. Supabase Migration ──────────────────────────────────────────────────────
Write-Host "`n[1/6] Supabase Migration..." -ForegroundColor Yellow

$migrationSql = @'
-- Migration: add ui_style to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ui_style TEXT
    NOT NULL
    DEFAULT 'minimal'
    CHECK (ui_style IN ('minimal', 'cinematic', 'modern', 'editorial'));

COMMENT ON COLUMN public.profiles.ui_style IS
  'UI layout style: minimal, cinematic, modern, editorial';
'@

$migrationDir = Join-Path $repoRoot "supabase\migrations"
if (-not (Test-Path $migrationDir)) {
    New-Item -ItemType Directory -Path $migrationDir -Force | Out-Null
}
$migrationFile = Join-Path $migrationDir "20260606_add_ui_style_to_profiles.sql"
if (-not (Test-Path $migrationFile)) {
    Set-Content -Path $migrationFile -Value $migrationSql -Encoding UTF8
    Write-Host "  ✅ Migration erstellt: supabase/migrations/20260606_add_ui_style_to_profiles.sql" -ForegroundColor Green
} else {
    Write-Host "  ⏭️  Migration bereits vorhanden" -ForegroundColor Yellow
}

# ── 2. useUIStyle Hook ─────────────────────────────────────────────────────────
Write-Host "`n[2/6] useUIStyle Hook..." -ForegroundColor Yellow

if (-not (Test-Path $hooksDir)) {
    New-Item -ItemType Directory -Path $hooksDir | Out-Null
}

$hookFile = Join-Path $hooksDir "useUIStyle.ts"
$hookContent = @'
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
'@

if (-not (Test-Path $hookFile)) {
    Set-Content -Path $hookFile -Value $hookContent -Encoding UTF8
    Write-Host "  ✅ Hook erstellt: src/hooks/useUIStyle.ts" -ForegroundColor Green
} else {
    Write-Host "  ⏭️  Hook bereits vorhanden" -ForegroundColor Yellow
}

# ── 3. UIStyleSwitcher Komponente ──────────────────────────────────────────────
Write-Host "`n[3/6] UIStyleSwitcher Komponente..." -ForegroundColor Yellow

$switcherFile = Join-Path $componentsDir "UIStyleSwitcher.tsx"
$switcherContent = @'
import React from 'react';
import { useUIStyle, UIStyle, UI_STYLE_LABELS } from '../hooks/useUIStyle';
import { useTranslation } from 'react-i18next';

interface UIStyleSwitcherProps {
  compact?: boolean;
}

export function UIStyleSwitcher({ compact = false }: UIStyleSwitcherProps) {
  const { uiStyle, setUIStyle, loading } = useUIStyle();
  const { t } = useTranslation();

  const styles = Object.entries(UI_STYLE_LABELS) as [UIStyle, typeof UI_STYLE_LABELS[UIStyle]][];

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {styles.map(([style, meta]) => (
          <button
            key={style}
            onClick={() => setUIStyle(style)}
            disabled={loading}
            title={meta.name}
            aria-label={meta.name}
            aria-pressed={uiStyle === style}
            className={`
              w-8 h-8 rounded-lg text-base transition-all duration-200
              flex items-center justify-center
              ${uiStyle === style
                ? 'bg-app-accent text-white shadow-lg scale-105'
                : 'bg-app-secondary/50 text-app-text-muted hover:bg-app-secondary hover:text-app-text'
              }
            `}
          >
            {meta.icon}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-app-text-muted uppercase tracking-wider font-semibold mb-3">
        {t('settings.uiStyle', 'UI Design')}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {styles.map(([style, meta]) => (
          <button
            key={style}
            onClick={() => setUIStyle(style)}
            disabled={loading}
            aria-pressed={uiStyle === style}
            className={`
              relative p-3 rounded-xl text-left transition-all duration-200
              border-2 group
              ${uiStyle === style
                ? 'border-app-accent bg-app-accent/10 shadow-md'
                : 'border-app-border bg-app-secondary/30 hover:border-app-accent/40 hover:bg-app-secondary/60'
              }
            `}
          >
            {uiStyle === style && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-app-accent" />
            )}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{meta.icon}</span>
              <span className={`text-xs font-bold leading-tight ${
                uiStyle === style ? 'text-app-accent' : 'text-app-text'
              }`}>
                {meta.name}
              </span>
            </div>
            <p className="text-xs text-app-text-muted leading-snug">
              {meta.description}
            </p>
            <div className="mt-2 h-10 rounded-lg overflow-hidden opacity-60 group-hover:opacity-80 transition-opacity">
              <StylePreview style={style} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function StylePreview({ style }: { style: UIStyle }) {
  const previews: Record<UIStyle, React.ReactNode> = {
    minimal: (
      <div className="w-full h-full bg-neutral-900 flex items-center gap-1.5 px-2">
        <div className="w-5 h-7 rounded-sm bg-neutral-700/80 flex-shrink-0" />
        <div className="flex-1 space-y-1">
          <div className="h-1.5 bg-neutral-600 rounded-full w-3/4" />
          <div className="h-1 bg-neutral-700 rounded-full w-1/2" />
          <div className="flex gap-0.5 mt-0.5">
            {[1,2,3,4,5].map(i => <div key={i} className="w-1.5 h-1.5 rounded-sm bg-emerald-500/40" />)}
          </div>
        </div>
      </div>
    ),
    cinematic: (
      <div className="w-full h-full flex items-end" style={{background:'linear-gradient(135deg,#1a0808,#08080a)'}}>
        <div className="w-full h-7 flex items-center px-2 gap-2"
             style={{background:'linear-gradient(to top, rgba(229,57,53,0.15), transparent)'}}>
          <div className="h-1.5 bg-red-600/60 rounded-full w-2/3" />
          <div className="h-1.5 bg-amber-400/40 rounded-full w-1/4 ml-auto" />
        </div>
      </div>
    ),
    modern: (
      <div className="w-full h-full flex" style={{background:'#0d0d0d'}}>
        <div className="w-6 h-full flex-shrink-0" style={{background:'#111',borderRight:'1px solid rgba(255,255,255,0.06)'}}>
          {[1,2,3].map(i => <div key={i} className="mx-1 mt-1.5 h-1 bg-indigo-500/30 rounded-full" />)}
        </div>
        <div className="flex-1 p-1.5 space-y-1">
          <div className="grid grid-cols-2 gap-0.5">
            {[1,2,3,4].map(i => <div key={i} className="h-2.5 rounded bg-neutral-800/80" />)}
          </div>
          <div className="h-1 bg-neutral-800 rounded-full w-full" />
          <div className="h-1 bg-neutral-800 rounded-full w-3/4" />
        </div>
      </div>
    ),
    editorial: (
      <div className="w-full h-full" style={{background:'#f5f3ee'}}>
        <div className="w-full h-4 flex items-center px-2 gap-1" style={{background:'#1a1814'}}>
          <div className="h-1 bg-amber-400/60 rounded-full w-1/4" />
          <div className="h-1 bg-neutral-600 rounded-full w-1/3 ml-auto" />
        </div>
        <div className="px-2 pt-1 space-y-0.5">
          <div className="h-2 bg-neutral-800/20 rounded-full w-3/4" />
          <div className="h-1 bg-neutral-400/30 rounded-full w-full" />
          <div className="flex gap-0.5 mt-1">
            {[1,2,3].map(i => <div key={i} className="w-4 h-5 rounded bg-neutral-300/60" />)}
          </div>
        </div>
      </div>
    ),
  };
  return <>{previews[style]}</>;
}
'@

if (-not (Test-Path $switcherFile)) {
    Set-Content -Path $switcherFile -Value $switcherContent -Encoding UTF8
    Write-Host "  ✅ Komponente erstellt: src/components/UIStyleSwitcher.tsx" -ForegroundColor Green
} else {
    Write-Host "  ⏭️  Komponente bereits vorhanden" -ForegroundColor Yellow
}

# ── 4. CSS-Variablen für alle 4 UI-Styles in index.css einfügen ────────────────
Write-Host "`n[4/6] CSS-Variablen für UI-Styles..." -ForegroundColor Yellow

$cssVars = @'

/* ══════════════════════════════════════════════════════════════════════════════
   UI-STYLE VARIABLEN — gesteuert via data-ui-style auf <html>
══════════════════════════════════════════════════════════════════════════════ */

[data-ui-style="minimal"] {
  --ui-font-display: 'Instrument Serif', Georgia, serif;
  --ui-font-body: 'DM Sans', system-ui, sans-serif;
  --ui-radius-card: 6px;
  --ui-radius-button: 6px;
  --ui-nav-height: 56px;
  --ui-nav-style: top;
  --ui-card-aspect: 2 / 3;
  --ui-spacing-section: 3rem;
  --ui-hero-layout: split;
  --ui-accent-weight: subtle;
}

[data-ui-style="cinematic"] {
  --ui-font-display: 'Playfair Display', Georgia, serif;
  --ui-font-body: 'DM Sans', system-ui, sans-serif;
  --ui-radius-card: 3px;
  --ui-radius-button: 4px;
  --ui-nav-height: 64px;
  --ui-nav-style: top;
  --ui-card-aspect: 2 / 3;
  --ui-spacing-section: 2.5rem;
  --ui-hero-layout: fullbleed;
  --ui-accent-weight: bold;
}

[data-ui-style="modern"] {
  --ui-font-display: 'Inter', system-ui, sans-serif;
  --ui-font-body: 'Inter', system-ui, sans-serif;
  --ui-radius-card: 10px;
  --ui-radius-button: 6px;
  --ui-nav-height: 56px;
  --ui-nav-style: sidebar;
  --ui-card-aspect: 2 / 3;
  --ui-spacing-section: 2rem;
  --ui-hero-layout: dashboard;
  --ui-accent-weight: subtle;
}

[data-ui-style="editorial"] {
  --ui-font-display: 'Playfair Display', Georgia, serif;
  --ui-font-body: 'DM Sans', system-ui, sans-serif;
  --ui-radius-card: 6px;
  --ui-radius-button: 4px;
  --ui-nav-height: 60px;
  --ui-nav-style: top;
  --ui-card-aspect: 2 / 3;
  --ui-spacing-section: 4rem;
  --ui-hero-layout: split;
  --ui-accent-weight: bold;
}

.ui-font-display { font-family: var(--ui-font-display, 'DM Sans', sans-serif); }
.ui-font-body    { font-family: var(--ui-font-body, 'DM Sans', sans-serif); }
.ui-card         { border-radius: var(--ui-radius-card, 6px); aspect-ratio: var(--ui-card-aspect, 2/3); }
.ui-btn          { border-radius: var(--ui-radius-button, 6px); }
'@

if (Test-Path $indexCss) {
    $cssContent = Get-Content $indexCss -Raw
    if ($cssContent -notmatch "UI-STYLE VARIABLEN") {
        Add-Content -Path $indexCss -Value $cssVars -Encoding UTF8
        Write-Host "  ✅ CSS-Variablen in index.css eingefügt" -ForegroundColor Green
    } else {
        Write-Host "  ⏭️  CSS-Variablen bereits in index.css vorhanden" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ⚠️  index.css nicht gefunden unter: $indexCss" -ForegroundColor Yellow
}

# ── 5. Font-Loader Utility erstellen ──────────────────────────────────────────
Write-Host "`n[5/6] Font-Loader Utility..." -ForegroundColor Yellow

$libDir = Join-Path $srcDir "lib"
if (-not (Test-Path $libDir)) { New-Item -ItemType Directory -Path $libDir | Out-Null }

$fontLoaderFile = Join-Path $libDir "fontLoader.ts"
$fontLoaderContent = @'
type FontConfig = { href: string; loaded: boolean };

const FONT_MAP: Record<string, FontConfig> = {
  minimal: {
    href: 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300..700&display=swap',
    loaded: false,
  },
  cinematic: {
    href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..700&family=DM+Sans:opsz,wght@9..40,300..700&display=swap',
    loaded: false,
  },
  modern: {
    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300..700&display=swap',
    loaded: false,
  },
  editorial: {
    href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..700&family=DM+Sans:opsz,wght@9..40,300..700&display=swap',
    loaded: false,
  },
};

export function loadFontsForStyle(style: string): void {
  const config = FONT_MAP[style];
  if (!config || config.loaded) return;

  if (!document.querySelector('link[href="https://fonts.googleapis.com"]')) {
    const pc1 = document.createElement('link');
    pc1.rel = 'preconnect';
    pc1.href = 'https://fonts.googleapis.com';
    document.head.appendChild(pc1);

    const pc2 = document.createElement('link');
    pc2.rel = 'preconnect';
    pc2.href = 'https://fonts.gstatic.com';
    pc2.crossOrigin = 'anonymous';
    document.head.appendChild(pc2);
  }

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = config.href;
  document.head.appendChild(link);
  config.loaded = true;
}
'@

if (-not (Test-Path $fontLoaderFile)) {
    Set-Content -Path $fontLoaderFile -Value $fontLoaderContent -Encoding UTF8
    Write-Host "  ✅ Font-Loader erstellt: src/lib/fontLoader.ts" -ForegroundColor Green
} else {
    Write-Host "  ⏭️  Font-Loader bereits vorhanden" -ForegroundColor Yellow
}

# ── 6. App.tsx — useUIStyle einbinden ─────────────────────────────────────────
Write-Host "`n[6/6] App.tsx — UIStyle initialisieren..." -ForegroundColor Yellow

$appFile = Join-Path $srcDir "App.tsx"
if (Test-Path $appFile) {
    $appContent = Get-Content $appFile -Raw -Encoding UTF8

    $importLine = "import { useUIStyle } from './hooks/useUIStyle';"
    if ($appContent -notmatch [regex]::Escape($importLine)) {
        $appContent = $appContent -replace `
            "(import React.*?from 'react';)", `
            "`$1`n$importLine"
        Write-Host "  ✅ Import in App.tsx eingefügt" -ForegroundColor Green
    } else {
        Write-Host "  ⏭️  Import bereits in App.tsx vorhanden" -ForegroundColor Yellow
    }

    if ($appContent -notmatch "useUIStyle\(\)") {
        $appContent = $appContent -replace `
            "(export default function App\(\)|const App = \(\) =>)\s*\{", `
            "`$1 {`n  useUIStyle(); // Initialisiert data-ui-style auf <html>"
        Write-Host "  ✅ Hook-Aufruf in App.tsx eingefügt" -ForegroundColor Green
    } else {
        Write-Host "  ⏭️  Hook-Aufruf bereits in App.tsx vorhanden" -ForegroundColor Yellow
    }

    Set-Content -Path $appFile -Value $appContent -Encoding UTF8 -NoNewline
} else {
    Write-Host "  ⚠️  App.tsx nicht gefunden" -ForegroundColor Yellow
}

# ── Abschluss ──────────────────────────────────────────────────────────────────
Write-Host "`n──────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host "✅ Script abgeschlossen!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Noch 3 manuelle Schritte:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1. Supabase SQL ausführen (Dashboard → SQL Editor):" -ForegroundColor White
Write-Host "     ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ui_style TEXT NOT NULL DEFAULT 'minimal' CHECK (ui_style IN ('minimal','cinematic','modern','editorial'));" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  2. UIStyleSwitcher in SettingsModal einbauen:" -ForegroundColor White
Write-Host "     import { UIStyleSwitcher } from './UIStyleSwitcher';" -ForegroundColor DarkGray
Write-Host "     <UIStyleSwitcher />  — neben dem ThemeManager platzieren" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  3. Git commit & deploy:" -ForegroundColor White
Write-Host "     git add -A && git commit -m 'feat: add UI style switcher' && git push origin main" -ForegroundColor DarkGray
Write-Host "     npx vercel deploy --prod --force" -ForegroundColor DarkGray
Write-Host "──────────────────────────────────────────" -ForegroundColor DarkGray