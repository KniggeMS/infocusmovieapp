import { MovieServiceAdapter, UserIntent, WatchlistState, Movie, Achievement, MovieStatistics } from '../../types/domain';

type Listener = (state: WatchlistState) => void;

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { 
    id: 'first-blood', 
    title: 'First Blood', 
    description: 'Add your first movie to the collection.', 
    iconName: 'Popcorn', 
    unlocked: false 
  },
  { 
    id: 'collector-novice', 
    title: 'Collector Novice', 
    description: 'Collect 5 movies.', 
    iconName: 'Library', 
    unlocked: false 
  },
  { 
    id: 'genre-guru', 
    title: 'Genre Guru', 
    description: 'Collect 10 movies to become a guru.', 
    iconName: 'Library', 
    unlocked: false 
  }
];

const INITIAL_STATISTICS: MovieStatistics = {
  totalMovies: 0,
  watchedCount: 0,
  totalRuntimeMinutes: 0,
  favoriteCount: 0,
  byGenre: [],
  byDecade: []
};

export class MovieConductor {
  private adapter: MovieServiceAdapter;
  private listeners: Listener[] = [];
  private state: WatchlistState = {
    items: [],
    achievements: INITIAL_ACHIEVEMENTS,
    statistics: INITIAL_STATISTICS,
    selectedMovie: null,
    status: 'idle',
    error: null,
    filter: 'all',
  };

  constructor(adapter: MovieServiceAdapter) {
    this.adapter = adapter;
  }


