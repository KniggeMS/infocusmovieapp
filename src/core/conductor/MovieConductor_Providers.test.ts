import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MovieConductor } from './MovieConductor';
import { MovieServiceAdapter, Movie } from '../../types/domain';

// Mock Implementation of the Adapter
const mockAdapter: MovieServiceAdapter = {
  getTrending: vi.fn().mockResolvedValue([]),
  search: vi.fn().mockResolvedValue([]),
  getById: vi.fn().mockResolvedValue(null),
  add: vi.fn(),
  delete: vi.fn(),
  update: vi.fn(),
  exists: vi.fn().mockResolvedValue(false),
  getMovieDetails: vi.fn(),
  createList: vi.fn(),
  deleteList: vi.fn(),
  getLists: vi.fn().mockResolvedValue([]),
  addMovieToList: vi.fn(),
  removeMovieFromList: vi.fn(),
};

describe('MovieConductor - Streaming Providers', () => {
  let conductor: MovieConductor;

  beforeEach(() => {
    vi.clearAllMocks();
    conductor = new MovieConductor(mockAdapter);
  });

  it('should correctly map watch providers when selecting a movie', async () => {
    // 1. Setup Mock Response with Providers
    const mockDetails: Movie = {
        id: '550',
        title: 'Fight Club',
        posterPath: null,
        runtime: 139,
        releaseDate: '1999-10-15',
        overview: 'Soap.',
        voteAverage: 8.4,
        source: 'tmdb',
        watchProviders: {
            flatrate: [
                { providerName: 'Netflix', logoPath: '/netflix.jpg' },
                { providerName: 'Disney Plus', logoPath: '/disney.jpg' }
            ],
            rent: [],
            buy: [
                { providerName: 'Amazon Video', logoPath: '/amazon.jpg' }
            ]
        }
    };
    mockAdapter.getMovieDetails = vi.fn().mockResolvedValue(mockDetails);

    // 2. Action: Select Movie
    await conductor.dispatch({ type: 'SELECT_MOVIE', payload: '550' });

    // 3. Assertions
    const state = conductor.getState();
    const movie = state.selectedMovie;

    expect(movie).not.toBeNull();
    
    // Check Flatrate (Stream)
    expect(movie?.watchProviders?.flatrate).toHaveLength(2);
    expect(movie?.watchProviders?.flatrate?.[0].providerName).toBe('Netflix');
    
    // Check Buy
    expect(movie?.watchProviders?.buy).toHaveLength(1);
    expect(movie?.watchProviders?.buy?.[0].providerName).toBe('Amazon Video');

    // Check Rent (Empty)
    expect(movie?.watchProviders?.rent).toHaveLength(0);
  });
});
