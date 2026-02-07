import { createClient } from "@/lib/supabase/server"
import { getTrending } from "@/lib/tmdb"
import { FeedContent } from "@/components/feed-content"

export default async function FeedPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single()

  // Get family diary entries with profiles
  const { data: entries } = await supabase
    .from("diary_entries")
    .select("*, profiles(display_name, avatar_url)")
    .order("created_at", { ascending: false })
    .limit(20)

  // Get trending movies
  let trending = { results: [] }
  try {
    trending = await getTrending()
  } catch {
    // TMDB might fail, show empty
  }

  return (
    <FeedContent
      profile={profile}
      entries={entries || []}
      trending={trending.results?.slice(0, 10) || []}
    />
  )
}
