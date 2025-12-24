import { MovieServiceAdapter, UserIntent, WatchlistState } from '../../types/domain';

type Listener = (state: WatchlistState) => void;

export class MovieConductor {
  private adapter: MovieServiceAdapter;
  private listeners: Listener[] = [];
  private state: WatchlistState = {
    items: [],
    status: 'idle',
    error: null,
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
        // Implementation for adding movie will go here
        break;
      case 'REMOVE_MOVIE':
        // Implementation for removing movie will go here
        break;
    }
  }

  /**
   * Handles the search of movies.
   */
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

  /**
   * Handles the loading of movies with strict protection against redundant calls.
   */
  private async handleLoadMovies(): Promise<void> {
    // CRITICAL: LOOP OF DEATH PROTECTION
    // Guard Clause: If we are already loading, ignore this request completely.
    // This prevents infinite loops if a UI component calls dispatch inside a useEffect repeatedly.
    if (this.state.status === 'loading') {
      return;
    }

    this.updateState({ status: 'loading', error: null });

    try {
      const movies = await this.adapter.getTrending();
      this.updateState({ items: movies, status: 'idle' });
    } catch (error) {
      this.updateState({
        status: 'error',
        error: error instanceof Error ? error.message : 'An unknown error occurred during loading',
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
