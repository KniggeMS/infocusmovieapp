# PWA Asset Setup Script
$sourceDir = "assets"
$targetDir = "public"

# 1. Ensure 'public' folder exists
if (!(Test-Path -Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir | Out-Null
    Write-Host "Created '$targetDir' directory."
}

# 2. Copy and Rename Icons (Logo)
$logoSource = Join-Path $sourceDir "logo.png"

if (Test-Path $logoSource) {
    Copy-Item -Path $logoSource -Destination (Join-Path $targetDir "pwa-icon-512.png") -Force
    Copy-Item -Path $logoSource -Destination (Join-Path $targetDir "pwa-icon-192.png") -Force
    # Copy as favicon fallback
    Copy-Item -Path $logoSource -Destination (Join-Path $targetDir "favicon.ico") -Force 
    Write-Host "✅ Icons copied to public/pwa-icon-512.png & 192.png"
} else {
    Write-Warning "❌ Source file '$logoSource' not found!"
}

# 3. Copy Splash Screen
$splashSource = Join-Path $sourceDir "splash.png"

if (Test-Path $splashSource) {
    Copy-Item -Path $splashSource -Destination (Join-Path $targetDir "apple-touch-startup-image.png") -Force
    Write-Host "✅ Splash screen copied to public/apple-touch-startup-image.png"
} else {
    Write-Warning "❌ Source file '$splashSource' not found!"
}
