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
} from "lucide-react"

interface DiaryEntry {
  id: string
  tmdb_id: number
  title: string
  poster_path: string | null
  rating: number | null
  review: string | null
  watched_at: string
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
    <main className="mx-auto max-w-lg">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
        <h1 className="px-4 pt-3 pb-2 font-heading text-xl font-bold text-foreground">
          Meine Filme
        </h1>
        <div className="flex px-4">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 pb-2.5 pt-1 text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                type="button"
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px]">
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>
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
              <div className="flex flex-col gap-3">
                {entries.map((entry) => {
                  const url = posterUrl(entry.poster_path, "w185")
                  return (
                    <div
                      key={entry.id}
                      className="flex gap-3 rounded-xl border border-border bg-card p-3"
                    >
                      <Link href={`/movie/${entry.tmdb_id}`} className="shrink-0">
                        <div className="relative h-20 w-[54px] overflow-hidden rounded-lg bg-secondary">
                          {url ? (
                            <Image
                              src={url || "/placeholder.svg"}
                              alt={entry.title}
                              fill
                              className="object-cover"
                              sizes="54px"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Film className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </Link>
                      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
                        <Link href={`/movie/${entry.tmdb_id}`}>
                          <h3 className="truncate text-sm font-semibold text-foreground">
                            {entry.title}
                          </h3>
                        </Link>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(entry.watched_at).toLocaleDateString(
                            "de-DE",
                            { day: "numeric", month: "long", year: "numeric" }
                          )}
                        </p>
                        {entry.rating && (
                          <StarRating rating={entry.rating} size="sm" />
                        )}
                      </div>
                      <button
                        onClick={() => deleteDiaryEntry(entry.id)}
                        className="self-start p-1 text-muted-foreground hover:text-destructive"
                        type="button"
                        aria-label="Eintrag loeschen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
              className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
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
                  className="h-10 flex-1 rounded-lg border border-border bg-secondary px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={creatingList}
                  className="flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
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
                    className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:bg-secondary"
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
                    <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
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
    <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card px-6 py-12 text-center">
      <Icon className="h-10 w-10 text-muted-foreground" />
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      {href && (
        <Link
          href={href}
          className="mt-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Los geht&apos;s
        </Link>
      )}
    </div>
  )
}