  /**
   * Subscribes to state changes.
   * Returns an unsubscribe function.
   */
  public subscribe(listener: Listener): () => void {
    this.listeners.push(listener);
    // Send current state immediately upon subscription
    listener(this.getState());

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Clears the current state (e.g. on logout).
   */
  public clear(): void {
    this.state = {
      items: [],
      achievements: INITIAL_ACHIEVEMENTS,
      statistics: INITIAL_STATISTICS,
      selectedMovie: null,
      status: 'idle',
      error: null,
      filter: 'all',
    };
    this.notify();
  }

  /**
   * Returns a snapshot of the current state.
   */
  public getState(): WatchlistState {
    // Return a copy to prevent direct mutation
    return { ...this.state };
  }

  /**
   * Processes a user intent/action.
   */
  public async dispatch(intent: UserIntent): Promise<void> {
    switch (intent.type) {
      case 'LOAD_MOVIES':
        await this.handleLoadMovies();
        break;
      case 'SEARCH':
        await this.handleSearch(intent.payload);
        break;
      case 'ADD_MOVIE':
        await this.handleAddMovie(intent.payload);
        break;
      case 'REMOVE_MOVIE':
        await this.handleRemoveMovie(intent.payload);
        break;
      case 'TOGGLE_WATCHED':
        await this.handleToggleWatched(intent.payload);
        break;
      case 'TOGGLE_FAVORITE':
        await this.handleToggleFavorite(intent.payload);
        break;
      case 'SET_FILTER':
        this.updateState({ filter: intent.payload });
        break;
      case 'SELECT_MOVIE':
        await this.handleSelectMovie(intent.payload);
        break;
      case 'CLOSE_DETAILS':
        this.updateState({ selectedMovie: null });
        break;
    }
  }

  /**
   * Toggles the watched status of a movie.
   */
  private async handleToggleWatched(id: string): Promise<void> {
    const movie = this.state.items.find((m) => m.id === id);
    if (!movie) return;

    const oldVal = movie.watched;
    const newVal = !oldVal;

    // Optimistic Update
    const newItems = this.state.items.map((m) => 
      m.id === id ? { ...m, watched: newVal } : m
    );
    this.updateState({ items: newItems });

    try {
      await this.adapter.update(id, { watched: newVal });
    } catch (error) {
      // Rollback
      this.updateState({ 
        items: this.state.items.map((m) => m.id === id ? { ...m, watched: oldVal } : m),
        error: error instanceof Error ? error.message : 'Update failed'
      });
    }
  }

  /**
   * Toggles the favorite status of a movie.
   */
  private async handleToggleFavorite(id: string): Promise<void> {
    const movie = this.state.items.find((m) => m.id === id);
    if (!movie) return;

    const oldVal = movie.favorite;
    const newVal = !oldVal;

    // Optimistic Update
    const newItems = this.state.items.map((m) => 
      m.id === id ? { ...m, favorite: newVal } : m
    );
    this.updateState({ items: newItems });

    try {
      await this.adapter.update(id, { favorite: newVal });
    } catch (error) {
      // Rollback
      this.updateState({ 
        items: this.state.items.map((m) => m.id === id ? { ...m, favorite: oldVal } : m),
        error: error instanceof Error ? error.message : 'Update failed'
      });
    }
  }

  /**
   * Calculates real-time statistics based on the current movie list.
   */
  private calculateStatistics(items: Movie[]): MovieStatistics {
    const stats: MovieStatistics = {
      totalMovies: items.length,
      watchedCount: 0,
      totalRuntimeMinutes: 0,
      favoriteCount: 0,
      byGenre: [],
      byDecade: []
    };

    const genreMap = new Map<string, number>();
    const decadeMap = new Map<string, number>();

    items.forEach(movie => {
      // Basic Counters
      if (movie.watched) stats.watchedCount++;
      if (movie.favorite) stats.favoriteCount++;
      if (movie.runtime) stats.totalRuntimeMinutes += movie.runtime;

      // Genre Grouping
      if (movie.genres && movie.genres.length > 0) {
        // Use the first genre for simplicity as requested, or iterate all if desired.
        // Let's iterate all to be more accurate for charts
        movie.genres.forEach(g => {
             const current = genreMap.get(g) || 0;
             genreMap.set(g, current + 1);
        });
      }

      // Decade Grouping
      if (movie.releaseDate) {
        const year = parseInt(movie.releaseDate.split('-')[0]);
        if (!isNaN(year)) {
          const decade = Math.floor(year / 10) * 10;
          const decadeLabel = `${decade}s`;
          const current = decadeMap.get(decadeLabel) || 0;
          decadeMap.set(decadeLabel, current + 1);
        }
      }
    });

    // Convert Maps to Arrays
    stats.byGenre = Array.from(genreMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value); // Sort by popularity

    stats.byDecade = Array.from(decadeMap.entries())
        .map(([decade, count]) => ({ decade, count }))
        .sort((a, b) => a.decade.localeCompare(b.decade)); // Sort chronologically

    return stats;
  }

  /**
   * Checks and updates achievement status based on current items.
   */
  private checkAchievements(items: Movie[]): Achievement[] {
    const count = items.length;
    return this.state.achievements.map(a => {
      // Rule 1: First Blood (Count >= 1)
      if (a.id === 'first-blood' && count >= 1) return { ...a, unlocked: true };
      // Rule 2: Collector Novice (Count >= 5)
      if (a.id === 'collector-novice' && count >= 5) return { ...a, unlocked: true };
      // Rule 3: Genre Guru (Count >= 10)
      if (a.id === 'genre-guru' && count >= 10) return { ...a, unlocked: true };
      return a;
    });
  }

  /**
   * Handles removing a movie with optimistic updates.
   */
  private async handleRemoveMovie(id: string): Promise<void> {
    // Optimistic Update: Remove item immediately
    const originalItems = this.state.items;
    const newItems = originalItems.filter((movie) => movie.id !== id);
    
    // Update achievements and statistics based on new items
    const newAchievements = this.checkAchievements(newItems);
    const newStats = this.calculateStatistics(newItems);

    this.updateState({ 
        items: newItems, 
        achievements: newAchievements,
        statistics: newStats
    });

    try {
      await this.adapter.delete(id);
      // No further action needed on success
    } catch (error) {
      // Rollback on error
      this.updateState({
        status: 'error',
        error: error instanceof Error ? error.message : 'An unknown error occurred during removal',
        items: originalItems, // Restore items
        // We could also restore achievements/stats here if strict consistency is needed, 
        // but re-fetch happens anyway.
      });
      // Re-fetch to ensure sync with server
      await this.dispatch({ type: 'LOAD_MOVIES' });
    }
  }

  /**
   * Handles adding a new movie.
   */
  private async handleAddMovie(movie: Movie): Promise<void> {
    // Duplicate check
    try {
        const exists = await this.adapter.exists(movie.title);
        if (exists) {
            console.warn(`Movie "${movie.title}" already exists in the database.`);
             this.updateState({ error: `Movie "${movie.title}" already exists!` });
             setTimeout(() => this.updateState({ error: null }), 3000);
            return;
        }
    } catch (e) {
        console.error("Failed to check for duplicates", e);
    }

    this.updateState({ status: 'loading', error: null });

    try {
      // Create a clean object without ID or addedAt, as DB handles these
      const { id, addedAt, ...cleanMovie } = movie;
      const savedMovie = await this.adapter.add(cleanMovie);
      
      const newItems = [savedMovie, ...this.state.items];
      const newAchievements = this.checkAchievements(newItems);
      const newStats = this.calculateStatistics(newItems);

      // Update state: prepend new movie to the list & update achievements/stats
      this.updateState({ 
        items: newItems,
        achievements: newAchievements,
        statistics: newStats,
        status: 'idle' 
      });
    } catch (error) {
      this.updateState({
        status: 'error',
        error: error instanceof Error ? error.message : 'An unknown error occurred during add',
      });
    }
  }

  /**
   * Handles the search of movies.
   */
  private async handleSearch(query: string): Promise<void> {
    this.updateState({ status: 'loading', error: null });

    try {
      const movies = await this.adapter.search(query);
      // Search results are temporary and do NOT affect achievements or statistics of the main collection
      this.updateState({ items: movies, status: 'idle' });
    } catch (error) {
      this.updateState({
        status: 'error',
        error: error instanceof Error ? error.message : 'An unknown error occurred during search',
      });
    }
  }

  /**
   * Handles the loading of movies with strict protection against redundant calls.
   */
  private async handleLoadMovies(): Promise<void> {
    // CRITICAL: LOOP OF DEATH PROTECTION
    if (this.state.status === 'loading') {
      return;
    }

    this.updateState({ status: 'loading', error: null });

    try {
      const movies = await this.adapter.getTrending();
      const newAchievements = this.checkAchievements(movies);
      const newStats = this.calculateStatistics(movies);
      
      this.updateState({ 
          items: movies, 
          achievements: newAchievements, 
          statistics: newStats,
          status: 'idle' 
      });
    } catch (error) {
      this.updateState({
        status: 'error',
        error: error instanceof Error ? error.message : 'An unknown error occurred during loading',
      });
    }
  }

  /**
   * Handles selecting a movie for details view.
   * Handles both database IDs (UUID) and TMDB IDs (stringified numbers).
   */
  private async handleSelectMovie(id: string): Promise<void> {
    // Try to find the movie in current items (Search Results or Watchlist)
    let existingMovie = this.state.items.find(m => m.id === id);
    
    // If not found, check recommendations of currently selected movie
    if (!existingMovie && this.state.selectedMovie?.recommendations) {
        existingMovie = this.state.selectedMovie.recommendations.find(r => r.id === id);
    }
    
    // Resolve the ID needed for the TMDB API call
    // If it's a stored movie, we MUST use its tmdbId (if available).
    // If it's not in the DB (search result or recommendation), the 'id' IS the TMDB ID.
    let tmdbIdForApi: string;

    if (existingMovie && existingMovie.source === 'database') {
        if (existingMovie.tmdbId) {
            tmdbIdForApi = existingMovie.tmdbId.toString();
        } else {
             // It's a DB movie but has no tmdbId saved (legacy data).
             // We cannot fetch details.
             console.warn(`Cannot fetch details for movie ${existingMovie.title}: Missing TMDB ID.`);
             this.updateState({ error: 'Cannot load details for this legacy movie.' });
             return;
        }
    } else {
        // Not in DB (or DB item source='tmdb' which means search result) -> It's a fresh TMDB ID
        tmdbIdForApi = id;
    }

    const mediaType = existingMovie?.mediaType || 'movie';

    this.updateState({ status: 'loading', error: null });

    try {
        const details = await this.adapter.getMovieDetails(tmdbIdForApi, mediaType);
        
        // Use fresh details as base, override with local user flags if available (and it's a DB movie)
        const finalDetails = (existingMovie && existingMovie.source === 'database') ? {
            ...details,
            // Restore DB-specific ID and timestamps
            id: existingMovie.id, 
            addedAt: existingMovie.addedAt,
            // Restore flags
            watched: existingMovie.watched,
            favorite: existingMovie.favorite,
            source: existingMovie.source 
        } : details;

        this.updateState({ selectedMovie: finalDetails, status: 'idle' });
    } catch (error) {
        this.updateState({ 
            status: 'error', 
            error: error instanceof Error ? error.message : 'Could not load details' 
        });
    }
  }

  /**
   * Updates the state and notifies all listeners.
   */
  private updateState(updates: Partial<WatchlistState>): void {
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  /**
   * Notifies all subscribers of the current state.
   */
  private notify(): void {
    const currentState = this.getState();
    this.listeners.forEach((listener) => listener(currentState));
  }
}
