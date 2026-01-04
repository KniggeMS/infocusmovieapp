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
  backdropPath?: string | null; // High-res landscape image
  trailerKey?: string | null; // YouTube Video Key
  runtime?: number | null;
  releaseDate: string | null;
  overview: string | null;
  voteAverage: number | null;
  addedAt?: string;
  source?: 'tmdb' | 'database';
  mediaType?: 'movie' | 'tv';
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

export interface CustomList {
  id: string;
  name: string;
  description?: string;
  movieCount: number; // Computed locally or via count
  items?: string[]; // List of Movie IDs
}

export type UserIntent = 
  | { type: 'LOAD_MOVIES' }
  | { type: 'ADD_MOVIE'; payload: Movie }
  | { type: 'SEARCH'; payload: string }
  | { type: 'REMOVE_MOVIE'; payload: string }
  | { type: 'TOGGLE_WATCHED'; payload: string }
  | { type: 'TOGGLE_FAVORITE'; payload: string }
  | { type: 'SET_FILTER'; payload: 'all' | 'favorites' | 'watched' | 'achievements' | 'statistics' | 'lists' }
  | { type: 'SELECT_MOVIE'; payload: string }
  | { type: 'CLOSE_DETAILS' }
  | { type: 'CREATE_LIST'; payload: { name: string, description?: string } }
  | { type: 'DELETE_LIST'; payload: string }
  | { type: 'ADD_TO_LIST'; payload: { listId: string, movie: Movie } }
  | { type: 'SELECT_LIST'; payload: string }; // listId

export interface WatchlistState {
  items: Movie[];
  customLists: CustomList[];
  achievements: Achievement[];
  statistics: MovieStatistics;
  selectedMovie: Movie | null;
  status: 'idle' | 'loading' | 'error';
  error: string | null;
  filter: 'all' | 'favorites' | 'watched' | 'achievements' | 'statistics' | 'lists' | 'list'; // Added 'list'
  activeListId: string | null; // Added activeListId
}

export interface MovieServiceAdapter {
  search(query: string): Promise<Movie[]>;
  getById(id: string): Promise<Movie | null>;
  getTrending(): Promise<Movie[]>;
  getMovieDetails(tmdbId: string, mediaType?: 'movie' | 'tv'): Promise<Movie>;
  add(movie: Omit<Movie, 'id' | 'addedAt'>): Promise<Movie>;
  delete(id: string): Promise<void>;
  update(id: string, updates: Partial<Movie>): Promise<void>;
  exists(title: string): Promise<boolean>;
  // Lists
  createList(name: string, description?: string): Promise<CustomList>;
  deleteList(listId: string): Promise<void>;
  getLists(): Promise<CustomList[]>;
  getListMovies(listId: string): Promise<Movie[]>; // New method
  addMovieToList(listId: string, movie: Movie): Promise<void>;
  removeMovieFromList(listId: string, movieId: string): Promise<void>;
}
