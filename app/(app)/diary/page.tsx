import { createClient } from "@/lib/supabase/server"
import { DiaryContent } from "@/components/diary-content"

export default async function DiaryPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: entries } = await supabase
    .from("diary_entries")
    .select("*")
    .eq("user_id", user!.id)
    .order("watched_at", { ascending: false })

  const { data: watchlist } = await supabase
    .from("watchlist")
    .select("*")
    .eq("user_id", user!.id)
    .order("added_at", { ascending: false })

  const { data: lists } = await supabase
    .from("lists")
    .select("*, list_items(count)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })

  return (
    <DiaryContent
      entries={entries || []}
      watchlist={watchlist || []}
      lists={lists || []}
    />
  )
}
