import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SupabaseMovieService } from './SupabaseMovieService';

// Mock Supabase Client (not used in getMovieDetails but required for constructor)
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(),
  })),
}));

describe('SupabaseMovieService', () => {
  let service: SupabaseMovieService;

  beforeEach(() => {
    // Setup Env Mocks
    vi.stubGlobal('import.meta.env', {
      VITE_SUPABASE_URL: 'https://mock.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'mock-key',
      VITE_TMDB_API_KEY: 'mock-tmdb-key'
    });

    // Mock global fetch
    global.fetch = vi.fn();

    service = new SupabaseMovieService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should throw specific error when TMDB returns 401', async () => {
    // Mock Fetch Failure
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ status_message: 'Invalid API key' })
    });

    await expect(service.getMovieDetails('123')).rejects.toThrow('TMDB Error 401: Invalid API key');
  });

  it('should map successful response correctly with fallbacks', async () => {
    // Mock Fetch Success with minimal data
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 123,
        title: 'Test Movie',
        // Missing runtime, overview, etc. to test fallbacks
        credits: { crew: [], cast: [] },
        'watch/providers': { results: {} }
      })
    });

    const result = await service.getMovieDetails('123');

    expect(result.id).toBe('123');
    expect(result.title).toBe('Test Movie');
    expect(result.overview).toBe(''); // Fallback
    expect(result.director).toBe('Unknown'); // Fallback
    expect(result.cast).toEqual([]);
    expect(result.watchProviders?.flatrate).toEqual([]);
  });
});
