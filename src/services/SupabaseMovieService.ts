import { SupabaseClient } from '@supabase/supabase-js';
import { Movie, MovieServiceAdapter } from '../types/domain';
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

  /**
   * Searches for movies using the TMDB API.
   */
  private async searchTMDB(query: string): Promise<Movie[]> {
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    if (!apiKey) {
      console.warn('VITE_TMDB_API_KEY is missing. Skipping TMDB search.');
      return [];
    }

    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=de-DE`
      );

      if (!response.ok) {
        throw new Error(`TMDB API Error: ${response.statusText}`);
      }

      const data = await response.json();
      
      return (data.results || []).map((result: any) => ({
        id: String(result.id),
        tmdbId: result.id,
        title: result.title,
        overview: result.overview,
        posterPath: result.poster_path 
          ? `https://image.tmdb.org/t/p/w500${result.poster_path}` 
          : null,
        releaseDate: result.release_date || null,
        runtime: null, // TMDB search doesn't return runtime
        voteAverage: result.vote_average || null,
        source: 'tmdb'
      }));
    } catch (error) {
      console.error('Error searching TMDB:', error);
      return [];
    }
  }

  /**
   * Maps a raw Supabase database row (snake_case) to the Movie domain object (camelCase).
   * STRICTLY TYPED NOW via MovieRow
   */
  private mapRowToMovie(row: MovieRow): Movie {
    // TypeScript kennt jetzt row.tmdb_id
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
      addedAt: row.created_at, // Ist in DB immer string
      source: 'database',
      watched: row.watched ?? false,
      favorite: row.favorite ?? false,
    };
  }

  async getTrending(): Promise<Movie[]> {
    try {
      // "Trending" in this context is the user's recently added movies
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

  async search(query: string): Promise<Movie[]> {
    if (!query || query.trim().length === 0) {
      return this.getTrending();
    }
    
    // Switch to TMDB search for real data
    return this.searchTMDB(query);
  }

  /**
   * Simple UUID validation regex.
   */
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

  async getMovieDetails(tmdbId: string): Promise<Movie> {
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    if (!apiKey) {
        console.warn('TMDB API Key missing!');
        throw new Error('VITE_TMDB_API_KEY missing');
    }

    try {
      // Append credits, watch/providers, recommendations AND videos
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${apiKey}&language=de-DE&append_to_response=credits,watch/providers,recommendations,videos`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ status_message: 'Unknown Error' }));
        throw new Error(`TMDB Error ${response.status}: ${errorData.status_message}`);
      }

      const data = await response.json();
      
      if (!data.id) {
          console.warn('Fetched details missing ID', data);
      }

      const director = data.credits?.crew?.find((m: any) => m.job === 'Director')?.name || 'Unknown';
      const cast = (data.credits?.cast || []).slice(0, 5).map((c: any) => ({
        name: c.name,
        character: c.character,
        profilePath: c.profile_path ? `https://image.tmdb.org/t/p/w200${c.profile_path}` : null
      }));

      // Find Trailer (YouTube)
      const trailer = data.videos?.results?.find(
        (v: any) => v.site === 'YouTube' && v.type === 'Trailer'
      );

      // Map Recommendations
      const recommendations = (data.recommendations?.results || []).slice(0, 10).map((rec: any) => ({
        id: String(rec.id),
        tmdbId: rec.id, // Explicitly set TMDB ID for recommendations
        title: rec.title,
        posterPath: rec.poster_path ? `https://image.tmdb.org/t/p/w300${rec.poster_path}` : null,
        releaseDate: rec.release_date || null,
        voteAverage: rec.vote_average || null,
        source: 'tmdb' as const
      }));

      // Map Watch Providers (DE only)
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

      return {
        id: String(data.id),
        tmdbId: data.id, // Explicitly set TMDB ID
        title: data.title || 'Unknown Title',
        overview: data.overview || '',
        posterPath: data.poster_path 
          ? `https://image.tmdb.org/t/p/w500${data.poster_path}` 
          : null,
        backdropPath: data.backdrop_path
          ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}`
          : null,
        trailerKey: trailer ? trailer.key : null,
        releaseDate: data.release_date || null,
        runtime: data.runtime || null,
        voteAverage: data.vote_average || null,
        source: 'tmdb',
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

    const mappedData: MovieInsert = {
      tmdb_id: cleanMovie.tmdbId,
      title: cleanMovie.title,
      poster_path: cleanMovie.posterPath,
      runtime: cleanMovie.runtime,
      release_date: cleanMovie.releaseDate,
      overview: cleanMovie.overview,
      vote_average: cleanMovie.voteAverage,
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
    if (!this.isUUID(id)) {
        console.warn('Attempted to delete non-UUID movie:', id);
        return;
    }

    const { error } = await this.client
      .from('movies')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Supabase delete error: ${error.message}`);
    }
  }

  async update(id: string, updates: Partial<any>): Promise<void> {
    if (!this.isUUID(id)) {
        console.warn('Attempted to update non-UUID movie:', id);
        return;
    }

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
}