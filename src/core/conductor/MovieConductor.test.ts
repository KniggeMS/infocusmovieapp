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
});
