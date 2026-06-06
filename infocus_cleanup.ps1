<#
.SYNOPSIS
    InFocus App — Security & Cleanup Script
    Entfernt unnoetige Dateien, bereinigt .gitignore und
    patcht die drei sicherheitsrelevanten Quelldateien.

.NOTES
    Ausfuehren im Projektverzeichnis:
    cd "E:\cto.new\https-github.com-KniggeMS-InFocus"
    .\infocus_cleanup.ps1
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Step   { param($msg) Write-Host "`n▶ $msg" -ForegroundColor Cyan }
function Write-Ok     { param($msg) Write-Host "  ✅ $msg" -ForegroundColor Green }
function Write-Skip   { param($msg) Write-Host "  ⏭  $msg (nicht vorhanden, wird uebersprungen)" -ForegroundColor DarkGray }
function Write-Change { param($msg) Write-Host "  ✏  $msg" -ForegroundColor Yellow }

# Sicherstellen, dass wir im richtigen Verzeichnis sind
if (-not (Test-Path "package.json")) {
    Write-Host "FEHLER: package.json nicht gefunden." -ForegroundColor Red
    Write-Host "Bitte das Skript aus dem Projektverzeichnis ausfuehren:" -ForegroundColor Red
    Write-Host '  cd "E:\cto.new\https-github.com-KniggeMS-InFocus"' -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "   InFocus — Security & Cleanup Script" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  Verzeichnis: $(Get-Location)"


# ─── Schritt 1: Einzelne Dateien per git rm entfernen ───────
Write-Step "Schritt 1/5: Unnoetige Dateien aus Git entfernen"

$filesToRemove = @(
    "GEMINI.md",
    "AGENTS.md",
    "PLAN.md",
    "CHANGELOG.md",
    "check-supabase-v2.js",
    "src/services/MockMovieService.ts"
)

foreach ($file in $filesToRemove) {
    if (Test-Path $file) {
        git rm --force $file | Out-Null
        Write-Ok "git rm $file"
    } else {
        Write-Skip $file
    }
}


# ─── Schritt 2: Verzeichnisse per git rm entfernen ──────────
Write-Step "Schritt 2/5: Unnoetige Verzeichnisse aus Git entfernen"

$dirsToRemove = @(
    "conductor",
    ".agents",
    ".continue",
    ".opencode",
    ".vscode"
)

foreach ($dir in $dirsToRemove) {
    if (Test-Path $dir) {
        git rm -r --force $dir | Out-Null
        Write-Ok "git rm -r $dir"
    } else {
        Write-Skip $dir
    }
}


# ─── Schritt 3: .gitignore aktualisieren ────────────────────
Write-Step "Schritt 3/5: .gitignore aktualisieren"

$gitignorePath = ".gitignore"
$entriesToAdd = @(
    "",
    "# AI-Tool-Konfigurationen (lokal, nicht im Repo)",
    ".agents/",
    ".continue/",
    ".opencode/",
    ".vscode/",
    "",
    "# Interne Entwicklungsdokumente",
    "GEMINI.md",
    "AGENTS.md",
    "PLAN.md",
    "conductor/",
    "",
    "# Debug-Skripte",
    "check-supabase-v2.js"
)

$existingContent = ""
if (Test-Path $gitignorePath) {
    $existingContent = Get-Content $gitignorePath -Raw
}

$newEntries = @()
foreach ($entry in $entriesToAdd) {
    $trimmed = $entry.Trim()
    if ($trimmed -eq "" -or $trimmed.StartsWith("#")) {
        $newEntries += $entry
    } elseif ($existingContent -notmatch [regex]::Escape($trimmed)) {
        $newEntries += $entry
        Write-Change ".gitignore += $trimmed"
    }
}

if ($newEntries.Count -gt 0) {
    Add-Content -Path $gitignorePath -Value ($newEntries -join "`n")
    Write-Ok ".gitignore aktualisiert"
} else {
    Write-Ok ".gitignore — alle Eintraege bereits vorhanden"
}


# ─── Schritt 4: Code-Patches ────────────────────────────────
Write-Step "Schritt 4/5: Sicherheits-Patches in Quelldateien"

# 4a: src/lib/supabase.ts
$supabasePath = "src/lib/supabase.ts"
if (Test-Path $supabasePath) {
    $newSupabaseContent = @"
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    '[InFocus] Fehlende Supabase-Umgebungsvariablen. ' +
    'Bitte VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY in der .env-Datei setzen.'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
"@
    Set-Content -Path $supabasePath -Value $newSupabaseContent -Encoding UTF8
    Write-Ok "src/lib/supabase.ts — Pflichtfeld-Validierung hinzugefuegt"
} else {
    Write-Skip $supabasePath
}

# 4b: src/core/config/AppConfig.ts
$appConfigPath = "src/core/config/AppConfig.ts"
if (Test-Path $appConfigPath) {
    $newAppConfigContent = @"
export class AppConfig {
  /**
   * Generates the redirect URL for authentication flows.
   * Priority: VITE_APP_URL > window.location.origin
   */
  public static getRedirectUrl(): string {
    const appUrl = import.meta.env.VITE_APP_URL;

    if (appUrl && appUrl.trim() !== '') {
      return appUrl;
    }

    if (typeof window !== 'undefined') {
      return window.location.origin;
    }

    return '';
  }
}
"@
    Set-Content -Path $appConfigPath -Value $newAppConfigContent -Encoding UTF8
    Write-Ok "src/core/config/AppConfig.ts — Hardcodierte URL entfernt"
} else {
    Write-Skip $appConfigPath
}

# 4c: src/services/SupabaseMovieService.ts — console.log entfernen
$movieServicePath = "src/services/SupabaseMovieService.ts"
if (Test-Path $movieServicePath) {
    $content = Get-Content $movieServicePath -Raw
    $content = $content -replace "(?m)^\s*console\.log\('TMDB search yielded no results, trying OMDb fallback\.\.\.'\);\r?\n", ""
    $content = $content -replace "(?m)^\s*console\.log\('\[TMDB\] Videos found:'.*\);\r?\n", ""
    Set-Content -Path $movieServicePath -Value $content -Encoding UTF8
    Write-Ok "src/services/SupabaseMovieService.ts — 2x console.log entfernt"
} else {
    Write-Skip $movieServicePath
}


# ─── Schritt 5: Git commit & push ───────────────────────────
Write-Step "Schritt 5/5: Git commit & push"

git add .gitignore $supabasePath $appConfigPath $movieServicePath 2>$null

$gitStatus = git status --porcelain
if ($gitStatus) {
    git commit -m "security: remove internal docs, AI configs & debug scripts; fix supabase env validation"
    Write-Ok "Commit erstellt"

    Write-Host ""
    $push = Read-Host "  Jetzt pushen? (j/n)"
    if ($push -match "^[jJyY]$") {
        git push
        Write-Ok "Erfolgreich gepusht"
    } else {
        Write-Host "  ℹ  Push uebersprungen — manuell ausfuehren: git push" -ForegroundColor DarkGray
    }
} else {
    Write-Host "  ℹ  Keine Aenderungen zum Commiten." -ForegroundColor DarkGray
}


Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "   Fertig! Security-Cleanup abgeschlossen." -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""
Write-Host "  Naechste manuelle Schritte:" -ForegroundColor White
Write-Host "  1. Supabase Dashboard: Auth -> Settings -> Password Security" -ForegroundColor DarkGray
Write-Host "     -> HaveIBeenPwned.org aktivieren" -ForegroundColor DarkGray
Write-Host "  2. Sicherstellen, dass .env.local NICHT im Repo ist" -ForegroundColor DarkGray
Write-Host ""