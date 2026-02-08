"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { Search, Film, Loader2 } from "lucide-react"
import { posterUrl } from "@/lib/tmdb"
import type { TMDBMovie } from "@/lib/tmdb"

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<TMDBMovie[]>([])
  const [trending, setTrending] = useState<TMDBMovie[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("/api/tmdb/trending")
      .then((r) => r.json())
      .then((data) => setTrending(data.results || []))
      .catch(() => {})
  }, [])

  const searchMovies = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data.results || [])
    } catch {
      setResults([])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => searchMovies(query), 400)
    return () => clearTimeout(timer)
  }, [query, searchMovies])

  const moviesToShow = query.trim() ? results : trending

  return (
    <main className="mx-auto max-w-lg">
      <header className="sticky top-0 z-40 glass-header px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filme suchen..."
            className="glass-input h-11 w-full pl-10 pr-4 text-sm"
            autoFocus
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>
      </header>

      <div className="px-4 pt-4">
        {!query.trim() && trending.length > 0 && (
          <h2 className="mb-3 font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Beliebt gerade
          </h2>
        )}
        {query.trim() && results.length === 0 && !loading && (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <Film className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Keine Filme gefunden
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {moviesToShow.map((movie) => (
            <SearchResultCard key={movie.id} movie={movie} />
          ))}
        </div>
      </div>

      <div className="h-8" />
    </main>
  )
}

function SearchResultCard({ movie }: { movie: TMDBMovie }) {
  const url = posterUrl(movie.poster_path, "w185")

  return (
    <Link
      href={`/movie/${movie.id}`}
      className="glass-card flex gap-3 p-3 transition-all hover:bg-white/[0.08] active:scale-[0.98]"
    >
      <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-lg bg-secondary">
        {url ? (
          <Image
            src={url || "/placeholder.svg"}
            alt={movie.title}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Film className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-col justify-center gap-1">
        <h3 className="truncate font-heading text-sm font-semibold text-foreground">
          {movie.title}
        </h3>
        {movie.release_date && (
          <p className="text-xs text-muted-foreground">
            {movie.release_date.slice(0, 4)}
          </p>
        )}
        {movie.overview && (
          <p className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
            {movie.overview}
          </p>
        )}
      </div>
    </Link>
  )
}
