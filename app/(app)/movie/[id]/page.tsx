import { getMovie } from "@/lib/tmdb"
import { getExternalRatings } from "@/lib/external-ratings"
import { createClient } from "@/lib/supabase/server"
import { MovieDetail } from "@/components/movie-detail"

export default async function MoviePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const movie = await getMovie(Number(id))
  
  // Get external ratings
  let externalRatings = null
  try {
    externalRatings = await getExternalRatings(Number(id), 'movie')
  } catch (error) {
    console.warn('Failed to load external ratings:', error)
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check if in watchlist
  const { data: watchlistItem } = await supabase
    .from("watchlist")
    .select("id")
    .eq("user_id", user?.id || "")
    .eq("tmdb_id", movie.id)
    .maybeSingle()

  // Get diary entries for this movie from family
  const { data: familyEntries } = await supabase
    .from("diary_entries")
    .select("*, profiles(display_name)")
    .eq("tmdb_id", movie.id)
    .order("created_at", { ascending: false })

  return (
    <MovieDetail
      movie={movie}
      externalRatings={externalRatings}
      isInWatchlist={!!watchlistItem}
      familyEntries={familyEntries || []}
    />
  )
}
