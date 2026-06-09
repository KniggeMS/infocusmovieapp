import { SupabaseClient } from '@supabase/supabase-js';
import { Movie, MovieServiceAdapter, CustomList, EpisodeEntry } from '../types/domain';
import { Database } from '../types/supabase';
import { supabase } from '../lib/supabase';

// Helper Type für exakte DB-Struktur
type MovieRow = Database['public']['Tables']['movies']['Row'];
type MovieInsert = Database['public']['Tables']['movies']['Insert'];
type MovieUpdate = Database['public']['Tables']['movies']['Update'];

export class SupabaseMovieService implements MovieServiceAdapter {
  private client: SupabaseClient<Database>;

  constructor() {
    this.client = supabase;
  }

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
    const anyRow = row as any;

    return {
      id: row.id.toString(),
      tmdbId: tmdbId,
      title: row.title || 'Unknown Title',
      posterPath: row.poster_path || null,
      runtime: row.runtime ? Number(row.runtime) : null,
      releaseDate: row.release_date || null,
      overview: row.overview || null,
      voteAverage: row.vote_average ? Number(row.vote_average) : null,
      addedAt: row.created_at ?? undefined,
      source: 'database',
      mediaType: (row.media_type as 'movie' | 'tv') || 'movie',
      watched: row.watched ?? false,
      watchedAt: row.watched_at ?? null,
      favorite: row.favorite ?? false,
      userRating: anyRow.user_rating ?? null,
      notes: anyRow.notes ?? null,
      tags: Array.isArray(anyRow.tags) ? anyRow.tags : [],
      genres: Array.isArray(anyRow.genres) ? anyRow.genres : undefined,
    };
  }

  async getTrending(): Promise<Movie[]> {
    try {
      const { data, error } = await this.client
        .from('movies')
        .select('*')
        .limit(500)
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
      ) || data.videos?.results?.find(
        (v: any) => v.site === 'YouTube' && v.type === 'Teaser'
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
      media_type: cleanMovie.mediaType || 'movie'
    };
    if (Array.isArray(cleanMovie.genres) && cleanMovie.genres.length > 0) {
      (mappedData as any).genres = cleanMovie.genres;
    }

    const tryInsert = async (payload: MovieInsert) => {
      return await this.client.from('movies').insert(payload).select().single();
    };

    let { data, error } = await tryInsert(mappedData);

    // Tolerate missing optional column "genres" if migration is pending.
    if (error && /genres|column .* does not exist/i.test(error.message || '')) {
      const fallback = { ...mappedData } as any;
      delete fallback.genres;
      ({ data, error } = await tryInsert(fallback));
      if (!error) console.warn('genres column missing, saved without it:', error);
    }

    if (error) {
      throw new Error(`Supabase add error: ${error.message}`);
    }

    return this.mapRowToMovie(data!);
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

  async update(id: string, updates: Partial<Movie>): Promise<void> {
    if (!this.isUUID(id)) return;

    const dbUpdate: Record<string, unknown> = {};
    if (updates.watched !== undefined) dbUpdate.watched = updates.watched;
    if (updates.watchedAt !== undefined) dbUpdate.watched_at = updates.watchedAt;
    if (updates.favorite !== undefined) dbUpdate.favorite = updates.favorite;
    if (updates.title !== undefined) dbUpdate.title = updates.title;
    if (updates.overview !== undefined) dbUpdate.overview = updates.overview;
    if (updates.voteAverage !== undefined) dbUpdate.vote_average = updates.voteAverage;
    if (updates.posterPath !== undefined) dbUpdate.poster_path = updates.posterPath;
    if (updates.userRating !== undefined) dbUpdate.user_rating = updates.userRating;
    if (updates.notes !== undefined) dbUpdate.notes = updates.notes;
    if (updates.tags !== undefined) dbUpdate.tags = updates.tags;

    if (Object.keys(dbUpdate).length === 0) return;

    const { error } = await this.client
      .from('movies')
      .update(dbUpdate as MovieUpdate)
      .eq('id', id);

    if (error) {
      const msg = error.message || '';
      // Tolerate missing optional columns (no migration applied yet).
      if (/column .* does not exist|user_rating|notes|tags/i.test(msg)) {
        const safeUpdate: Record<string, unknown> = { ...dbUpdate };
        delete safeUpdate.user_rating;
        delete safeUpdate.notes;
        delete safeUpdate.tags;
        if (Object.keys(safeUpdate).length === 0) {
          console.warn('Skipping update — only optional columns were requested but column is missing:', msg);
          return;
        }
        const retry = await this.client
          .from('movies')
          .update(safeUpdate as MovieUpdate)
          .eq('id', id);
        if (retry.error) throw new Error(`Supabase update error: ${retry.error.message}`);
        console.warn('Optional columns missing, persisted core fields only:', msg);
        return;
      }
      throw new Error(`Supabase update error: ${msg}`);
    }
  }

  async exists(movie: { title: string; tmdbId?: number }): Promise<boolean> {
    // Prefer TMDB ID check for accuracy
    if (movie.tmdbId) {
      const { data } = await this.client
        .from('movies')
        .select('id')
        .eq('tmdb_id', movie.tmdbId)
        .limit(1);
      return !!data && data.length > 0;
    }

    // Fallback: exact title match (case-sensitive)
    const { data } = await this.client
      .from('movies')
      .select('id')
      .eq('title', movie.title)
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

    const { data, error } = await this.client
      .from('custom_lists')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
        console.error('Error fetching lists:', error);
        return [];
    }

    const { data: itemData, error: itemError } = await this.client
      .from('list_items')
      .select('list_id, id');

    if (itemError) {
      console.warn('Could not fetch list item counts:', itemError);
    }

    const itemCountMap = new Map<string, number>();
    const itemIdsMap = new Map<string, string[]>();
    if (itemData) {
      for (const item of itemData) {
        const lid = item.list_id;
        itemCountMap.set(lid, (itemCountMap.get(lid) || 0) + 1);
        if (!itemIdsMap.has(lid)) itemIdsMap.set(lid, []);
        itemIdsMap.get(lid)!.push(item.id);
      }
    }
    
    return data.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      movieCount: itemCountMap.get(row.id) || 0,
      items: itemIdsMap.get(row.id) || [], 
    }));
  }

  async getListMovies(listId: string): Promise<Movie[]> {
    const { data, error } = await this.client
      .from('list_items')
      .select('*')
      .eq('list_id', listId);

    if (error) throw new Error(error.message);

    const movies: Movie[] = [];
    for (const item of data) {
      const tmdbId = item.tmdb_movie_id;
      let movie: Movie | null = null;

      if (tmdbId) {
        const { data: existing } = await this.client
          .from('movies')
          .select('*')
          .eq('tmdb_id', tmdbId)
          .maybeSingle();

        if (existing) {
          const row = existing as any;
          movie = {
            id: row.id,
            title: row.title,
            overview: row.overview,
            posterPath: row.poster_path,
            releaseDate: row.release_date,
            voteAverage: row.vote_average ? Number(row.vote_average) : null,
            runtime: row.runtime,
            mediaType: row.media_type || item.media_type || 'movie',
            tmdbId: row.tmdb_id,
            watched: row.watched ?? false,
            favorite: row.favorite ?? false,
            source: 'database',
      addedAt: row.created_at ?? undefined,
            userRating: row.user_rating ?? null,
            notes: row.notes ?? null,
            tags: Array.isArray(row.tags) ? row.tags : [],
            genres: Array.isArray(row.genres) ? row.genres : undefined,
          };
        }
      }

      if (!movie) {
        movie = {
          id: item.id,
          title: item.movie_title,
          posterPath: item.movie_poster_path || null,
          releaseDate: item.movie_year ? `${item.movie_year}-01-01` : null,
          mediaType: item.media_type as 'movie' | 'tv' || 'movie',
          tmdbId: tmdbId || undefined,
          source: 'database',
          watched: false,
          favorite: false,
          overview: null,
          voteAverage: null,
          runtime: null,
        };
      }

      movies.push(movie);
    }

    return movies;
  }

  async addMovieToList(listId: string, movie: Movie): Promise<void> {
    // TMDB-ID ermitteln: tmdbId-Feld oder aus id ableiten
    let tmdbId = movie.tmdbId ?? (movie.source === 'tmdb' ? Number(movie.id) || 0 : 0);

    // Fallback: Generiere eine numerische ID aus der internen UUID
    // (für Filme ohne TMDB-ID, z.B. manuell angelegte Einträge)
    if (!tmdbId) {
      const hex = movie.id.replace(/-/g, '').slice(0, 12);
      tmdbId = parseInt(hex, 16) % 2147483647;
    }

    // Prüfen ob Film bereits in der Liste ist
    const { data: existing } = await this.client
      .from('list_items')
      .select('id')
      .eq('list_id', listId)
      .eq('tmdb_movie_id', tmdbId)
      .limit(1);

    if (existing && existing.length > 0) {
      throw new Error(`Movie "${movie.title}" is already in this list`);
    }

    const { error } = await this.client
      .from('list_items')
      .insert({
        list_id: listId,
        tmdb_movie_id: tmdbId,
        movie_title: movie.title,
        media_type: movie.mediaType || 'movie',
        movie_poster_path: movie.posterPath || null,
        movie_year: movie.releaseDate?.split('-')[0] || null,
      } as any);

    if (error) {
      if (error.code === '23505') {
        throw new Error(`Movie "${movie.title}" is already in this list`);
      }
      throw new Error(error.message);
    }
  }

  async removeMovieFromList(listId: string, movieId: string): Promise<void> {
    const numId = parseInt(movieId, 10);
    if (isNaN(numId)) return;
    const { error } = await this.client
      .from('list_items')
      .delete()
      .eq('list_id', listId)
      .eq('tmdb_movie_id', numId);

    if (error) throw new Error(error.message);
  }

  // ─── TV Episode Progress ──────────────────────────────────

  async saveEpisodeProgress(episodes: EpisodeEntry[]): Promise<void> {
    const { data: { user } } = await this.client.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Upsert each episode: delete existing then insert
    for (const ep of episodes) {
      // Delete existing entry for this show/season/episode
      await this.client
        .from('tv_progress')
        .delete()
        .eq('user_id', user.id)
        .eq('tmdb_id', ep.tmdbId)
        .eq('season_number', ep.seasonNumber)
        .eq('episode_number', ep.episodeNumber);

      // Insert current state
      const { error } = await this.client
        .from('tv_progress')
        .insert({
          user_id: user.id,
          tmdb_id: ep.tmdbId,
          season_number: ep.seasonNumber,
          episode_number: ep.episodeNumber,
          title: ep.title,
          watched: ep.watched,
          watched_at: ep.watchedAt,
        } as any);

      if (error) {
        console.warn('saveEpisodeProgress insert error:', error.message);
      }
    }
  }

  async loadEpisodeProgress(): Promise<EpisodeEntry[]> {
    const { data: { user } } = await this.client.auth.getUser();
    if (!user) return [];

    const { data, error } = await this.client
      .from('tv_progress')
      .select('*')
      .eq('user_id', user.id) as any;

    if (error) {
      console.warn('loadEpisodeProgress error:', error.message);
      return [];
    }

    return (data || []).map((row: any) => ({
      tmdbId: row.tmdb_id,
      title: row.title,
      seasonNumber: row.season_number,
      episodeNumber: row.episode_number,
      watched: row.watched ?? false,
      watchedAt: row.watched_at,
    }));
  }

  // ─── Diary Entries ──────────────────────────────────────

  async saveDiaryEntry(entry: Movie): Promise<void> {
    const { data: { user } } = await this.client.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const tmdbId = entry.tmdbId ?? (entry.source === 'tmdb' ? Number(entry.id) : 0);
    if (!tmdbId) return;

    const { error } = await this.client
      .from('diary_entries')
      .insert({
        user_id: user.id,
        tmdb_movie_id: tmdbId,
        movie_title: entry.title,
        media_type: entry.mediaType || 'movie',
        movie_poster_path: entry.posterPath,
        movie_year: entry.releaseDate?.split('-')[0] || null,
        watched_on: entry.watchedAt || new Date().toISOString(),
        rating: entry.userRating,
      } as any);

    if (error) {
      console.warn('saveDiaryEntry error:', error.message);
    }
  }

  async getDiaryEntries(): Promise<Movie[]> {
    const { data: { user } } = await this.client.auth.getUser();
    if (!user) return [];

    const { data, error } = await this.client
      .from('diary_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('watched_on', { ascending: false })
      .limit(200) as any;

    if (error) {
      console.warn('getDiaryEntries error:', error.message);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      tmdbId: row.tmdb_movie_id,
      title: row.movie_title,
      posterPath: row.movie_poster_path,
      releaseDate: row.movie_year ? `${row.movie_year}-01-01` : null,
      mediaType: row.media_type || 'movie',
      source: 'database' as const,
      watched: true,
      watchedAt: row.watched_on,
      userRating: row.rating,
      overview: null,
      voteAverage: null,
      runtime: null,
    }));
  }
}
