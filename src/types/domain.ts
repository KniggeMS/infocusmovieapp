export interface Movie {
  id: string;
  title: string;
  posterPath: string | null;
  runtime: number | null;
  releaseDate: string | null;
  overview: string | null;
  voteAverage: number | null;
  addedAt?: string;
}

export type UserIntent = 
  | { type: 'LOAD_MOVIES' }
  | { type: 'ADD_MOVIE'; payload: Movie }
  | { type: 'SEARCH'; payload: string }
  | { type: 'REMOVE_MOVIE'; payload: string };

export interface WatchlistState {
  items: Movie[];
  status: 'idle' | 'loading' | 'error';
  error: string | null;
}

export interface MovieServiceAdapter {
  search(query: string): Promise<Movie[]>;
  getById(id: string): Promise<Movie | null>;
  getTrending(): Promise<Movie[]>;
}
