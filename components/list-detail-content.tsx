"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { posterUrl } from "@/lib/tmdb"
import type { TMDBMovie } from "@/lib/tmdb"
import {
  ArrowLeft,
  Plus,
  Search,
  Film,
  Trash2,
  X,
  Loader2,
  Share2,
} from "lucide-react"

interface ListItem {
  id: string
  tmdb_id: number
  title: string
  poster_path: string | null
}

interface ListDetailContentProps {
  list: { id: string; name: string; description: string | null }
  items: ListItem[]
}

export function ListDetailContent({
  list,
  items: initialItems,
}: ListDetailContentProps) {
  const [items, setItems] = useState(initialItems)
  const [showSearch, setShowSearch] = useState(false)
  const [query, setQuery] = useState("")
  const [searchResults, setSearchResults] = useState<TMDBMovie[]>([])
  const [searching, setSearching] = useState(false)
  const router = useRouter()

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setSearchResults([])
      return
    }
    setSearching(true)
    try {
      const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setSearchResults(data.results || [])
    } catch {
      setSearchResults([])
    }
    setSearching(false)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 400)
    return () => clearTimeout(timer)
  }, [query, doSearch])

  async function addToList(movie: TMDBMovie) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("list_items")
      .insert({
        list_id: list.id,
        tmdb_id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
      })
      .select()
      .single()

    if (!error && data) {
      setItems([data, ...items])
      setShowSearch(false)
      setQuery("")
    }
  }

  async function removeItem(id: string) {
    const supabase = createClient()
    await supabase.from("list_items").delete().eq("id", id)
    setItems(items.filter((i) => i.id !== id))
  }

  async function handleShare() {
    const text = `Schau dir meine Filmliste "${list.name}" an: ${items.map((i) => i.title).join(", ")}`
    if (navigator.share) {
      try {
        await navigator.share({ title: list.name, text, url: window.location.href })
      } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(text)
    }
  }

  return (
    <main className="mx-auto max-w-lg">
      <header className="sticky top-0 z-40 glass-header px-4 py-3">
        <button onClick={() => router.back()} type="button" aria-label="Zurueck">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="font-heading text-lg font-bold text-foreground">
          {list.name}
        </h1>
        <button onClick={handleShare} type="button" aria-label="Teilen">
          <Share2 className="h-5 w-5 text-foreground" />
        </button>
      </header>

      <div className="px-4 pt-4">
        {/* Add movie */}
        {showSearch ? (
          <div className="mb-4">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Film zur Liste hinzufuegen..."
                className="glass-input h-10 w-full pl-9 pr-9 text-sm"
                autoFocus
              />
              <button
                onClick={() => {
                  setShowSearch(false)
                  setQuery("")
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {searching && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
            {searchResults.map((movie) => {
              const url = posterUrl(movie.poster_path, "w185")
              const alreadyAdded = items.some((i) => i.tmdb_id === movie.id)
              return (
                <button
                  key={movie.id}
                  onClick={() => !alreadyAdded && addToList(movie)}
                  disabled={alreadyAdded}
                  className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-secondary disabled:opacity-50"
                  type="button"
                >
                  <div className="relative h-12 w-8 shrink-0 overflow-hidden rounded bg-secondary">
                    {url ? (
                      <Image src={url || "/placeholder.svg"} alt={movie.title} fill className="object-cover" sizes="32px" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Film className="h-3 w-3 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">{movie.title}</p>
                    <p className="text-xs text-muted-foreground">{movie.release_date?.slice(0, 4)}</p>
                  </div>
                  {alreadyAdded && (
                    <span className="text-xs text-muted-foreground">Bereits drin</span>
                  )}
                </button>
              )
            })}
          </div>
        ) : (
          <button
            onClick={() => setShowSearch(true)}
            className="mb-4 glass-card flex w-full items-center justify-center gap-2 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-white/[0.08] active:scale-[0.98]"
            type="button"
          >
            <Plus className="h-4 w-4" />
            Film hinzufuegen
          </button>
        )}

        {/* List items */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <Film className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Diese Liste ist noch leer
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {items.map((item) => {
              const url = posterUrl(item.poster_path, "w185")
              return (
                <div key={item.id} className="group relative">
                  <Link href={`/movie/${item.tmdb_id}`}>
                    <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-secondary">
                      {url ? (
                        <Image src={url || "/placeholder.svg"} alt={item.title} fill className="object-cover" sizes="33vw" />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Film className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <p className="mt-1.5 truncate text-xs font-medium text-foreground">
                      {item.title}
                    </p>
                  </Link>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background/80 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                    type="button"
                    aria-label="Entfernen"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="h-8" />
    </main>
  )
}
