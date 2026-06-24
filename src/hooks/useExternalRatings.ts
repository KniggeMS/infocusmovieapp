import { useState, useEffect } from 'react';

export interface ExternalRatings {
  tmdb: number | null;
  rottenTomatoes: string | null;
  imdbId: string | null;
}

const cache = new Map<string, ExternalRatings>();

export function useExternalRatings(
  tmdbId: number | undefined,
  title: string,
  mediaType: 'movie' | 'tv' = 'movie',
  voteAverage: number | null,
): { ratings: ExternalRatings; loading: boolean } {
  const [ratings, setRatings] = useState<ExternalRatings>({
    tmdb: voteAverage,
    rottenTomatoes: null,
    imdbId: null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cacheKey = tmdbId ? `tmdb-${tmdbId}` : `title-${title}`;

    if (cache.has(cacheKey)) {
      setRatings(cache.get(cacheKey)!);
      return;
    }

    const omdbKey = import.meta.env.VITE_OMDB_API_KEY;
    if (!omdbKey) return;

    let cancelled = false;
    setLoading(true);

    const fetchRatings = async () => {
      try {
        const type = mediaType === 'tv' ? 'series' : 'movie';
        const url = `https://www.omdbapi.com/?apikey=${omdbKey}&t=${encodeURIComponent(title)}&type=${type}&tomatoes=true`;
        const res = await fetch(url);
        const data = await res.json();

        if (cancelled) return;

        if (data.Response === 'True') {
          const rt = data.Ratings?.find((r: any) => r.Source === 'Rotten Tomatoes');
          const result: ExternalRatings = {
            tmdb: voteAverage,
            rottenTomatoes: rt?.Value ?? null,
            imdbId: data.imdbID ?? null,
          };
          cache.set(cacheKey, result);
          setRatings(result);
        }
      } catch (err) {
        console.warn('useExternalRatings: OMDb fetch failed', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchRatings();
    return () => {
      cancelled = true;
    };
  }, [tmdbId, title, mediaType, voteAverage]);

  return { ratings, loading };
}
