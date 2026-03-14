"use client"

import Image from "next/image"
import Link from "next/link"
import { posterUrl } from "@/lib/tmdb"
import { StarRating } from "@/components/star-rating"
import { MovieCard } from "@/components/movie-card"
import { Heart, MessageCircle, Film, Clock, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"

interface FeedEntry {
  id: string
  user_id: string
  tmdb_movie_id: number
  movie_title: string
  movie_poster_path: string | null
  rating: number | null
  review: string | null
  watched_on: string
  created_at: string
  profiles: {
    display_name: string
    avatar_url: string | null
  }
}

interface TrendingMovie {
  id: number
  title: string
  poster_path: string | null
  release_date?: string
}

interface FeedContentProps {
  profile: { display_name: string; avatar_url: string | null } | null
  entries: FeedEntry[]
  trending: TrendingMovie[]
}

export function FeedContent({ profile, entries, trending }: FeedContentProps) {
  return (
    <main className="mx-auto max-w-4xl">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between glass-header px-4 py-3">
        <div className="flex items-center gap-2">
          <Film className="h-6 w-6 text-primary" />
          <h1 className="font-heading text-xl font-bold text-foreground">
            InFocus
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Hallo, {profile?.display_name || "Film-Fan"}
        </p>
      </header>

      {/* Trending Section */}
      {trending.length > 0 && (
        <section className="px-4 pt-5 pb-2">
          <h2 className="mb-3 font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Trending diese Woche
          </h2>
          <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-2">
            {trending.map((movie) => (
              <MovieCard
                key={movie.id}
                tmdbId={movie.id}
                title={movie.title}
                posterPath={movie.poster_path}
                subtitle={movie.release_date?.slice(0, 4)}
                size="sm"
              />
            ))}
          </div>
        </section>
      )}

      {/* Family Feed */}
      <section className="px-4 pt-4">
        <h2 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Familien-Aktivit&auml;t
        </h2>
        {entries.length === 0 ? (
          <div className="glass-card flex flex-col items-center gap-3 px-6 py-12 text-center">
            <Clock className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Noch keine Eintr&auml;ge. Logge deinen ersten Film!
            </p>
            <Link
              href="/log"
              className="mt-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
            >
              Film loggen
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {entries.map((entry) => (
              <FeedCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </section>

      <div className="h-8" />
    </main>
  )
}

function FeedCard({ entry }: { entry: FeedEntry }) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [liking, setLiking] = useState(false)
  const url = posterUrl(entry.movie_poster_path, "w342")

  async function toggleLike() {
    if (liking) return
    setLiking(true)
    
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setLiking(false)
      return
    }

    if (liked) {
      await supabase
        .from("likes")
        .delete()
        .eq("user_id", user.id)
        .eq("diary_entry_id", entry.id)
      setLiked(false)
      setLikeCount((c) => Math.max(0, c - 1))
    } else {
      await supabase.from("likes").insert({
        user_id: user.id,
        diary_entry_id: entry.id,
      })
      setLiked(true)
      setLikeCount((c) => c + 1)
    }
    setLiking(false)
  }

  const watchedDate = entry.watched_on 
    ? new Date(entry.watched_on).toLocaleDateString("de-DE", {
        day: "numeric",
        month: "short",
      })
    : "Kein Datum"

  return (
    <article className="glass-card overflow-hidden">
      <div className="flex gap-4 p-4">
        {/* Poster */}
        <Link href={`/movie/${entry.tmdb_movie_id}`} className="shrink-0">
          <div className="relative h-32 w-[120px] overflow-hidden rounded-lg bg-secondary">
            {url ? (
              <Image
                src={url || "/placeholder.svg"}
                alt={entry.movie_title}
                fill
                className="object-cover"
                sizes="120px"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Film className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>
        </Link>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="glass-avatar flex h-8 w-8 items-center justify-center text-sm font-bold text-primary flex-shrink-0">
              {entry.profiles?.display_name?.charAt(0).toUpperCase() || "?"}
            </div>
            <span className="text-sm font-medium text-foreground truncate">
              {entry.profiles?.display_name}
            </span>
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {watchedDate}
            </span>
          </div>

          <Link href={`/movie/${entry.tmdb_movie_id}`}>
            <h3 className="truncate font-heading text-base font-semibold text-foreground">
              {entry.movie_title}
            </h3>
          </Link>

          {entry.rating && <StarRating rating={entry.rating} size="sm" />}

          {entry.review && (
            <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
              {entry.review}
            </p>
          )}

          {/* Actions */}
          <div className="mt-2 flex items-center gap-4">
            <button
              onClick={toggleLike}
              disabled={liking}
              className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-primary disabled:opacity-50"
              type="button"
            >
              {liking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Heart
                  className={`h-4 w-4 ${liked ? "fill-primary text-primary" : ""}`}
                />
              )}
              {likeCount > 0 && (
                <span className="text-xs">{likeCount}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
