// External Ratings API
import { createClient } from '@/lib/supabase/client'

export async function getExternalRatings(tmdbId: number, mediaType: 'movie' | 'tv') {
  const supabase = createClient()
  
  // First check cache
  const { data: cached } = await supabase
    .from('external_ratings')
    .select('*')
    .eq('tmdb_id', tmdbId)
    .eq('media_type', mediaType)
    .single()

  if (cached && new Date(cached.last_updated).getTime() > Date.now() - 24 * 60 * 60 * 1000) {
    return cached
  }

  // Fetch from TMDB (includes IMDB ID)
  const tmdbResponse = await fetch(
    `https://api.themoviedb.org/3/${mediaType}/${tmdbId}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&append_to_response=external_ids`
  )
  
  if (!tmdbResponse.ok) {
    throw new Error('Failed to fetch TMDB data')
  }
  
  const tmdbData = await tmdbResponse.json()
  const imdbId = tmdbData.external_ids?.imdb_id

  let imdbRating = null
  let imdbVoteCount = null
  let rottenTomatoesRating = null

  // Fetch IMDB rating if IMDB ID is available
  if (imdbId) {
    try {
      // Note: In production, you'd want to use a proper IMDB API or proxy
      // For now, we'll simulate with OMDB API (free tier)
      const omdbResponse = await fetch(
        `https://www.omdbapi.com/?i=${imdbId}&apikey=${process.env.NEXT_PUBLIC_OMDB_API_KEY}`
      )
      
      if (omdbResponse.ok) {
        const omdbData = await omdbResponse.json()
        if (omdbData.imdbRating && omdbData.imdbVotes) {
          imdbRating = parseFloat(omdbData.imdbRating)
          imdbVoteCount = parseInt(omdbData.imdbVotes.replace(/,/g, ''))
        }
        
        // Try to get Rotten Tomatoes rating from OMDB
        if (omdbData.Ratings) {
          const rtRating = omdbData.Ratings.find((r: any) => r.Source === 'Rotten Tomatoes')
          if (rtRating && rtRating.Value) {
            // Extract percentage from format like "88%" or "8.8/10"
            const rtMatch = rtRating.Value.match(/(\d+(?:\.\d+)?)/)
            if (rtMatch) {
              const rtValue = parseFloat(rtMatch[1])
              // Convert to percentage if it's not already
              rottenTomatoesRating = rtValue > 10 ? rtValue : rtValue * 10
            }
          }
        }
      }
    } catch (error) {
      console.warn('Failed to fetch IMDB ratings:', error)
    }
  }

  // Cache the results
  const ratingsData = {
    tmdb_id: tmdbId,
    media_type: mediaType,
    imdb_id: imdbId,
    imdb_rating: imdbRating,
    imdb_vote_count: imdbVoteCount,
    rotten_tomatoes_rating: rottenTomatoesRating,
    last_updated: new Date().toISOString()
  }

  await supabase
    .from('external_ratings')
    .upsert(ratingsData, {
      onConflict: 'tmdb_id,media_type'
    })

  return ratingsData
}
