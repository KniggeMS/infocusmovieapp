<#
.SYNOPSIS
  Fügt UIStyleSwitcher in SettingsModal.tsx ein.
  Sucht automatisch nach ThemeManager-Erwähnung und fügt den Switcher direkt darunter ein.
  Idempotent: läuft auch mehrfach ohne Schaden.
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$settingsModal = Get-ChildItem -Path ".\src" -Recurse -Filter "SettingsModal.tsx" | Select-Object -First 1

if (-not $settingsModal) {
    Write-Host "❌ SettingsModal.tsx nicht gefunden unter .\src" -ForegroundColor Red
    exit 1
}

Write-Host "📄 Gefunden: $($settingsModal.FullName)" -ForegroundColor Cyan

$content = Get-Content $settingsModal.FullName -Raw -Encoding UTF8

# ── Idempotenz-Check ────────────────────────────────────────────────────────────
if ($content -match "UIStyleSwitcher") {
    Write-Host "⏭️  UIStyleSwitcher bereits eingebaut – nichts zu tun." -ForegroundColor Yellow
    exit 0
}

# ── 1. Import einfügen (nach letztem bestehenden Import) ───────────────────────
$importLine = "import { UIStyleSwitcher } from './UIStyleSwitcher';"

# Füge nach dem letzten `import`-Block ein
$content = $content -replace `
    "(import\s+.+?from\s+['""].+?['""];?\s*\n)(?!import)", `
    "`$1$importLine`n"

Write-Host "  ✅ Import eingefügt" -ForegroundColor Green

# ── 2. Komponente einfügen – Strategie A: nach <ThemeManager ──────────────────
if ($content -match "<ThemeManager") {
    # Findet </ThemeManager> oder <ThemeManager ... /> und fügt danach ein
    $content = $content -replace `
        "(<ThemeManager[^/]*/\s*>|</ThemeManager>)", `
        "`$1`n        <UIStyleSwitcher />"
    Write-Host "  ✅ UIStyleSwitcher nach ThemeManager eingefügt" -ForegroundColor Green
}
# ── Strategie B: nach ThemeManager-Kommentar oder Sektion ─────────────────────
elseif ($content -match "(?i)(theme|appearance|design)") {
    # Suche nach einem passenden Wrapper-Div mit theme/appearance-Kontext
    $content = $content -replace `
        "(<!--.*?[Tt]heme.*?-->|{/\*.*?[Tt]heme.*?\*/})", `
        "`$1`n        <UIStyleSwitcher />"
    Write-Host "  ✅ UIStyleSwitcher nach Theme-Sektion eingefügt" -ForegroundColor Green
}
# ── Strategie C: Fallback – vor dem letzten </div> im Modal-Body ───────────────
else {
    # Füge vor dem schließenden Tag des letzten großen Containers ein
    $content = $content -replace `
        "(\s*</div>\s*\n\s*\);\s*\})", `
        "`n        <UIStyleSwitcher />`$1"
    Write-Host "  ✅ UIStyleSwitcher als Fallback vor Modal-Ende eingefügt" -ForegroundColor Green
}

# ── Datei speichern ─────────────────────────────────────────────────────────────
Set-Content -Path $settingsModal.FullName -Value $content -Encoding UTF8 -NoNewline

Write-Host "`n✅ SettingsModal.tsx erfolgreich aktualisiert!" -ForegroundColor Green
Write-Host "👉 Nächster Schritt: git add -A && git commit -m 'feat: add UIStyleSwitcher to settings' && git push" -ForegroundColor Cyan