import { createClient } from "@/lib/supabase/server"
import { ProfileContent } from "@/components/profile-content"

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single()

  const { count: diaryCount } = await supabase
    .from("diary_entries")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id)

  const { count: watchlistCount } = await supabase
    .from("watchlist")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id)

  const { count: listsCount } = await supabase
    .from("lists")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id)

  return (
    <ProfileContent
      profile={profile}
      email={user!.email || ""}
      stats={{
        diary: diaryCount || 0,
        watchlist: watchlistCount || 0,
        lists: listsCount || 0,
      }}
    />
  )
}
