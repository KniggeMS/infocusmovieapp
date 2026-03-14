"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { posterUrl, backdropUrl } from "@/lib/tmdb"
import type { TMDBMovieDetail } from "@/lib/tmdb"
import { StarRating } from "@/components/star-rating"
import { createClient } from "@/lib/supabase/client"
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  PenLine,
  Clock,
  Film,
  Link2,
  Check,
} from "lucide-react"

interface FamilyEntry {
  id: string
  rating: number | null
  review: string | null
  watched_at: string
  profiles: { display_name: string }
}

interface MovieDetailProps {
  movie: TMDBMovieDetail
  externalRatings: any
  isInWatchlist: boolean
  familyEntries: FamilyEntry[]
}

export function MovieDetail({
  movie,
  externalRatings,
  isInWatchlist: initialWatchlist,
  familyEntries,
}: MovieDetailProps) {
  const [inWatchlist, setInWatchlist] = useState(initialWatchlist)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const backdrop = backdropUrl(movie.backdrop_path, "w1280")
  const poster = posterUrl(movie.poster_path, "w500")

  async function toggleWatchlist() {
    setSaving(true)
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    if (inWatchlist) {
      await supabase
        .from("watchlist")
        .delete()
        .eq("user_id", user.id)
        .eq("tmdb_id", movie.id)
      setInWatchlist(false)
    } else {
      await supabase.from("watchlist").insert({
        user_id: user.id,
        tmdb_id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
      })
      setInWatchlist(true)
    }
    setSaving(false)
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = window.location.href
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <main className="mx-auto max-w-lg">
      {/* Backdrop */}
      <div className="relative h-56 w-full">
        {backdrop ? (
          <Image
            src={backdrop || "/placeholder.svg"}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        ) : (
          <div className="h-full w-full bg-secondary" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute left-4 top-4 glass-avatar flex h-9 w-9 items-center justify-center text-foreground"
          type="button"
          aria-label="Zurueck"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* Copy link button */}
        <button
          onClick={handleCopyLink}
          className={`absolute right-4 top-4 glass-avatar flex h-9 w-9 items-center justify-center transition-colors ${
            copied
              ? "bg-primary/80 text-primary-foreground"
              : ""
          }`}
          type="button"
          aria-label="Link kopieren"
        >
          {copied ? <Check className="h-5 w-5" /> : <Link2 className="h-5 w-5" />}
        </button>
      </div>

      {/* Movie Info */}
      <div className="relative -mt-20 px-4">
        <div className="flex gap-4">
          {/* Poster */}
          <div className="relative h-40 w-[107px] shrink-0 overflow-hidden rounded-lg shadow-lg">
            {poster ? (
              <Image
                src={poster || "/placeholder.svg"}
                alt={movie.title}
                fill
                className="object-cover"
                sizes="107px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-secondary">
                <Film className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="flex flex-col justify-end gap-1 pt-20">
            <h1 className="font-heading text-xl font-bold leading-tight text-foreground text-balance">
              {movie.title}
            </h1>
            <p className="text-xs text-muted-foreground">
              {movie.release_date?.slice(0, 4)}
              {movie.runtime ? ` \u00B7 ${movie.runtime} Min.` : ""}
            </p>
            {movie.genres && (
              <div className="mt-1 flex flex-wrap gap-1.5">
                {movie.genres.slice(0, 3).map((g) => (
                  <span
                    key={g.id}
                    className="glass-tag px-2 py-0.5"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tagline */}
        {movie.tagline && (
          <p className="mt-4 text-sm italic text-muted-foreground">
            &quot;{movie.tagline}&quot;
          </p>
        )}

        {/* External Ratings */}
        {externalRatings && (
          <div className="mt-4 glass-card p-3">
            <h4 className="mb-2 text-sm font-medium text-foreground">Externe Bewertungen</h4>
            <div className="flex flex-wrap gap-4 text-sm">
              {externalRatings.imdb_rating && (
                <div className="flex items-center gap-1">
                  <span className="font-medium">IMDb</span>
                  <span className="text-muted-foreground">{externalRatings.imdb_rating}</span>
                  {externalRatings.imdb_vote_count && (
                    <span className="text-xs text-muted-foreground">
                      ({externalRatings.imdb_vote_count.toLocaleString()})
                    </span>
                  )}
                </div>
              )}
              {externalRatings.rotten_tomatoes_rating && (
                <div className="flex items-center gap-1">
                  <span className="font-medium">RT</span>
                  <span className="text-muted-foreground">{externalRatings.rotten_tomatoes_rating}%</span>
                </div>
              )}
              {movie.vote_average > 0 && (
                <div className="flex items-center gap-1">
                  <span className="font-medium">TMDB</span>
                  <span className="text-muted-foreground">{movie.vote_average.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex gap-3">
          <Link
            href={`/log?tmdb_id=${movie.id}&title=${encodeURIComponent(movie.title)}&poster_path=${movie.poster_path || ""}`}
            className="glass-button flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20"
          >
            <PenLine className="h-4 w-4" />
            Loggen
          </Link>
          <button
            onClick={toggleWatchlist}
            disabled={saving}
            className={`glass-button flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold transition-colors ${
              inWatchlist
                ? "border-primary bg-primary/10 text-primary"
                : ""
            }`}
            type="button"
          >
            {inWatchlist ? (
              <BookmarkCheck className="h-4 w-4" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
            {inWatchlist ? "Gemerkt" : "Merken"}
          </button>
        </div>

        {/* Overview */}
        {movie.overview && (
          <div className="mt-6">
            <h2 className="mb-2 font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Handlung
            </h2>
            <p className="text-sm leading-relaxed text-foreground/80">
              {movie.overview}
            </p>
          </div>
        )}

        {/* Family Reviews */}
        {familyEntries.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-3 font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Familien-Bewertungen
            </h2>
            <div className="flex flex-col gap-3">
              {familyEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="glass-card p-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="glass-avatar flex h-6 w-6 items-center justify-center text-[10px] font-bold text-primary">
                      {entry.profiles?.display_name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-medium text-foreground">
                      {entry.profiles?.display_name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(entry.watched_at).toLocaleDateString("de-DE", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                  {entry.rating && (
                    <div className="mt-1.5">
                      <StarRating rating={entry.rating} size="sm" />
                    </div>
                  )}
                  {entry.review && (
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {entry.review}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="h-8" />
    </main>
  )
}
