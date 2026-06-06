<#
.SYNOPSIS
  Fügt TMDB- und Rotten Tomatoes-Badges zur MovieDetailModal hinzu.
  Erstellt useExternalRatings Hook und patcht MovieDetailModal.tsx.

.NOTES
  Ausführen aus dem Repo-Root:  .\add-external-ratings.ps1
  Voraussetzung: Das Repo liegt lokal vor (Standard-Pfad wird auto-erkannt).
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# ── Pfade ──────────────────────────────────────────────────────────────────────
$repoRoot   = $PSScriptRoot   # Script liegt im Repo-Root
$srcDir     = Join-Path $repoRoot "src"
$hooksDir   = Join-Path $srcDir "hooks"
$modalFile  = Join-Path $srcDir "components\MovieDetailModal.tsx"
$envFile    = Join-Path $repoRoot ".env.local"

Write-Host "`n🎬 InFocus: External Ratings Setup" -ForegroundColor Cyan
Write-Host "────────────────────────────────────" -ForegroundColor DarkGray

# ── 1. Hooks-Verzeichnis sicherstellen ─────────────────────────────────────────
if (-not (Test-Path $hooksDir)) {
    New-Item -ItemType Directory -Path $hooksDir | Out-Null
    Write-Host "✅ Verzeichnis erstellt: src/hooks/" -ForegroundColor Green
}

# ── 2. useExternalRatings.ts erstellen ─────────────────────────────────────────
$hookFile = Join-Path $hooksDir "useExternalRatings.ts"
$hookContent = @'
import { useState, useEffect } from 'react';

export interface ExternalRatings {
  tmdb: number | null;
  rottenTomatoes: string | null;
  imdbId: string | null;
}

const cache = new Map<string, ExternalRatings>();

