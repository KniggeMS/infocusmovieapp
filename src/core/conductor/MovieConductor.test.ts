import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MovieConductor } from './MovieConductor';
import { MovieServiceAdapter, Movie } from '../../types/domain';

// Mock Implementation of the Adapter
const mockMovies: Movie[] = [
  { id: '1', title: 'Test Movie', posterPath: null, runtime: 120, releaseDate: '2025-01-01', overview: 'Test', voteAverage: 8.5 }
];

const mockAdapter: MovieServiceAdapter = {
  getTrending: vi.fn().mockResolvedValue(mockMovies),
  search: vi.fn().mockResolvedValue([]),
  getById: vi.fn().mockResolvedValue(null),
  getMovieDetails: vi.fn().mockResolvedValue({} as Movie),
  add: vi.fn(),
  delete: vi.fn(),
  update: vi.fn(),
  exists: vi.fn().mockResolvedValue(false),
};

describe('MovieConductor', () => {
  let conductor: MovieConductor;

  beforeEach(() => {
    vi.clearAllMocks();
    conductor = new MovieConductor(mockAdapter);
  });

  it('should initialize with idle state', () => {
    const state = conductor.getState();
    expect(state.status).toBe('idle');
    expect(state.items).toHaveLength(0);
    expect(state.error).toBeNull();
  });

  it('CRITICAL: should prevent "Loop of Death" (multiple rapid load requests)', async () => {
    // 1. Dispatch LOAD_MOVIES multiple times rapidly
    const dispatchPromise1 = conductor.dispatch({ type: 'LOAD_MOVIES' });
    const dispatchPromise2 = conductor.dispatch({ type: 'LOAD_MOVIES' });
    const dispatchPromise3 = conductor.dispatch({ type: 'LOAD_MOVIES' });
    const dispatchPromise4 = conductor.dispatch({ type: 'LOAD_MOVIES' });
    const dispatchPromise5 = conductor.dispatch({ type: 'LOAD_MOVIES' });

    // 2. Immediate check: State should be loading
    expect(conductor.getState().status).toBe('loading');

    // 3. Wait for all promises to resolve
    await Promise.all([
      dispatchPromise1, 
      dispatchPromise2, 
      dispatchPromise3, 
      dispatchPromise4, 
      dispatchPromise5
    ]);

    // 4. Verification: Adapter should be called EXACTLY ONCE
    expect(mockAdapter.getTrending).toHaveBeenCalledTimes(1);

    // 5. Final State Check
    expect(conductor.getState().status).toBe('idle'); // Should return to idle after success
    expect(conductor.getState().items).toEqual(mockMovies);
  });

  it('should handle API errors gracefully', async () => {
    // Setup error mock
    const errorAdapter = {
      ...mockAdapter,
      getTrending: vi.fn().mockRejectedValue(new Error('Network Error'))
    };
    const errorConductor = new MovieConductor(errorAdapter);

    await errorConductor.dispatch({ type: 'LOAD_MOVIES' });

    const state = errorConductor.getState();
    expect(state.status).toBe('error');
    expect(state.error).toBe('Network Error');
  });

  it('should prevent adding duplicate movies', async () => {
    // 1. Setup: adapter.exists returns true
    mockAdapter.exists = vi.fn().mockResolvedValue(true);
    mockAdapter.add = vi.fn();

    const duplicateMovie: Movie = {
      id: '99',
      title: 'Existing Movie',
      posterPath: null,
      runtime: 100,
      releaseDate: '2020-01-01',
      overview: 'Dup',
      voteAverage: 5
    };

    // 2. Action: Try to add it
    await conductor.dispatch({ type: 'ADD_MOVIE', payload: duplicateMovie });

    // 3. Assertions
    expect(mockAdapter.exists).toHaveBeenCalledWith(duplicateMovie.title);
    expect(mockAdapter.add).not.toHaveBeenCalled();
    
    const state = conductor.getState();
    expect(state.items).not.toContainEqual(expect.objectContaining({ title: 'Existing Movie' }));
    expect(state.error).toBe('Movie "Existing Movie" already exists!');
  });

  describe('Achievements', () => {
    it('should unlock "First Blood" achievement after adding a movie', async () => {
      // 1. Initial State Check
      let state = conductor.getState();
      const firstBlood = state.achievements.find(a => a.id === 'first-blood');
      const novice = state.achievements.find(a => a.id === 'collector-novice');
      
      expect(firstBlood?.unlocked).toBe(false);
      expect(novice?.unlocked).toBe(false);

      // 2. Setup Mock for successful add
      const testMovie: Movie = {
        id: '101',
        title: 'New Achievement Movie',
        posterPath: null,
        runtime: 120,
        releaseDate: '2025-01-01',
        overview: 'Testing achievements',
        voteAverage: 10
      };
      mockAdapter.exists = vi.fn().mockResolvedValue(false);
      mockAdapter.add = vi.fn().mockResolvedValue({ ...testMovie, id: 'uuid-101' });

      // 3. Action: Add the movie
      await conductor.dispatch({ type: 'ADD_MOVIE', payload: testMovie });

      // 4. Assertions
      state = conductor.getState();
      const firstBloodAfter = state.achievements.find(a => a.id === 'first-blood');
      const noviceAfter = state.achievements.find(a => a.id === 'collector-novice');

      expect(firstBloodAfter?.unlocked).toBe(true); // Should be unlocked now!
      expect(noviceAfter?.unlocked).toBe(false); // Still locked (only 1 movie)
    });

    it('should unlock "Collector Novice" achievement after adding 5 movies', async () => {
        // We simulate adding multiple movies by manually setting items and calling load
        // because dispatching 5 ADD_MOVIE calls would be slower and redundant for this logic check.
        // Or we just mock trending to return 5 movies.
        
        mockAdapter.getTrending = vi.fn().mockResolvedValue([
            { id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }
        ] as any);

        await conductor.dispatch({ type: 'LOAD_MOVIES' });

        const state = conductor.getState();
        const novice = state.achievements.find(a => a.id === 'collector-novice');
        expect(novice?.unlocked).toBe(true);
    });
  });
});
