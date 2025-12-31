export interface CastMember {
  name: string;
  character: string;
  profilePath: string | null;
}

export interface CrewMember {
  name: string;
  job: string;
}

export interface WatchProvider {
  providerName: string;
  logoPath: string;
}

export interface Movie {
  id: string;
  tmdbId?: number;
  title: string;
  posterPath: string | null;
  runtime: number | null;
  releaseDate: string | null;
  overview: string | null;
  voteAverage: number | null;
  addedAt?: string;
  source?: 'tmdb' | 'database';
  watched?: boolean;
  favorite?: boolean;
  genres?: string[];
  cast?: CastMember[];
  director?: string;
  recommendations?: Movie[];
  watchProviders?: {
    flatrate?: WatchProvider[];
    rent?: WatchProvider[];
    buy?: WatchProvider[];
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: 'Popcorn' | 'Library';
  unlocked: boolean;
}

export interface MovieStatistics {
  totalMovies: number;
  watchedCount: number;
  totalRuntimeMinutes: number;
  favoriteCount: number;
  byGenre: { name: string; value: number }[];
  byDecade: { decade: string; count: number }[];
}

export type UserIntent = 
  | { type: 'LOAD_MOVIES' }
  | { type: 'ADD_MOVIE'; payload: Movie }
  | { type: 'SEARCH'; payload: string }
  | { type: 'REMOVE_MOVIE'; payload: string }
  | { type: 'TOGGLE_WATCHED'; payload: string }
  | { type: 'TOGGLE_FAVORITE'; payload: string }
  | { type: 'SET_FILTER'; payload: 'all' | 'favorites' | 'watched' | 'achievements' | 'statistics' }
  | { type: 'SELECT_MOVIE'; payload: string }
  | { type: 'CLOSE_DETAILS' };

export interface WatchlistState {
  items: Movie[];
  achievements: Achievement[];
  statistics: MovieStatistics;
  selectedMovie: Movie | null;
  status: 'idle' | 'loading' | 'error';
  error: string | null;
  filter: 'all' | 'favorites' | 'watched' | 'achievements' | 'statistics';
}

export interface MovieServiceAdapter {
  search(query: string): Promise<Movie[]>;
  getById(id: string): Promise<Movie | null>;
  getTrending(): Promise<Movie[]>;
  getMovieDetails(tmdbId: string): Promise<Movie>;
  add(movie: Omit<Movie, 'id' | 'addedAt'>): Promise<Movie>;
  delete(id: string): Promise<void>;
  update(id: string, updates: Partial<any>): Promise<void>;
  exists(title: string): Promise<boolean>;
}
