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
    customLists: [],
    achievements: INITIAL_ACHIEVEMENTS,
    statistics: INITIAL_STATISTICS,
    selectedMovie: null,
            status: 'idle',
            error: null,
            filter: 'all',
            activeListId: null,
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
      customLists: [],
      achievements: INITIAL_ACHIEVEMENTS,
      statistics: INITIAL_STATISTICS,
      selectedMovie: null,
              status: 'idle',
              error: null,
              filter: 'all',
              activeListId: null,
            };    this.notify();
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
        this.updateState({ filter: intent.payload, activeListId: null });
        break;
      case 'SELECT_MOVIE':
        await this.handleSelectMovie(intent.payload);
        break;
      case 'CLOSE_DETAILS':
        this.updateState({ selectedMovie: null });
        break;
      // List Management
      case 'CREATE_LIST':
        await this.handleCreateList(intent.payload);
        break;
      case 'DELETE_LIST':
        await this.handleDeleteList(intent.payload);
        break;
      case 'ADD_TO_LIST':
        await this.handleAddMovieToList(intent.payload.listId, intent.payload.movie);
        break;
      case 'SELECT_LIST':
        await this.handleSelectList(intent.payload);
        break;
    }
  }

  // --- Core Handlers ---

  private async handleLoadMovies(): Promise<void> {
    // CRITICAL: LOOP OF DEATH PROTECTION
    if (this.state.status === 'loading') {
      return;
    }

    this.updateState({ status: 'loading', error: null });

    try {
      // Parallel loading of movies and lists
      const [movies, lists] = await Promise.all([
        this.adapter.getTrending(),
        this.adapter.getLists()
      ]);

      console.log(`Conductor: Loaded ${movies.length} movies and ${lists.length} lists.`);
      const newAchievements = this.checkAchievements(movies);
      const newStats = this.calculateStatistics(movies);
      
      this.updateState({ 
          items: movies, 
          customLists: lists,
          achievements: newAchievements, 
          statistics: newStats,
          status: 'idle',
          activeListId: null 
      });
    } catch (error) {
      this.updateState({
        status: 'error',
        error: error instanceof Error ? error.message : 'An unknown error occurred during loading',
      });
    }
  }

  private async handleSearch(query: string): Promise<void> {
    this.updateState({ status: 'loading', error: null });

    try {
      const movies = await this.adapter.search(query);
      this.updateState({ items: movies, status: 'idle' });
    } catch (error) {
      this.updateState({
        status: 'error',
        error: error instanceof Error ? error.message : 'An unknown error occurred during search',
      });
    }
  }

  private async handleAddMovie(movie: Movie): Promise<void> {
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
      const { id, addedAt, ...cleanMovie } = movie;
      const savedMovie = await this.adapter.add(cleanMovie);
      
      const newItems = [savedMovie, ...this.state.items];
      const newAchievements = this.checkAchievements(newItems);
      const newStats = this.calculateStatistics(newItems);

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

  private async handleRemoveMovie(id: string): Promise<void> {
    const originalItems = this.state.items;
    const newItems = originalItems.filter((movie) => movie.id !== id);
    
    const newAchievements = this.checkAchievements(newItems);
    const newStats = this.calculateStatistics(newItems);

    this.updateState({ 
        items: newItems, 
        achievements: newAchievements,
        statistics: newStats
    });

    try {
      await this.adapter.delete(id);
    } catch (error) {
      this.updateState({
        status: 'error',
        error: error instanceof Error ? error.message : 'An unknown error occurred during removal',
        items: originalItems,
      });
      await this.dispatch({ type: 'LOAD_MOVIES' });
    }
  }

  private async handleToggleWatched(id: string): Promise<void> {
    const movie = this.state.items.find((m) => m.id === id);
    if (!movie) return;

    const oldVal = movie.watched;
    const newVal = !oldVal;

    const newItems = this.state.items.map((m) => 
      m.id === id ? { ...m, watched: newVal } : m
    );
    this.updateState({ items: newItems });

    try {
      await this.adapter.update(id, { watched: newVal });
    } catch (error) {
      this.updateState({ 
        items: this.state.items.map((m) => m.id === id ? { ...m, watched: oldVal } : m),
        error: error instanceof Error ? error.message : 'Update failed'
      });
    }
  }

  private async handleToggleFavorite(id: string): Promise<void> {
    const movie = this.state.items.find((m) => m.id === id);
    if (!movie) return;

    const oldVal = movie.favorite;
    const newVal = !oldVal;

    const newItems = this.state.items.map((m) => 
      m.id === id ? { ...m, favorite: newVal } : m
    );
    this.updateState({ items: newItems });

    try {
      await this.adapter.update(id, { favorite: newVal });
    } catch (error) {
      this.updateState({ 
        items: this.state.items.map((m) => m.id === id ? { ...m, favorite: oldVal } : m),
        error: error instanceof Error ? error.message : 'Update failed'
      });
    }
  }

  // --- List Handlers ---

  private async handleCreateList(payload: { name: string, description?: string }): Promise<void> {
    try {
      const newList = await this.adapter.createList(payload.name, payload.description);
      this.updateState({ customLists: [...this.state.customLists, newList] });
    } catch (error) {
       this.updateState({ error: error instanceof Error ? error.message : 'Failed to create list' });
    }
  }

  private async handleDeleteList(listId: string): Promise<void> {
    const oldLists = this.state.customLists;
    this.updateState({ customLists: oldLists.filter(l => l.id !== listId) });

    try {
      await this.adapter.deleteList(listId);
    } catch (error) {
       this.updateState({ 
         customLists: oldLists, 
         error: error instanceof Error ? error.message : 'Failed to delete list' 
       });
    }
  }

  private async handleAddMovieToList(listId: string, movie: Movie): Promise<void> {
    try {
      await this.adapter.addMovieToList(listId, movie);
      // Optimistic update of count
      const updatedLists = this.state.customLists.map(l => 
        l.id === listId ? { ...l, movieCount: l.movieCount + 1 } : l
      );
      this.updateState({ customLists: updatedLists });
    } catch (error) {
      this.updateState({ error: error instanceof Error ? error.message : 'Failed to add to list' });
    }
  }

  private async handleSelectList(listId: string): Promise<void> {
    this.updateState({ status: 'loading', error: null, filter: 'list', activeListId: listId });
    
    try {
        const movies = await this.adapter.getListMovies(listId);
        this.updateState({ items: movies, status: 'idle' });
    } catch (error) {
        this.updateState({ 
            status: 'error', 
            error: error instanceof Error ? error.message : 'Failed to load list items' 
        });
    }
  }

  private async handleSelectMovie(id: string): Promise<void> {
    let existingMovie = this.state.items.find(m => m.id === id);
    
    if (!existingMovie && this.state.selectedMovie?.recommendations) {
        existingMovie = this.state.selectedMovie.recommendations.find(r => r.id === id);
    }
    
    let tmdbIdForApi: string;

    if (existingMovie && existingMovie.source === 'database') {
        if (existingMovie.tmdbId) {
            tmdbIdForApi = existingMovie.tmdbId.toString();
        } else {
             console.warn(`Cannot fetch details for movie ${existingMovie.title}: Missing TMDB ID.`);
             this.updateState({ error: 'Cannot load details for this legacy movie.' });
             return;
        }
    } else {
        tmdbIdForApi = id;
    }

    const mediaType = existingMovie?.mediaType || 'movie';

    this.updateState({ status: 'loading', error: null });

    try {
        const details = await this.adapter.getMovieDetails(tmdbIdForApi, mediaType);
        
        const finalDetails = (existingMovie && existingMovie.source === 'database') ? {
            ...details,
            id: existingMovie.id, 
            addedAt: existingMovie.addedAt,
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

  // --- Helper ---

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
      if (movie.watched) stats.watchedCount++;
      if (movie.favorite) stats.favoriteCount++;
      if (movie.runtime) stats.totalRuntimeMinutes += movie.runtime;

      if (movie.genres) {
        movie.genres.forEach(g => {
             const current = genreMap.get(g) || 0;
             genreMap.set(g, current + 1);
        });
      }

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

    stats.byGenre = Array.from(genreMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    stats.byDecade = Array.from(decadeMap.entries())
        .map(([decade, count]) => ({ decade, count }))
        .sort((a, b) => a.decade.localeCompare(b.decade));

    return stats;
  }

  private checkAchievements(items: Movie[]): Achievement[] {
    const count = items.length;
    return this.state.achievements.map(a => {
      if (a.id === 'first-blood' && count >= 1) return { ...a, unlocked: true };
      if (a.id === 'collector-novice' && count >= 5) return { ...a, unlocked: true };
      if (a.id === 'genre-guru' && count >= 10) return { ...a, unlocked: true };
      return a;
    });
  }

  private updateState(updates: Partial<WatchlistState>): void {
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  private notify(): void {
    const currentState = this.getState();
    this.listeners.forEach((listener) => listener(currentState));
  }
}