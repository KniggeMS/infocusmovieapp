"use client"

import React from "react"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { posterUrl } from "@/lib/tmdb"
import type { TMDBMovie, TMDBTVShow, TMDBMultiResult } from "@/lib/tmdb"
import { getExternalRatings } from "@/lib/external-ratings"
import { StarRating } from "@/components/star-rating"
import { Search, Film, Check, Loader2, Tv } from "lucide-react"

function LogPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const preselectedId = searchParams.get("tmdb_id")
  const preselectedTitle = searchParams.get("title")
  const preselectedPoster = searchParams.get("poster_path")

  const [step, setStep] = useState<"search" | "rate">(
    preselectedId ? "rate" : "search"
  )
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<(TMDBMovie | TMDBTVShow | TMDBMultiResult)[]>([])
  const [searching, setSearching] = useState(false)

  const [selectedMovie, setSelectedMovie] = useState<{
    id: number
    title: string
    poster_path: string | null
    media_type: 'movie' | 'tv'
  } | null>(
    preselectedId
      ? {
          id: Number(preselectedId),
          title: preselectedTitle || "",
          poster_path: preselectedPoster || null,
          media_type: 'movie' // Default to movie for preselected
        }
      : null
  )

  const [rating, setRating] = useState(0)
  const [review, setReview] = useState("")
  const [watchedAt, setWatchedAt] = useState(
    new Date().toISOString().slice(0, 10)
  )
  const [seasonNumber, setSeasonNumber] = useState("")
  const [episodeNumber, setEpisodeNumber] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [externalRatings, setExternalRatings] = useState<any>(null)
  const [loadingRatings, setLoadingRatings] = useState(false)

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      return
    }
    setSearching(true)
    try {
      const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data.results || [])
    } catch {
      setResults([])
    }
    setSearching(false)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 400)
    return () => clearTimeout(timer)
  }, [query, doSearch])

  function getMediaTypeIcon(movie: TMDBMovie | TMDBTVShow | TMDBMultiResult) {
    const isTV = 'first_air_date' in movie || ('media_type' in movie && movie.media_type === 'tv')
    return isTV ? Tv : Film
  }

  function getDisplayTitle(movie: TMDBMovie | TMDBTVShow | TMDBMultiResult) {
    return 'title' in movie ? movie.title : movie.name || ''
  }

  function selectMovie(movie: TMDBMovie | TMDBTVShow | TMDBMultiResult) {
    const isTV = 'first_air_date' in movie || ('media_type' in movie && movie.media_type === 'tv')
    setSelectedMovie({
      id: movie.id,
      title: 'title' in movie ? movie.title : movie.name || '',
      poster_path: movie.poster_path,
      media_type: isTV ? 'tv' : 'movie'
    })
    setStep("rate")
    
    // Load external ratings
    loadExternalRatings(movie.id, isTV ? 'tv' : 'movie')
  }

  async function loadExternalRatings(tmdbId: number, mediaType: 'movie' | 'tv') {
    setLoadingRatings(true)
    try {
      const ratings = await getExternalRatings(tmdbId, mediaType)
      setExternalRatings(ratings)
    } catch (error) {
      console.warn('Failed to load external ratings:', error)
    } finally {
      setLoadingRatings(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedMovie) return
    setSaving(true)
    setError(null)

    // Validate date
    const watchedDate = new Date(watchedAt)
    const today = new Date()
    if (isNaN(watchedDate.getTime()) || watchedDate > today) {
      setError("Ungültiges Datum")
      setSaving(false)
      return
    }

    // Validate season/episode for TV shows
    if (selectedMovie.media_type === 'tv') {
      if (seasonNumber && (parseInt(seasonNumber) < 1 || isNaN(parseInt(seasonNumber)))) {
        setError("Ungültige Staffelnummer")
        setSaving(false)
        return
      }
      if (episodeNumber && (parseInt(episodeNumber) < 1 || isNaN(parseInt(episodeNumber)))) {
        setError("Ungültige Episodennummer")
        setSaving(false)
        return
      }
      // If episode is provided, season must also be provided
      if (episodeNumber && !seasonNumber) {
        setError("Bei Episodenangabe muss auch die Staffel angegeben werden")
        setSaving(false)
        return
      }
    }

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setError("Nicht angemeldet")
      setSaving(false)
      return
    }

    const insertData = {
      user_id: user.id,
      tmdb_movie_id: selectedMovie.id,
      movie_title: selectedMovie.title,
      movie_poster_path: selectedMovie.poster_path,
      media_type: selectedMovie.media_type,
      rating: rating || null,
      imdb_rating: externalRatings?.imdb_rating || null,
      review: review.trim() || null,
      watched_on: watchedAt,
      season_number: selectedMovie.media_type === 'tv' && seasonNumber ? parseInt(seasonNumber) : null,
      episode_number: selectedMovie.media_type === 'tv' && episodeNumber ? parseInt(episodeNumber) : null,
    }

    const { data, error } = await supabase.from("diary_entries").insert(insertData).select()

    if (error) {
      setError("Fehler beim Loggen: " + error.message)
    } else {
      router.push("/diary")
      router.refresh()
    }
    setSaving(false)
  }

  const posterImage = selectedMovie?.poster_path
    ? posterUrl(selectedMovie.poster_path, "w342")
    : null

  if (step === "search") {
    return (
      <main className="mx-auto max-w-lg">
        <header className="sticky top-0 z-40 glass-header px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="mb-3 font-heading text-lg font-bold text-foreground">
              Film loggen
            </h1>
            <button
              onClick={() => {
                setStep("search")
                setSelectedMovie(null)
              }}
              className="text-sm text-muted-foreground hover:text-foreground"
              type="button"
            >
              Anderen Film
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Welchen Film hast du gesehen?"
                className="glass-input h-11 w-full pl-10 pr-4 text-sm"
                autoFocus
              />
            </div>
          </div>
        </header>

        <div className="px-4 pt-4">
          {searching && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
          {!searching && results.length === 0 && query.trim() && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Keine Filme gefunden
            </p>
          )}
          <div className="flex flex-col gap-2">
            {results.map((movie) => {
              const url = posterUrl(movie.poster_path, "w185")
              return (
                <button
                  key={movie.id}
                  onClick={() => selectMovie(movie)}
                  className="glass-card flex items-center gap-3 p-3 text-left transition-all hover:bg-white/[0.08] active:scale-[0.98]"
                  type="button"
                >
                  <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded bg-secondary">
                    {url ? (
                      <Image
                        src={url || "/placeholder.svg"}
                        alt={'title' in movie ? movie.title : movie.name}
                        fill
                        className="object-cover"
                        sizes="44px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Film className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      {(() => {
                        const Icon = getMediaTypeIcon(movie)
                        return <Icon className="h-3 w-3 text-muted-foreground" />
                      })()}
                      <p className="text-sm font-medium text-foreground">
                        {getDisplayTitle(movie)}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {'release_date' in movie ? movie.release_date?.slice(0, 4) : movie.first_air_date?.slice(0, 4)}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-lg">
      <header className="sticky top-0 z-40 flex items-center justify-between glass-header px-4 py-3">
        <button
          onClick={() => {
            setStep("search")
            setSelectedMovie(null)
          }}
          className="text-sm text-muted-foreground hover:text-foreground"
          type="button"
        >
          Anderen Film
        </button>
        <h1 className="font-heading text-lg font-bold text-foreground">
          Bewerten
        </h1>
        <div className="w-16" />
      </header>

      <form onSubmit={handleSubmit} className="px-4 pt-6">
        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Selected movie */}
        <div className="flex gap-4">
          <div className="relative h-32 w-[86px] shrink-0 overflow-hidden rounded-lg bg-secondary">
            {posterImage ? (
              <Image
                src={posterImage || "/placeholder.svg"}
                alt={selectedMovie?.title || ""}
                fill
                className="object-cover"
                sizes="86px"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Film className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="font-heading text-lg font-bold text-foreground">
              {selectedMovie?.title}
            </h2>
          </div>
        </div>

        {/* Rating */}
        <div className="mt-6">
          <label className="mb-2 block text-sm font-medium text-foreground">
            Deine Bewertung
          </label>
          <StarRating
            rating={rating}
            size="lg"
            interactive
            onChange={setRating}
          />
        </div>

        {/* External Ratings */}
        {loadingRatings && (
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Lade externe Bewertungen...
          </div>
        )}

        {externalRatings && !loadingRatings && (
          <div className="mt-4 glass-card p-3">
            <h4 className="mb-2 text-sm font-medium text-foreground">Externe Bewertungen</h4>
            <div className="flex flex-col gap-2">
              {externalRatings.imdb_rating && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">IMDb</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">{externalRatings.imdb_rating}</span>
                    <span className="text-xs text-muted-foreground">
                      ({externalRatings.imdb_vote_count?.toLocaleString()})
                    </span>
                  </div>
                </div>
              )}
              {externalRatings.rotten_tomatoes_rating && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Rotten Tomatoes</span>
                  <span className="text-sm font-medium">{externalRatings.rotten_tomatoes_rating}%</span>
                </div>
              )}
              {!externalRatings.imdb_rating && !externalRatings.rotten_tomatoes_rating && (
                <p className="text-xs text-muted-foreground">Keine externen Bewertungen verfügbar</p>
              )}
            </div>
          </div>
        )}

        {/* TV Show Episode Info */}
        {selectedMovie?.media_type === 'tv' && (
          <div className="mt-5 glass-card p-4">
            <h4 className="mb-3 text-sm font-medium text-foreground">Episoden-Informationen</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="seasonNumber"
                  className="mb-1 block text-xs font-medium text-muted-foreground"
                >
                  Staffel
                </label>
                <input
                  id="seasonNumber"
                  type="number"
                  min="1"
                  value={seasonNumber}
                  onChange={(e) => setSeasonNumber(e.target.value)}
                  placeholder="z.B. 1"
                  className="glass-input h-10 w-full px-3 text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="episodeNumber"
                  className="mb-1 block text-xs font-medium text-muted-foreground"
                >
                  Episode
                </label>
                <input
                  id="episodeNumber"
                  type="number"
                  min="1"
                  value={episodeNumber}
                  onChange={(e) => setEpisodeNumber(e.target.value)}
                  placeholder="z.B. 1"
                  className="glass-input h-10 w-full px-3 text-sm"
                />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Optional - Lasse leer für die ganze Serie
            </p>
          </div>
        )}

        {/* Watch date */}
        <div className="mt-5">
          <label
            htmlFor="watchedAt"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Gesehen am
          </label>
          <input
            id="watchedAt"
            type="date"
            value={watchedAt}
            onChange={(e) => setWatchedAt(e.target.value)}
            className="glass-input h-11 w-full px-4 text-sm"
          />
        </div>

        {/* Review */}
        <div className="mt-5">
          <label
            htmlFor="review"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Review (optional)
          </label>
          <textarea
            id="review"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Was denkst du ueber den Film?"
            rows={4}
            className="glass-input w-full px-4 py-3 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Check className="h-5 w-5" />
              Film loggen
            </>
          )}
        </button>
      </form>

      <div className="h-8" />
    </main>
  )
}

export default function LogPage() {
  return (
    <Suspense fallback={<div className="flex min-h-dvh items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}>
      <LogPageContent />
    </Suspense>
  )
}
