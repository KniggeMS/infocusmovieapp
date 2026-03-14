import { createClient } from "@/lib/supabase/server"
import { DiaryContent } from "@/components/diary-content"

interface DiaryEntry {
  id: string
  tmdb_movie_id: number
  movie_title: string
  movie_poster_path: string | null
  rating: number | null
  review: string | null
  watched_on: string
}

export default async function DiaryPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <DiaryContent
        entries={[]}
        watchlist={[]}
        lists={[]}
      />
    )
  }

  const { data: entries, error: entriesError } = await supabase
    .from("diary_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("watched_on", { ascending: false })

  if (entriesError) {
    console.error("Error fetching diary entries:", entriesError)
  }

  const { data: watchlist, error: watchlistError } = await supabase
    .from("watchlist")
    .select("*")
    .eq("user_id", user.id)
    .order("added_at", { ascending: false })

  if (watchlistError) {
    console.error("Error fetching watchlist:", watchlistError)
  }

  const { data: lists, error: listsError } = await supabase
    .from("lists")
    .select("*, list_items(count)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (listsError) {
    console.error("Error fetching lists:", listsError)
  }

  return (
    <DiaryContent
      entries={entries || []}
      watchlist={watchlist || []}
      lists={lists || []}
    />
  )
}
