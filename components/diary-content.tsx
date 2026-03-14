"use client"

import React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { posterUrl } from "@/lib/tmdb"
import { StarRating } from "@/components/star-rating"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import {
  BookOpen,
  Bookmark,
  ListIcon,
  Film,
  Trash2,
  Plus,
  Loader2,
  Tv,
} from "lucide-react"

interface DiaryEntry {
  id: string
  tmdb_movie_id: number
  movie_title: string
  movie_poster_path: string | null
  rating: number | null
  imdb_rating: number | null
  rotten_tomatoes_rating: number | null
  review: string | null
  watched_on: string
  media_type: 'movie' | 'tv'
  season_number: number | null
  episode_number: number | null
}

interface WatchlistItem {
  id: string
  tmdb_id: number
  title: string
  poster_path: string | null
  added_at: string
}

interface ListItem {
  id: string
  name: string
  description: string | null
  list_items: { count: number }[]
}

interface DiaryContentProps {
  entries: DiaryEntry[]
  watchlist: WatchlistItem[]
  lists: ListItem[]
}

type Tab = "diary" | "watchlist" | "lists"

export function DiaryContent({
  entries,
  watchlist,
  lists: initialLists,
}: DiaryContentProps) {
  const [activeTab, setActiveTab] = useState<Tab>("diary")
  const [lists, setLists] = useState(initialLists)
  const [showNewList, setShowNewList] = useState(false)
  const [newListName, setNewListName] = useState("")
  const [creatingList, setCreatingList] = useState(false)
  const router = useRouter()

  const tabs: { id: Tab; label: string; icon: typeof BookOpen; count: number }[] = [
    { id: "diary", label: "Tagebuch", icon: BookOpen, count: entries.length },
    { id: "watchlist", label: "Watchlist", icon: Bookmark, count: watchlist.length },
    { id: "lists", label: "Listen", icon: ListIcon, count: lists.length },
  ]

  async function createList(e: React.FormEvent) {
    e.preventDefault()
    if (!newListName.trim()) return
    setCreatingList(true)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from("lists")
      .insert({ user_id: user.id, name: newListName.trim() })
      .select("*, list_items(count)")
      .single()

    if (!error && data) {
      setLists([data, ...lists])
      setNewListName("")
      setShowNewList(false)
    }
    setCreatingList(false)
  }

  async function removeFromWatchlist(id: string) {
    const supabase = createClient()
    await supabase.from("watchlist").delete().eq("id", id)
    router.refresh()
  }

  async function deleteDiaryEntry(id: string) {
    const supabase = createClient()
    await supabase.from("diary_entries").delete().eq("id", id)
    router.refresh()
  }

  return (
    <main className="mx-auto max-w-4xl">
      <header className="sticky top-0 z-40 glass-header px-4 py-3">
        <h1 className="font-heading text-xl font-bold text-foreground">
          Mein Tagebuch
        </h1>
        <div className="w-16" />
      </header>

      <div className="px-4 pt-4">
        {/* Diary Tab */}
        {activeTab === "diary" && (
          <>
            {entries.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="Noch keine Eintraege"
                description="Logge deinen ersten Film!"
                href="/log"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {entries.map((entry) => {
                  const url = posterUrl(entry.movie_poster_path, "w342")
                  return (
                    <div
                      key={entry.id}
                      className="glass-card overflow-hidden"
                    >
                      <Link href={`/movie/${entry.tmdb_movie_id}`} className="block">
                        <div className="relative h-48 w-full overflow-hidden bg-secondary">
                          {url ? (
                            <Image
                              src={url || "/placeholder.svg"}
                              alt={entry.movie_title}
                              fill
                              className="object-cover"
                              sizes="100%"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              {entry.media_type === 'tv' ? (
                                <Tv className="h-8 w-8 text-muted-foreground" />
                              ) : (
                                <Film className="h-8 w-8 text-muted-foreground" />
                              )}
                            </div>
                          )}
                        </div>
                      </Link>

                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Link href={`/movie/${entry.tmdb_movie_id}`}>
                            <h3 className="truncate font-heading text-base font-semibold text-foreground">
                              {entry.movie_title}
                            </h3>
                          </Link>
                        </div>

                        <p className="text-sm text-muted-foreground mb-2">
                          {entry.watched_on 
                            ? new Date(entry.watched_on).toLocaleDateString(
                                "de-DE",
                                { day: "numeric", month: "long", year: "numeric" }
                              )
                            : "Kein Datum"
                          }
                          {entry.media_type === 'tv' && entry.season_number && (
                            <span className="ml-2">
                              S{entry.season_number}
                              {entry.episode_number && `E${entry.episode_number}`}
                            </span>
                          )}
                        </p>

                        {entry.rating && (
                          <div className="mb-2">
                            <StarRating rating={entry.rating} size="sm" />
                          </div>
                        )}

                        {/* External Ratings */}
                        <div className="flex gap-2 text-xs text-muted-foreground mb-2">
                          {entry.imdb_rating && (
                            <span>IMDb {entry.imdb_rating}</span>
                          )}
                          {entry.rotten_tomatoes_rating && (
                            <span>RT {entry.rotten_tomatoes_rating}%</span>
                          )}
                        </div>

                        {entry.review && (
                          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                            {entry.review}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-3">
                          <button
                            onClick={async () => {
                              const supabase = createClient()
                              await supabase
                                .from("diary_entries")
                                .delete()
                                .eq("id", entry.id)
                              router.refresh()
                            }}
                            className="text-muted-foreground transition-colors hover:text-destructive"
                            type="button"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* Watchlist Tab */}
        {activeTab === "watchlist" && (
          <>
            {watchlist.length === 0 ? (
              <EmptyState
                icon={Bookmark}
                title="Watchlist leer"
                description="Merke dir Filme, die du noch sehen willst"
                href="/search"
              />
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {watchlist.map((item) => {
                  const url = posterUrl(item.poster_path, "w185")
                  return (
                    <div key={item.id} className="group relative">
                      <Link href={`/movie/${item.tmdb_id}`}>
                        <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-secondary">
                          {url ? (
                            <Image
                              src={url || "/placeholder.svg"}
                              alt={item.title}
                              fill
                              className="object-cover"
                              sizes="33vw"
                            />
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
                        onClick={() => removeFromWatchlist(item.id)}
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background/80 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                        type="button"
                        aria-label="Von Watchlist entfernen"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* Lists Tab */}
        {activeTab === "lists" && (
          <>
            <button
              onClick={() => setShowNewList(true)}
              className="mb-4 glass-card flex w-full items-center justify-center gap-2 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-white/[0.08] active:scale-[0.98]"
              type="button"
            >
              <Plus className="h-4 w-4" />
              Neue Liste erstellen
            </button>

            {showNewList && (
              <form
                onSubmit={createList}
                className="mb-4 flex gap-2"
              >
                <input
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Listenname..."
                  className="glass-input h-10 flex-1 text-sm"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={creatingList}
                  className="glass-button flex h-10 items-center justify-center px-4 text-sm font-semibold disabled:opacity-50"
                >
                  {creatingList ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Erstellen"
                  )}
                </button>
              </form>
            )}

            {lists.length === 0 && !showNewList ? (
              <EmptyState
                icon={ListIcon}
                title="Keine Listen"
                description="Erstelle deine erste Film-Liste"
              />
            ) : (
              <div className="flex flex-col gap-3">
                {lists.map((list) => (
                  <Link
                    key={list.id}
                    href={`/lists/${list.id}`}
                    className="glass-card flex items-center justify-between p-4 transition-all hover:bg-white/[0.08] active:scale-[0.98]"
                  >
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        {list.name}
                      </h3>
                      {list.description && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {list.description}
                        </p>
                      )}
                    </div>
                    <span className="glass-tag">
                      {list.list_items?.[0]?.count || 0} Filme
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="h-8" />
    </main>
  )
}

function EmptyState({
  icon: Icon,
  title,
  description,
  href,
}: {
  icon: typeof BookOpen
  title: string
  description: string
  href?: string
}) {
  return (
    <div className="glass-card flex flex-col items-center gap-3 px-6 py-12 text-center">
      <Icon className="h-10 w-10 text-muted-foreground" />
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      {href && (
        <Link
          href={href}
          className="mt-2 glass-button bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20"
        >
          Los geht&apos;s
        </Link>
      )}
    </div>
  )
}