export function useExternalRatings(
  tmdbId: number | undefined,
  title: string,
  mediaType: 'movie' | 'tv' = 'movie',
  voteAverage: number | null
): { ratings: ExternalRatings; loading: boolean } {
  const [ratings, setRatings] = useState<ExternalRatings>({
    tmdb: voteAverage,
    rottenTomatoes: null,
    imdbId: null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cacheKey = tmdbId ? `tmdb-${tmdbId}` : `title-${title}`;

    if (cache.has(cacheKey)) {
      setRatings(cache.get(cacheKey)!);
      return;
    }

    const omdbKey = import.meta.env.VITE_OMDB_API_KEY;
    if (!omdbKey) return;

    let cancelled = false;
    setLoading(true);

    const fetchRatings = async () => {
      try {
        const type = mediaType === 'tv' ? 'series' : 'movie';
        const url = `https://www.omdbapi.com/?apikey=${omdbKey}&t=${encodeURIComponent(title)}&type=${type}&tomatoes=true`;
        const res = await fetch(url);
        const data = await res.json();

        if (cancelled) return;

        if (data.Response === 'True') {
          const rt = data.Ratings?.find((r: any) => r.Source === 'Rotten Tomatoes');
          const result: ExternalRatings = {
            tmdb: voteAverage,
            rottenTomatoes: rt?.Value ?? null,
            imdbId: data.imdbID ?? null,
          };
          cache.set(cacheKey, result);
          setRatings(result);
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchRatings();
    return () => { cancelled = true; };
  }, [tmdbId, title, mediaType, voteAverage]);

  return { ratings, loading };
}
'@

Set-Content -Path $hookFile -Value $hookContent -Encoding UTF8
Write-Host "✅ Hook erstellt: src/hooks/useExternalRatings.ts" -ForegroundColor Green

# ── 3. MovieDetailModal.tsx patchen ────────────────────────────────────────────
if (-not (Test-Path $modalFile)) {
    Write-Host "❌ Nicht gefunden: $modalFile" -ForegroundColor Red
    exit 1
}

$modal = Get-Content $modalFile -Raw -Encoding UTF8

# 3a. Import einfügen (nur wenn noch nicht vorhanden)
$importLine = "import { useExternalRatings } from '../hooks/useExternalRatings';"
if ($modal -notmatch [regex]::Escape($importLine)) {
    $modal = $modal -replace "(import \{ GeminiService \}.*?;)", "`$1`n$importLine"
    Write-Host "✅ Import eingefügt" -ForegroundColor Green
} else {
    Write-Host "⏭️  Import bereits vorhanden, übersprungen" -ForegroundColor Yellow
}

# 3b. Hook-Aufruf nach dem rating useState einfügen (nur wenn noch nicht vorhanden)
$hookCall = @'
  const { ratings, loading: ratingsLoading } = useExternalRatings(
    movie.tmdbId,
    movie.title,
    movie.mediaType ?? 'movie',
    movie.voteAverage
  );
'@

if ($modal -notmatch "useExternalRatings\(") {
    $modal = $modal -replace `
        "(const \[rating, setRating\] = useState<number \| null>\(movie\.userRating \?\? null\);)", `
        "`$1`n$hookCall"
    Write-Host "✅ Hook-Aufruf eingefügt" -ForegroundColor Green
} else {
    Write-Host "⏭️  Hook-Aufruf bereits vorhanden, übersprungen" -ForegroundColor Yellow
}

# 3c. Rating-Block ersetzen
$oldRatingBlock = @'
      {/* Rating */}
      <div>
        <div className="text-xs text-app-text-muted uppercase tracking-wider mb-2 flex items-center gap-2">
          <Star className="w-3.5 h-3.5" /> {t('common.myRating', 'Eigene Bewertung')}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {Array.from({ length: 10 }, (_, i) => i + 1).map(i => {
            const active = rating !== null && i <= rating;
            return (
              <button
                key={i}
                onClick={() => persistRating(rating === i ? null : i)}
                aria-label={`${t('common.rating', 'Bewertung')} ${i}`}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md text-xs font-bold transition-all active:scale-90 ${
                  active
                    ? 'bg-yellow-400/90 text-black'
                    : 'bg-app-secondary/60 text-app-text-muted hover:bg-app-secondary'
                }`}
              >
                {i}
              </button>
            );
          })}
          {rating !== null && (
            <button
              onClick={() => persistRating(null)}
              className="ml-2 text-xs text-app-text-muted underline hover:text-app-text transition-colors"
            >
              {t('common.reset', 'zurücksetzen')}
            </button>
          )}
        </div>
      </div>
'@

$newRatingBlock = @'
      {/* Rating */}
      <div>
        {/* Externe Bewertungs-Badges */}
        <div className="flex items-center gap-2 mb-3">
          {ratings.tmdb !== null && (
            <a
              href={`https://www.themoviedb.org/${movie.mediaType ?? 'movie'}/${movie.tmdbId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0d253f] hover:bg-[#1a3a5c] transition-colors"
              title="TMDB Bewertung"
            >
              <img
                src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
                alt="TMDB"
                className="h-3"
              />
              <span className="text-xs font-bold text-white">
                {ratings.tmdb.toFixed(1)}
              </span>
            </a>
          )}
          {ratingsLoading && !ratings.rottenTomatoes && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-app-secondary/60 animate-pulse">
              <div className="w-12 h-3 bg-app-secondary rounded" />
            </div>
          )}
          {ratings.rottenTomatoes && (() => {
            const pct = parseInt(ratings.rottenTomatoes);
            const isFresh = pct >= 60;
            return (
              <a
                href={`https://www.rottentomatoes.com/search?search=${encodeURIComponent(movie.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-colors ${
                  isFresh
                    ? 'bg-red-700/80 hover:bg-red-700'
                    : 'bg-yellow-700/80 hover:bg-yellow-700'
                }`}
                title="Rotten Tomatoes"
              >
                <span className="text-sm">{isFresh ? '🍅' : '🤢'}</span>
                <span className="text-xs font-bold text-white">{ratings.rottenTomatoes}</span>
              </a>
            );
          })()}
        </div>

        <div className="text-xs text-app-text-muted uppercase tracking-wider mb-2 flex items-center gap-2">
          <Star className="w-3.5 h-3.5" /> {t('common.myRating', 'Eigene Bewertung')}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {Array.from({ length: 10 }, (_, i) => i + 1).map(i => {
            const active = rating !== null && i <= rating;
            return (
              <button
                key={i}
                onClick={() => persistRating(rating === i ? null : i)}
                aria-label={`${t('common.rating', 'Bewertung')} ${i}`}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md text-xs font-bold transition-all active:scale-90 ${
                  active
                    ? 'bg-yellow-400/90 text-black'
                    : 'bg-app-secondary/60 text-app-text-muted hover:bg-app-secondary'
                }`}
              >
                {i}
              </button>
            );
          })}
          {rating !== null && (
            <button
              onClick={() => persistRating(null)}
              className="ml-2 text-xs text-app-text-muted underline hover:text-app-text transition-colors"
            >
              {t('common.reset', 'zurücksetzen')}
            </button>
          )}
        </div>
      </div>
'@

if ($modal -notmatch "Externe Bewertungs-Badges") {
    $escapedOld = [regex]::Escape($oldRatingBlock)
    if ($modal -match $escapedOld) {
        $modal = $modal -replace $escapedOld, $newRatingBlock
        Write-Host "✅ Rating-Block mit Badges ersetzt" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Rating-Block nicht exakt gefunden – bitte manuell prüfen" -ForegroundColor Yellow
    }
} else {
    Write-Host "⏭️  Badges bereits vorhanden, übersprungen" -ForegroundColor Yellow
}

Set-Content -Path $modalFile -Value $modal -Encoding UTF8 -NoNewline

# ── 4. .env.local mit OMDB Key ergänzen ────────────────────────────────────────
$omdbLine = "VITE_OMDB_API_KEY=33df5dc9"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    if ($envContent -notmatch "VITE_OMDB_API_KEY") {
        Add-Content -Path $envFile -Value "`n$omdbLine" -Encoding UTF8
        Write-Host "✅ OMDB Key zu .env.local hinzugefügt" -ForegroundColor Green
    } else {
        Write-Host "⏭️  OMDB Key bereits in .env.local vorhanden" -ForegroundColor Yellow
    }
} else {
    Set-Content -Path $envFile -Value $omdbLine -Encoding UTF8
    Write-Host "✅ .env.local erstellt mit OMDB Key" -ForegroundColor Green
}

# ── 5. Git Commit & Push ────────────────────────────────────────────────────────
Write-Host "`n📦 Git Commit & Push..." -ForegroundColor Cyan
Set-Location $repoRoot
git add src/hooks/useExternalRatings.ts src/components/MovieDetailModal.tsx .env.local 2>&1 | Out-Null
git commit -m "feat: add TMDB + Rotten Tomatoes rating badges to MovieDetailModal" 2>&1
git push origin main 2>&1

Write-Host "`n🚀 Deploy zu Vercel..." -ForegroundColor Cyan
npx vercel deploy --prod --force 2>&1

Write-Host "`n✅ Fertig! Bitte VITE_OMDB_API_KEY=33df5dc9 auch im Vercel Dashboard" -ForegroundColor Green
Write-Host "   Settings → Environment Variables → hinzufügen." -ForegroundColor DarkGray