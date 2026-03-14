const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

export function posterUrl(path: string | null, size: 'w185' | 'w342' | 'w500' | 'original' = 'w342') {
  if (!path) return null
  return `${TMDB_IMAGE_BASE}/${size}${path}`
}

export function backdropUrl(path: string | null, size: 'w780' | 'w1280' | 'original' = 'w1280') {
  if (!path) return null
  return `${TMDB_IMAGE_BASE}/${size}${path}`
}

async function tmdbFetch(endpoint: string, params: Record<string, string> = {}) {
  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey) {
    throw new Error('TMDB API key is not configured')
  }

  const url = new URL(`${TMDB_BASE}${endpoint}`)
  url.searchParams.set('api_key', apiKey)
  url.searchParams.set('language', 'de-DE')
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  const res = await fetch(url.toString(), { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`)
  return res.json()
}

export async function searchMovies(query: string, page = 1) {
  return tmdbFetch('/search/movie', { query, page: String(page) })
}

export async function searchTVShows(query: string, page = 1) {
  return tmdbFetch('/search/tv', { query, page: String(page) })
}

export async function searchAll(query: string, page = 1) {
  return tmdbFetch('/search/multi', { query, page: String(page) })
}

export async function getMovie(id: number) {
  return tmdbFetch(`/movie/${id}`)
}

export async function getTVShow(id: number) {
  return tmdbFetch(`/tv/${id}`)
}

export async function getTrending() {
  return tmdbFetch('/trending/movie/week')
}

export async function getTrendingAll() {
  return tmdbFetch('/trending/all/week')
}

export async function getPopular(page = 1) {
  return tmdbFetch('/movie/popular', { page: String(page) })
}

export async function getPopularTVShows(page = 1) {
  return tmdbFetch('/tv/popular', { page: String(page) })
}

export interface TMDBMovie {
  id: number
  title: string
  poster_path: string | null
  backdrop_path: string | null
  overview: string
  release_date: string
  vote_average: number
  genre_ids?: number[]
}

export interface TMDBTVShow {
  id: number
  name: string
  poster_path: string | null
  backdrop_path: string | null
  overview: string
  first_air_date: string
  vote_average: number
  genre_ids?: number[]
}

export interface TMDBMultiResult {
  id: number
  title?: string
  name?: string
  poster_path: string | null
  backdrop_path: string | null
  overview: string
  release_date?: string
  first_air_date?: string
  vote_average: number
  media_type: 'movie' | 'tv' | 'person'
  genre_ids?: number[]
}

export interface TMDBSearchResult {
  page: number
  results: TMDBMovie[] | TMDBTVShow[] | TMDBMultiResult[]
  total_pages: number
  total_results: number
}

export interface TMDBMovieDetail extends TMDBMovie {
  runtime: number
  genres: { id: number; name: string }[]
  tagline: string
  imdb_id?: string
}

export interface TMDBTVShowDetail extends TMDBTVShow {
  episode_run_time: number[]
  genres: { id: number; name: string }[]
  tagline: string
  number_of_seasons: number
  number_of_episodes: number
  imdb_id?: string
}
