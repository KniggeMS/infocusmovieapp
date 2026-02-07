"use client"

import Image from "next/image"
import Link from "next/link"
import { posterUrl } from "@/lib/tmdb"
import { StarRating } from "@/components/star-rating"
import { MovieCard } from "@/components/movie-card"
import { Heart, MessageCircle, Film, Clock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"

interface FeedEntry {
  id: string
  user_id: string
  tmdb_id: number
  title: string
  poster_path: string | null
  rating: number | null
  review: string | null
  watched_at: string
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
    <main className="mx-auto max-w-lg">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur-md">
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
          <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card px-6 py-12 text-center">
            <Clock className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Noch keine Eintr&auml;ge. Logge deinen ersten Film!
            </p>
            <Link
              href="/log"
              className="mt-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Film loggen
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
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
  const url = posterUrl(entry.poster_path, "w185")

  async function toggleLike() {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

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
  }

  const watchedDate = new Date(entry.watched_at).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "short",
  })

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex gap-3 p-4">
        {/* Poster */}
        <Link href={`/movie/${entry.tmdb_id}`} className="shrink-0">
          <div className="relative h-28 w-[75px] overflow-hidden rounded-lg bg-secondary">
            {url ? (
              <Image
                src={url || "/placeholder.svg"}
                alt={entry.title}
                fill
                className="object-cover"
                sizes="75px"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Film className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </div>
        </Link>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
              {entry.profiles?.display_name?.charAt(0).toUpperCase() || "?"}
            </div>
            <span className="text-xs font-medium text-foreground">
              {entry.profiles?.display_name}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {watchedDate}
            </span>
          </div>

          <Link href={`/movie/${entry.tmdb_id}`}>
            <h3 className="truncate font-heading text-sm font-semibold text-foreground">
              {entry.title}
            </h3>
          </Link>

          {entry.rating && <StarRating rating={entry.rating} size="sm" />}

          {entry.review && (
            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {entry.review}
            </p>
          )}

          {/* Actions */}
          <div className="mt-1 flex items-center gap-4">
            <button
              onClick={toggleLike}
              className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-primary"
              type="button"
            >
              <Heart
                className={`h-4 w-4 ${liked ? "fill-primary text-primary" : ""}`}
              />
              {likeCount > 0 && (
                <span className="text-[10px]">{likeCount}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
