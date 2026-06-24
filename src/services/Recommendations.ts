import { Movie } from '../types/domain';

const TMDB_GENRE_NAME_TO_ID: Record<string, number> = {
  Action: 28,
  Adventure: 12,
  Animation: 16,
  Comedy: 35,
  Crime: 80,
  Documentary: 99,
  Drama: 18,
  Family: 10751,
  Fantasy: 14,
  History: 36,
  Horror: 27,
  Music: 10402,
  Mystery: 9648,
  Romance: 10749,
  'Science Fiction': 878,
  'Sci-Fi': 878,
  'TV Movie': 10770,
  Thriller: 53,
  War: 10752,
  Western: 37,
  // German labels (TMDB returns German genre names when language=de-DE)
  Abenteuer: 12,
  'Animation ': 16,
  Komödie: 35,
  Dokumentarfilm: 99,
  Familie: 10751,
  'Fantasy ': 14,
  Historie: 36,
  'Horror ': 27,
  Musik: 10402,
  Krimi: 80,
  'Mystery ': 9648,
  Liebesfilm: 10749,
  'Science Fiction ': 878,
  'Thriller ': 53,
  Krieg: 10752,
  'Drama ': 18,
};

export interface RecommendationItem {
  movie: Movie;
  score: number;
  reasons: string[];
}

export interface UserPreferences {
  topGenres: { name: string; weight: number }[];
  averageUserRating: number | null;
  prefersHighlyRated: boolean;
  favoriteCount: number;
  watchedCount: number;
  totalCount: number;
}

export function deriveUserPreferences(library: Movie[]): UserPreferences {
  const genreScores = new Map<string, number>();
  let ratingSum = 0;
  let ratedCount = 0;
  const total = library.length;

  for (const m of library) {
    let weight = 1;
    if (m.favorite) weight += 2;
    if (m.watched) weight += 0.5;
    if (typeof m.userRating === 'number') {
      weight += Math.max(0, (m.userRating - 5) / 2); // ratings >5 add weight
      ratingSum += m.userRating;
      ratedCount++;
    }
    (m.genres || []).forEach((g) => {
      if (!g) return;
      genreScores.set(g, (genreScores.get(g) || 0) + weight);
    });
  }

  const sortedGenres = Array.from(genreScores.entries())
    .map(([name, weight]) => ({ name, weight }))
    .sort((a, b) => b.weight - a.weight);

  const avg = ratedCount > 0 ? ratingSum / ratedCount : null;

  return {
    topGenres: sortedGenres.slice(0, 3),
    averageUserRating: avg,
    prefersHighlyRated: avg !== null && avg >= 7,
    favoriteCount: library.filter((m) => m.favorite).length,
    watchedCount: library.filter((m) => m.watched).length,
    totalCount: total,
  };
}

interface FetchOpts {
  apiKey: string;
  language?: string;
}

async function fetchDiscoverByGenre(genreId: number, opts: FetchOpts): Promise<Movie[]> {
  const lang = opts.language || 'de-DE';
  const url = `https://api.themoviedb.org/3/discover/movie?api_key=${opts.apiKey}&language=${lang}&sort_by=vote_average.desc&vote_count.gte=300&with_genres=${genreId}&page=1`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).slice(0, 12).map((r: any) => ({
      id: String(r.id),
      tmdbId: r.id,
      title: r.title || r.name,
      posterPath: r.poster_path ? `https://image.tmdb.org/t/p/w500${r.poster_path}` : null,
      releaseDate: r.release_date || null,
      overview: r.overview || null,
      voteAverage: r.vote_average || null,
      runtime: null,
      mediaType: 'movie' as const,
      source: 'tmdb' as const,
    }));
  } catch (err) {
    console.warn('Recommendations discover failed:', err);
    return [];
  }
}

export async function getSmartRecommendations(
  library: Movie[],
  apiKey: string | undefined,
  limit = 12,
): Promise<{ items: RecommendationItem[]; prefs: UserPreferences }> {
  const prefs = deriveUserPreferences(library);

  if (!apiKey || prefs.totalCount === 0 || prefs.topGenres.length === 0) {
    return { items: [], prefs };
  }

  const ownedTmdbIds = new Set(
    library
      .map((m) => (typeof m.tmdbId === 'number' ? m.tmdbId : null))
      .filter((id): id is number => id !== null),
  );

  const genreIdsSeen = new Set<number>();
  const requests: Promise<{ genreName: string; movies: Movie[] }>[] = [];
  for (const g of prefs.topGenres) {
    const id = TMDB_GENRE_NAME_TO_ID[g.name] ?? TMDB_GENRE_NAME_TO_ID[g.name.trim()];
    if (id && !genreIdsSeen.has(id)) {
      genreIdsSeen.add(id);
      requests.push(
        fetchDiscoverByGenre(id, { apiKey }).then((movies) => ({ genreName: g.name, movies })),
      );
    }
  }

  const results = await Promise.all(requests);
  const candidatesById = new Map<string, RecommendationItem>();

  for (const { genreName, movies } of results) {
    for (const movie of movies) {
      if (movie.tmdbId && ownedTmdbIds.has(movie.tmdbId)) continue;
      const reason = `weil du ${genreName} magst`;
      const existing = candidatesById.get(movie.id);
      const baseScore = (movie.voteAverage || 0) + (prefs.prefersHighlyRated ? 1 : 0);
      if (existing) {
        existing.score += baseScore;
        if (!existing.reasons.includes(reason)) existing.reasons.push(reason);
      } else {
        candidatesById.set(movie.id, {
          movie,
          score: baseScore,
          reasons: [reason],
        });
      }
    }
  }

  const ranked = Array.from(candidatesById.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  // Add a fluent reason summarizing top genres for the first few.
  if (ranked.length > 0 && prefs.prefersHighlyRated) {
    ranked.slice(0, 3).forEach((r) => r.reasons.push('hoch bewertet, passt zu deinem Geschmack'));
  }

  return { items: ranked, prefs };
}
