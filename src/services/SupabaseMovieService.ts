import { SupabaseClient } from '@supabase/supabase-js';
import { Movie, MovieServiceAdapter, CustomList } from '../types/domain';
import { Database } from '../types/supabase';
import { supabase } from '../lib/supabase';

// Helper Type für exakte DB-Struktur
type MovieRow = Database['public']['Tables']['movies']['Row'];
type MovieInsert = Database['public']['Tables']['movies']['Insert'];

export class SupabaseMovieService implements MovieServiceAdapter {
  private client: SupabaseClient<Database>;

  constructor() {
    this.client = supabase;
  }

  // ... (Previous methods remain unchanged)

  /**
   * Searches for movies AND TV shows using the TMDB API.
   */
  private async searchTMDB(query: string): Promise<Movie[]> {
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    if (!apiKey) {
      console.warn('VITE_TMDB_API_KEY is missing. Skipping TMDB search.');
      return [];
    }

    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=de-DE`
      );

      if (!response.ok) {
        throw new Error(`TMDB API Error: ${response.statusText}`);
      }

      const data = await response.json();
      
      return (data.results || [])
        .filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv')
        .map((result: any) => {
          const isTv = result.media_type === 'tv';
          return {
            id: String(result.id),
            tmdbId: result.id,
            title: isTv ? result.name : result.title,
            overview: result.overview,
            posterPath: result.poster_path 
              ? `https://image.tmdb.org/t/p/w500${result.poster_path}` 
              : null,
            releaseDate: isTv ? result.first_air_date : result.release_date || null,
            runtime: null, 
            voteAverage: result.vote_average || null,
            source: 'tmdb',
            mediaType: result.media_type
          };
        });
    } catch (error) {
      console.error('Error searching TMDB:', error);
      return [];
    }
  }

  /**
   * Maps a raw Supabase database row (snake_case) to the Movie domain object (camelCase).
   */
  private mapRowToMovie(row: MovieRow): Movie {
    const tmdbId = row.tmdb_id ? Number(row.tmdb_id) : undefined;

    return {
      id: row.id.toString(),
      tmdbId: tmdbId,
      title: row.title || 'Unknown Title',
      posterPath: row.poster_path || null,
      runtime: row.runtime ? Number(row.runtime) : null,
      releaseDate: row.release_date || null,
      overview: row.overview || null,
      voteAverage: row.vote_average ? Number(row.vote_average) : null,
      addedAt: row.created_at,
      source: 'database',
      mediaType: (row.media_type as 'movie' | 'tv') || 'movie',
      watched: row.watched ?? false,
      favorite: row.favorite ?? false,
    };
  }

  async getTrending(): Promise<Movie[]> {
    try {
      const { data, error } = await this.client
        .from('movies')
        .select('*')
        .limit(20)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase getTrending error:', error.message);
        return [];
      }

      return (data || []).map((row) => this.mapRowToMovie(row));
    } catch (err) {
      console.error('Unexpected error in getTrending:', err);
      return [];
    }
  }

  /**
   * Searches for movies using the OMDb API as a fallback.
   */
  private async searchOMDb(query: string): Promise<Movie[]> {
    const omdbKey = import.meta.env.VITE_OMDB_API_KEY;
    if (!omdbKey) {
      console.warn('VITE_OMDB_API_KEY is missing. Skipping OMDb fallback.');
      return [];
    }

    try {
      const response = await fetch(
        `https://www.omdbapi.com/?apikey=${omdbKey}&s=${encodeURIComponent(query)}`
      );

      const data = await response.json();
      if (data.Response === 'False' || !data.Search) {
        return [];
      }

      // Resolve matches to TMDB objects
      const promises = data.Search.map((item: any) => this.fetchTMDBByImdbId(item.imdbID));
      const results = await Promise.all(promises);
      
      return results.filter((m): m is Movie => m !== null);

    } catch (error) {
      console.error('Error searching OMDb:', error);
      return [];
    }
  }

  /**
   * Resolves an IMDb ID to a TMDB Movie object using the /find endpoint.
   */
  private async fetchTMDBByImdbId(imdbId: string): Promise<Movie | null> {
    const tmdbKey = import.meta.env.VITE_TMDB_API_KEY;
    if (!tmdbKey) return null;

    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/find/${imdbId}?api_key=${tmdbKey}&external_source=imdb_id`
      );
      
      if (!response.ok) return null;

      const data = await response.json();
      
      // Prioritize TV results if it looks like a show, else movie
      const result = data.tv_results?.[0] || data.movie_results?.[0];

      if (!result) return null;

      const isTv = !!data.tv_results?.[0];

      return {
        id: String(result.id),
        tmdbId: result.id,
        title: isTv ? result.name : result.title,
        overview: result.overview,
        posterPath: result.poster_path 
          ? `https://image.tmdb.org/t/p/w500${result.poster_path}` 
          : null,
        releaseDate: isTv ? result.first_air_date : result.release_date || null,
        runtime: null,
        voteAverage: result.vote_average || null,
        source: 'tmdb',
        mediaType: isTv ? 'tv' : 'movie'
      };
    } catch (error) {
      console.error('Error resolving IMDb ID to TMDB:', error);
      return null;
    }
  }

  async search(query: string): Promise<Movie[]> {
    if (!query || query.trim().length === 0) {
      return this.getTrending();
    }
    
    // 1. Try TMDB Search (Multi)
    const tmdbResults = await this.searchTMDB(query);
    if (tmdbResults.length > 0) {
        return tmdbResults;
    }

    // 2. Fallback to OMDb Search
    console.log('TMDB search yielded no results, trying OMDb fallback...');
    return this.searchOMDb(query);
  }

  private isUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  async getById(id: string): Promise<Movie | null> {
    if (!this.isUUID(id)) return null;
    
    try {
      const { data, error } = await this.client
        .from('movies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.warn('Supabase getById error:', error.message);
        return null;
      }

      return data ? this.mapRowToMovie(data) : null;
    } catch (err) {
      console.error('Unexpected error in getById:', err);
      return null;
    }
  }

  async getMovieDetails(tmdbId: string, mediaType: 'movie' | 'tv' = 'movie'): Promise<Movie> {
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    if (!apiKey) {
        console.warn('TMDB API Key missing!');
        throw new Error('VITE_TMDB_API_KEY missing');
    }

    const endpoint = mediaType === 'tv' ? `tv/${tmdbId}` : `movie/${tmdbId}`;

    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/${endpoint}?api_key=${apiKey}&language=de-DE&append_to_response=credits,watch/providers,recommendations,videos`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ status_message: 'Unknown Error' }));
        throw new Error(`TMDB Error ${response.status}: ${errorData.status_message}`);
      }

      const data = await response.json();
      const isTv = mediaType === 'tv';

      const director = data.credits?.crew?.find((m: any) => m.job === 'Director' || m.job === 'Executive Producer')?.name || 'Unknown';
      
      const cast = (data.credits?.cast || []).slice(0, 5).map((c: any) => ({
        name: c.name,
        character: c.character,
        profilePath: c.profile_path ? `https://image.tmdb.org/t/p/w200${c.profile_path}` : null
      }));

      const trailer = data.videos?.results?.find(
        (v: any) => v.site === 'YouTube' && v.type === 'Trailer'
      );

      const recommendations = (data.recommendations?.results || []).slice(0, 10).map((rec: any) => {
         const recIsTv = rec.media_type === 'tv' || (!rec.title && !!rec.name); 
         return {
            id: String(rec.id),
            tmdbId: rec.id,
            title: recIsTv ? rec.name : rec.title,
            posterPath: rec.poster_path ? `https://image.tmdb.org/t/p/w300${rec.poster_path}` : null,
            releaseDate: recIsTv ? rec.first_air_date : rec.release_date || null,
            voteAverage: rec.vote_average || null,
            source: 'tmdb' as const,
            mediaType: recIsTv ? 'tv' : 'movie' as 'movie' | 'tv'
         };
      });

      const providersRaw = data['watch/providers']?.results?.DE || {};
      const mapProvider = (p: any) => ({
        providerName: p.provider_name,
        logoPath: p.logo_path ? `https://image.tmdb.org/t/p/original${p.logo_path}` : ''
      });

      const watchProviders = {
        flatrate: (providersRaw.flatrate || []).map(mapProvider),
        rent: (providersRaw.rent || []).map(mapProvider),
        buy: (providersRaw.buy || []).map(mapProvider)
      };

      // Runtime logic: TV shows have 'episode_run_time' array, movies have 'runtime' number
      let runtime = data.runtime;
      if (isTv && data.episode_run_time?.length > 0) {
          runtime = data.episode_run_time[0];
      }

      return {
        id: String(data.id),
        tmdbId: data.id,
        title: isTv ? data.name : data.title || 'Unknown Title',
        overview: data.overview || '',
        posterPath: data.poster_path 
          ? `https://image.tmdb.org/t/p/w500${data.poster_path}` 
          : null,
        backdropPath: data.backdrop_path
          ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}`
          : null,
        trailerKey: trailer ? trailer.key : null,
        releaseDate: isTv ? data.first_air_date : data.release_date || null,
        runtime: runtime || null,
        voteAverage: data.vote_average || null,
        source: 'tmdb',
        mediaType: mediaType,
        genres: data.genres?.map((g: any) => g.name) || [],
        director,
        cast,
        recommendations,
        watchProviders
      };
    } catch (error) {
      console.error('Error fetching details:', error);
      throw error;
    }
  }

  async add(movie: Omit<Movie, 'id' | 'addedAt'>): Promise<Movie> {
    const cleanMovie = movie as any;

    const { data: { user } } = await this.client.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const mappedData: MovieInsert = {
      user_id: user.id,
      tmdb_id: cleanMovie.tmdbId,
      title: cleanMovie.title,
      poster_path: cleanMovie.posterPath,
      runtime: cleanMovie.runtime,
      release_date: cleanMovie.releaseDate,
      overview: cleanMovie.overview,
      vote_average: cleanMovie.voteAverage,
      media_type: cleanMovie.mediaType || 'movie' // Persist media type
    };

    const { data, error } = await this.client
      .from('movies')
      .insert(mappedData)
      .select()
      .single();

    if (error) {
      throw new Error(`Supabase add error: ${error.message}`);
    }

    return this.mapRowToMovie(data);
  }

  async delete(id: string): Promise<void> {
    if (!this.isUUID(id)) return;

    const { error } = await this.client
      .from('movies')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Supabase delete error: ${error.message}`);
    }
  }

  async update(id: string, updates: Partial<any>): Promise<void> {
    if (!this.isUUID(id)) return;

    const { error } = await this.client
      .from('movies')
      .update(updates)
      .eq('id', id);

    if (error) {
      throw new Error(`Supabase update error: ${error.message}`);
    }
  }

  async exists(title: string): Promise<boolean> {
    const { data } = await this.client
      .from('movies')
      .select('id')
      .ilike('title', title)
      .limit(1);

    return !!data && data.length > 0;
  }

  // --- List Management ---

  async createList(name: string, description?: string): Promise<CustomList> {
    const { data: { user } } = await this.client.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.client
      .from('custom_lists')
      .insert({ user_id: user.id, name, description })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return {
      id: data.id,
      name: data.name,
      description: data.description || undefined,
      movieCount: 0,
      items: []
    };
  }

  async deleteList(listId: string): Promise<void> {
    const { error } = await this.client.from('custom_lists').delete().eq('id', listId);
    if (error) throw new Error(error.message);
  }

  async getLists(): Promise<CustomList[]> {
    const { data: { user } } = await this.client.auth.getUser();
    if (!user) return [];

    // Fetch lists with count of items. 
    // Using simple approach first to avoid complex joins issues in client
    const { data, error } = await this.client
      .from('custom_lists')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
        console.error('Error fetching lists:', error);
        return [];
    }
    
    // For now returning 0 count, can be enhanced with a separate count query or a view
    return data.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      movieCount: 0, // Placeholder
      items: [] 
    }));
  }

  async addMovieToList(listId: string, movie: Movie): Promise<void> {
    // 1. Ensure movie exists in our DB (if it's from TMDB only)
    let movieId = movie.id;
    if (movie.source === 'tmdb') {
        const { data: { user } } = await this.client.auth.getUser();
        if(!user) throw new Error('User not authenticated');

        // Check if we already have it by TMDB ID
        const { data: existing } = await this.client
            .from('movies')
            .select('id')
            .eq('tmdb_id', movie.tmdbId!)
            .eq('user_id', user.id)
            .maybeSingle();

        if (existing) {
            movieId = existing.id;
        } else {
            // Add to DB first
             const saved = await this.add(movie);
             movieId = saved.id;
        }
    }

    // 2. Link to list
    const { error } = await this.client
        .from('list_items')
        .insert({ list_id: listId, movie_id: movieId });

    if (error && error.code !== '23505') { // Ignore unique violation
        throw new Error(error.message);
    }
  }

  async removeMovieFromList(listId: string, movieId: string): Promise<void> {
    const { error } = await this.client
        .from('list_items')
        .delete()
        .match({ list_id: listId, movie_id: movieId });

    if (error) throw new Error(error.message);
  }
}
}