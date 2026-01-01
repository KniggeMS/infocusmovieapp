# 1. API Audit (Prüfung der Supabase-Integration)
Write-Host '--- Audit: API & Types ---' -ForegroundColor Cyan
Get-Content src/services/AuthService.ts, src/core/conductor/MovieConductor.ts | gemini-cli 'Check for consistency between Supabase types and Conductor state. Report any mismatch that could cause 404s.'

# 2. UI Layout Audit (Simulierter Computer Use Check)
Write-Host '--- Audit: Mobile UI Layout ---' -ForegroundColor Cyan
Get-Content src/App.tsx | gemini-cli 'ACT AS VISUAL INSPECTOR. Analyze the Movie Detail Modal for z-index, absolute positioning, and padding. Does any element overlap the Add to Watchlist button on screens < 640px? Reply with FIX or PASS.'

# 3. i18n Integrity Check
Write-Host '--- Audit: i18n Keys ---' -ForegroundColor Cyan
Get-Content src/lib/i18n.ts, src/App.tsx | gemini-cli 'Check if all t() keys used in App.tsx exist in i18n.ts. List missing keys.'
