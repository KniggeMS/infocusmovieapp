import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Movie, MovieServiceAdapter } from '../types/domain';

export class SupabaseMovieService implements MovieServiceAdapter {
  private client: SupabaseClient;

  constructor() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    this.client = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Maps a raw Supabase database row (snake_case) to the Movie domain object (camelCase).
   * Robust handling for missing or null fields.
   */
  private mapRowToMovie(row: any): Movie {
    return {
      id: row.id?.toString() || '',
      title: row.title || 'Unknown Title',
      posterPath: row.poster_path || null,
      runtime: row.runtime ? Number(row.runtime) : null,
      releaseDate: row.release_date || null,
      overview: row.overview || null,
      voteAverage: row.vote_average ? Number(row.vote_average) : null,
      addedAt: row.created_at || undefined,
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
    try {
      const { data, error } = await this.client
        .from('movies')
        .select('*')
        .ilike('title', `%${query}%`)
        .limit(20);

      if (error) {
        console.error('Supabase search error:', error.message);
        return [];
      }

      return (data || []).map((row) => this.mapRowToMovie(row));
    } catch (err) {
      console.error('Unexpected error in search:', err);
      return [];
    }
  }

  async getById(id: string): Promise<Movie | null> {
    try {
      const { data, error } = await this.client
        .from('movies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        // Warning usually sufficient for getById not found, no need to spam error console if just not found
        console.warn('Supabase getById error or not found:', error.message);
        return null;
      }

      if (!data) return null;

      return this.mapRowToMovie(data);
    } catch (err) {
      console.error('Unexpected error in getById:', err);
      return null;
    }
  }

  async add(movie: Omit<Movie, 'id' | 'addedAt'>): Promise<Movie> {
    const mappedData = {
      title: movie.title,
      poster_path: movie.posterPath,
      runtime: movie.runtime,
      release_date: movie.releaseDate,
      overview: movie.overview,
      vote_average: movie.voteAverage,
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
    const { error } = await this.client
      .from('movies')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Supabase delete error: ${error.message}`);
    }
  }
}
