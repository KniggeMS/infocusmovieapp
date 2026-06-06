<#
.SYNOPSIS
  Fügt UIStyleSwitcher in ProfileModal.tsx nach dem Theme-Selector ein.
  Idempotent.
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$targetFile = ".\src\components\ProfileModal.tsx"

if (-not (Test-Path $targetFile)) {
    Write-Host "❌ ProfileModal.tsx nicht gefunden" -ForegroundColor Red
    exit 1
}

Write-Host "📄 Bearbeite: $targetFile" -ForegroundColor Cyan

$content = Get-Content $targetFile -Raw -Encoding UTF8

# ── Idempotenz-Check ────────────────────────────────────────────────────────────
if ($content -match "UIStyleSwitcher") {
    Write-Host "⏭️  UIStyleSwitcher bereits eingebaut." -ForegroundColor Yellow
    exit 0
}

# ── 1. Import einfügen — nach dem GlassCard/GlassButton Import ─────────────────
$oldImport = "import { GlassCard, GlassButton, GlassSection, GlassDivider } from './glass';"
$newImport  = "import { GlassCard, GlassButton, GlassSection, GlassDivider } from './glass';`nimport { UIStyleSwitcher } from './UIStyleSwitcher';"

if ($content -notmatch "UIStyleSwitcher") {
    $content = $content.Replace($oldImport, $newImport)
    Write-Host "  ✅ Import eingefügt" -ForegroundColor Green
}

# ── 2. UIStyleSwitcher nach dem System-Design-Button einfügen ──────────────────
# Ziel: direkt nach </GlassButton> (System-Design folgen) und vor </GlassSection>
$anchor = @'
            </GlassButton>
          </GlassSection>

          <GlassDivider />

          {/* User Info */}
'@

$replacement = @'
            </GlassButton>

            <GlassDivider />
            <UIStyleSwitcher />
          </GlassSection>

          <GlassDivider />

          {/* User Info */}
'@

if ($content -match [regex]::Escape($anchor.Trim())) {
    $content = $content.Replace($anchor, $replacement)
    Write-Host "  ✅ UIStyleSwitcher nach System-Design-Button eingefügt" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Anker nicht gefunden — versuche Alternative..." -ForegroundColor Yellow

    # Fallback: nach dem GlassButton für System-Design
    $fallbackAnchor = "            </GlassButton>`n          </GlassSection>`n`n          <GlassDivider />`n`n          {/* User Info */}"
    $fallbackReplacement = "            </GlassButton>`n`n            <GlassDivider />`n            <UIStyleSwitcher />`n          </GlassSection>`n`n          <GlassDivider />`n`n          {/* User Info */}"

    $content = $content.Replace($fallbackAnchor, $fallbackReplacement)
    Write-Host "  ✅ Fallback eingefügt" -ForegroundColor Green
}

# ── Speichern ───────────────────────────────────────────────────────────────────
Set-Content -Path $targetFile -Value $content -Encoding UTF8 -NoNewline

Write-Host "`n✅ ProfileModal.tsx erfolgreich aktualisiert!" -ForegroundColor Green
Write-Host "👉 git add -A && git commit -m 'feat: UIStyleSwitcher in ProfileModal' && git push" -ForegroundColor Cyan