"use client"

import React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { ListIcon, Plus, Loader2, Film, Trash2 } from "lucide-react"

interface ListWithCount {
  id: string
  name: string
  description: string | null
  created_at: string
  list_items: { count: number }[]
}

export default function ListsPage() {
  const [lists, setLists] = useState<ListWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewList, setShowNewList] = useState(false)
  const [newListName, setNewListName] = useState("")
  const [newListDesc, setNewListDesc] = useState("")
  const [creatingList, setCreatingList] = useState(false)

  useEffect(() => {
    loadLists()
  }, [])

  async function loadLists() {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("lists")
      .select("*, list_items(count)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    setLists(data || [])
    setLoading(false)
  }

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
      .insert({
        user_id: user.id,
        name: newListName.trim(),
        description: newListDesc.trim() || null,
      })
      .select("*, list_items(count)")
      .single()

    if (!error && data) {
      setLists([data, ...lists])
      setNewListName("")
      setNewListDesc("")
      setShowNewList(false)
    }
    setCreatingList(false)
  }

  async function deleteList(id: string) {
    const supabase = createClient()
    await supabase.from("lists").delete().eq("id", id)
    setLists(lists.filter((l) => l.id !== id))
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-lg">
        <header className="sticky top-0 z-40 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-md">
          <h1 className="font-heading text-xl font-bold text-foreground">
            Meine Listen
          </h1>
        </header>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-lg">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-xl font-bold text-foreground">
            Meine Listen
          </h1>
          <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {lists.length}
          </span>
        </div>
      </header>

      <div className="px-4 pt-4">
        {/* New list button */}
        <button
          onClick={() => setShowNewList(!showNewList)}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          type="button"
        >
          <Plus className="h-4 w-4" />
          Neue Liste erstellen
        </button>

        {/* New list form */}
        {showNewList && (
          <form onSubmit={createList} className="mb-4 flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
            <input
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="Listenname..."
              className="h-10 rounded-lg border border-border bg-secondary px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              autoFocus
            />
            <input
              value={newListDesc}
              onChange={(e) => setNewListDesc(e.target.value)}
              placeholder="Beschreibung (optional)..."
              className="h-10 rounded-lg border border-border bg-secondary px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowNewList(false)}
                className="flex-1 rounded-lg border border-border bg-card py-2.5 text-sm font-medium text-muted-foreground"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={creatingList || !newListName.trim()}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                {creatingList ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Erstellen"
                )}
              </button>
            </div>
          </form>
        )}

        {/* Lists */}
        {lists.length === 0 && !showNewList ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card px-6 py-12 text-center">
            <ListIcon className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Keine Listen vorhanden
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Erstelle Listen wie &quot;Beste Weihnachtsfilme&quot; oder &quot;Familienabend-Favoriten&quot;
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {lists.map((list) => (
              <div
                key={list.id}
                className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-secondary"
              >
                <Link
                  href={`/lists/${list.id}`}
                  className="flex flex-1 items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Film className="h-5 w-5 text-primary" />
                    </div>
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
                  </div>
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    {list.list_items?.[0]?.count || 0} Filme
                  </span>
                </Link>
                <button
                  onClick={() => deleteList(list.id)}
                  className="p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                  type="button"
                  aria-label="Liste loeschen"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="h-24" />
    </main>
  )
}
