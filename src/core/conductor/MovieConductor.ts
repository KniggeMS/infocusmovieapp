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

  // ... (alle bestehenden Handler bleiben unverändert – nur List-Handler sind ergänzt/verbessert)

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
      this.updateState({ status: 'error', error: error instanceof Error ? error.message : 'Failed to load list items' });
    }
  }

  // ... restliche Handler (handleLoadMovies, handleSearch etc.) bleiben exakt wie bisher
  private async handleLoadMovies(): Promise<void> { /* unverändert */ }
  private async handleSearch(query: string): Promise<void> { /* unverändert */ }
  private async handleAddMovie(movie: Movie): Promise<void> { /* unverändert */ }
  private async handleRemoveMovie(id: string): Promise<void> { /* unverändert */ }
  private async handleToggleWatched(id: string): Promise<void> { /* unverändert */ }
  private async handleToggleFavorite(id: string): Promise<void> { /* unverändert */ }
  private async handleSelectMovie(id: string): Promise<void> { /* unverändert */ }

  private calculateStatistics(items: Movie[]): MovieStatistics { /* unverändert */ }
  private checkAchievements(items: Movie[]): Achievement[] { /* unverändert */ }

  private updateState(updates: Partial<WatchlistState>): void {
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  private notify(): void {
    const currentState = this.getState();
    this.listeners.forEach(listener => listener(currentState));
  }
}
