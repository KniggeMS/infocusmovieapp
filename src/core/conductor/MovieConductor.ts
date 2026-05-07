import { MovieServiceAdapter, UserIntent, WatchlistState, Movie, Achievement, MovieStatistics, CustomList } from '../../types/domain';

type Listener = (state: WatchlistState) => void;

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first-blood', title: 'First Blood', description: 'Add your first movie to the collection.', iconName: 'Popcorn', unlocked: false },
  { id: 'collector-novice', title: 'Collector Novice', description: 'Collect 5 movies.', iconName: 'Library', unlocked: false },
  { id: 'genre-guru', title: 'Genre Guru', description: 'Collect 10 movies to become a guru.', iconName: 'Library', unlocked: false }
];

const INITIAL_STATISTICS: MovieStatistics = {
  totalMovies: 0, watchedCount: 0, totalRuntimeMinutes: 0, favoriteCount: 0, byGenre: [], byDecade: []
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

  public subscribe(listener: Listener): () => void {
    this.listeners.push(listener);
    listener(this.getState());
    return () => { this.listeners = this.listeners.filter((l) => l !== listener); };
  }

  public clear(): void {
    this.state = { ...this.state, items: [], customLists: [], achievements: INITIAL_ACHIEVEMENTS, statistics: INITIAL_STATISTICS, selectedMovie: null, activeListId: null };
    this.notify();
  }

  public getState(): WatchlistState {
    return { ...this.state };
  }

  public async dispatch(intent: UserIntent): Promise<void> {
    switch (intent.type) {
      case 'LOAD_MOVIES': await this.handleLoadMovies(); break;
      case 'SEARCH': await this.handleSearch(intent.payload); break;
      case 'ADD_MOVIE': await this.handleAddMovie(intent.payload); break;
      case 'REMOVE_MOVIE': await this.handleRemoveMovie(intent.payload); break;
      case 'TOGGLE_WATCHED': await this.handleToggleWatched(intent.payload); break;
      case 'TOGGLE_FAVORITE': await this.handleToggleFavorite(intent.payload); break;
      case 'SET_FILTER': this.updateState({ filter: intent.payload, activeListId: null }); break;
      case 'SELECT_MOVIE': await this.handleSelectMovie(intent.payload); break;
      case 'CLOSE_DETAILS': this.updateState({ selectedMovie: null }); break;
      case 'CREATE_LIST': await this.handleCreateList(intent.payload); break;
      case 'DELETE_LIST': await this.handleDeleteList(intent.payload); break;
      case 'ADD_TO_LIST': await this.handleAddMovieToList(intent.payload.listId, intent.payload.movie); break;
      case 'SELECT_LIST': await this.handleSelectList(intent.payload); break;
    }
  }

  // ==================== LIST HANDLER ====================
  private async handleCreateList(payload: { name: string; description?: string }): Promise<void> {
    try {
      const newList = await this.adapter.createList(payload.name, payload.description);
      this.updateState({ customLists: [...this.state.customLists, newList] });
    } catch (error) {
      this.updateState({ error: error instanceof Error ? error.message : 'Failed to create list' });
    }
  }

  private async handleDeleteList(listId: string): Promise<void> {
    const oldLists = [...this.state.customLists];
    this.updateState({ customLists: oldLists.filter(l => l.id !== listId) });
    try {
      await this.adapter.deleteList(listId);
    } catch (error) {
      this.updateState({ customLists: oldLists, error: error instanceof Error ? error.message : 'Failed to delete list' });
    }
  }

  private async handleAddMovieToList(listId: string, movie: Movie): Promise<void> {
    try {
      await this.adapter.addMovieToList(listId, movie);
      const updatedLists = this.state.customLists.map(l =>
        l.id === listId ? { ...l, movieCount: (l.movieCount || 0) + 1 } : l
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
      this.updateState({ status: 'error', error: error instanceof Error ? error.message : 'Failed to load list items' });
    }
  }

  // ==================== ORIGINAL HANDLER (rekonstruiert) ====================
  private async handleLoadMovies(): Promise<void> {
    this.updateState({ status: 'loading' });
    try {
      const lists = await this.adapter.getLists();
      const movies = await this.adapter.getTrending(); // oder eine echte Load-Methode
      this.updateState({ 
        items: movies, 
        customLists: lists,
        status: 'idle',
        statistics: this.calculateStatistics(movies),
        achievements: this.checkAchievements(movies)
      });
    } catch (error) {
      this.updateState({ status: 'error', error: error instanceof Error ? error.message : 'Load failed' });
    }
  }

  private async handleSearch(query: string): Promise<void> {
    this.updateState({ status: 'loading' });
    try {
      const results = await this.adapter.search(query);
      this.updateState({ items: results, status: 'idle' });
    } catch (error) {
      this.updateState({ status: 'error', error: error instanceof Error ? error.message : 'Search failed' });
    }
  }

  private async handleAddMovie(movie: Movie): Promise<void> {
    try {
      const added = await this.adapter.add(movie);
      this.updateState({ items: [added, ...this.state.items] });
    } catch (error) {
      this.updateState({ error: error instanceof Error ? error.message : 'Add failed' });
    }
  }

  private async handleRemoveMovie(id: string): Promise<void> {
    try {
      await this.adapter.delete(id);
      this.updateState({ items: this.state.items.filter(m => m.id !== id) });
    } catch (error) {
      this.updateState({ error: error instanceof Error ? error.message : 'Remove failed' });
    }
  }

  private async handleToggleWatched(id: string): Promise<void> {
    const movie = this.state.items.find(m => m.id === id);
    if (!movie) return;
    try {
      await this.adapter.update(id, { watched: !movie.watched });
      const updated = this.state.items.map(m => m.id === id ? { ...m, watched: !m.watched } : m);
      this.updateState({ items: updated });
    } catch (error) {
      this.updateState({ error: error instanceof Error ? error.message : 'Toggle watched failed' });
    }
  }

  private async handleToggleFavorite(id: string): Promise<void> {
    const movie = this.state.items.find(m => m.id === id);
    if (!movie) return;
    try {
      await this.adapter.update(id, { favorite: !movie.favorite });
      const updated = this.state.items.map(m => m.id === id ? { ...m, favorite: !m.favorite } : m);
      this.updateState({ items: updated });
    } catch (error) {
      this.updateState({ error: error instanceof Error ? error.message : 'Toggle favorite failed' });
    }
  }

  private async handleSelectMovie(id: string): Promise<void> {
    try {
      const details = await this.adapter.getById(id) || this.state.items.find(m => m.id === id);
      this.updateState({ selectedMovie: details || null });
    } catch (error) {
      this.updateState({ error: error instanceof Error ? error.message : 'Select failed' });
    }
  }

  private calculateStatistics(items: Movie[]): MovieStatistics {
    // Einfache Implementierung – erweitere bei Bedarf
    return {
      totalMovies: items.length,
      watchedCount: items.filter(m => m.watched).length,
      totalRuntimeMinutes: items.reduce((sum, m) => sum + (m.runtime || 0), 0),
      favoriteCount: items.filter(m => m.favorite).length,
      byGenre: [],
      byDecade: []
    };
  }

  private checkAchievements(items: Movie[]): Achievement[] {
    return INITIAL_ACHIEVEMENTS.map(a => ({ ...a, unlocked: items.length >= 1 })); // Dummy-Logik
  }

  private updateState(updates: Partial<WatchlistState>): void {
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  private notify(): void {
    const currentState = this.getState();
    this.listeners.forEach(listener => listener(currentState));
  }
}
