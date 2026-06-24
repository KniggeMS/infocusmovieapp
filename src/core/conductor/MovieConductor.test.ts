import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MovieConductor } from './MovieConductor';
import { MovieServiceAdapter, Movie } from '../../types/domain';

// Mock Implementation of the Adapter
const mockMovies: Movie[] = [
  {
    id: '1',
    title: 'Test Movie',
    posterPath: null,
    runtime: 120,
    releaseDate: '2025-01-01',
    overview: 'Test',
    voteAverage: 8.5,
  },
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
  createList: vi.fn(),
  deleteList: vi.fn(),
  getLists: vi.fn().mockResolvedValue([]),
  getListMovies: vi.fn().mockResolvedValue([]),
  addMovieToList: vi.fn(),
  removeMovieFromList: vi.fn(),
  saveEpisodeProgress: vi.fn().mockResolvedValue(undefined),
  loadEpisodeProgress: vi.fn().mockResolvedValue([]),
  saveDiaryEntry: vi.fn().mockResolvedValue(undefined),
  getDiaryEntries: vi.fn().mockResolvedValue([]),
  loadAchievements: vi.fn().mockResolvedValue([]),
  saveAchievement: vi.fn().mockResolvedValue(undefined),
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
      dispatchPromise5,
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
      getTrending: vi.fn().mockRejectedValue(new Error('Network Error')),
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
      voteAverage: 5,
    };

    // 2. Action: Try to add it
    await conductor.dispatch({ type: 'ADD_MOVIE', payload: duplicateMovie });

    // 3. Assertions
    expect(mockAdapter.exists).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Existing Movie' }),
    );
    expect(mockAdapter.add).not.toHaveBeenCalled();

    const state = conductor.getState();
    expect(state.items).not.toContainEqual(expect.objectContaining({ title: 'Existing Movie' }));
    expect(state.error).toBe('Movie "Existing Movie" already exists!');
  });

  describe('Achievements', () => {
    it('should unlock "First Blood" achievement after adding a movie', async () => {
      // 1. Initial State Check
      let state = conductor.getState();
      const firstBlood = state.achievements.find((a) => a.id === 'first-blood');
      const novice = state.achievements.find((a) => a.id === 'collector-novice');

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
        voteAverage: 10,
      };
      mockAdapter.exists = vi.fn().mockResolvedValue(false);
      mockAdapter.add = vi.fn().mockResolvedValue({ ...testMovie, id: 'uuid-101' });

      // 3. Action: Add the movie
      await conductor.dispatch({ type: 'ADD_MOVIE', payload: testMovie });

      // 4. Assertions
      state = conductor.getState();
      const firstBloodAfter = state.achievements.find((a) => a.id === 'first-blood');
      const noviceAfter = state.achievements.find((a) => a.id === 'collector-novice');

      expect(firstBloodAfter?.unlocked).toBe(true); // Should be unlocked now!
      expect(noviceAfter?.unlocked).toBe(false); // Still locked (only 1 movie)
    });

    it('should unlock "Collector Novice" achievement after adding 5 movies', async () => {
      mockAdapter.loadAchievements = vi.fn().mockResolvedValue([
        { achievementId: 'first-blood', unlockedAt: '2026-01-15T10:00:00Z' },
        { achievementId: 'collector-novice', unlockedAt: '2026-02-20T14:30:00Z' },
      ]);
      mockAdapter.getTrending = vi
        .fn()
        .mockResolvedValue([
          { id: '1' },
          { id: '2' },
          { id: '3' },
          { id: '4' },
          { id: '5' },
        ] as any);

      await conductor.dispatch({ type: 'LOAD_MOVIES' });

      const state = conductor.getState();
      const novice = state.achievements.find((a) => a.id === 'collector-novice');
      expect(novice?.unlocked).toBe(true);
      expect(novice?.unlockedAt).toBe('2026-02-20T14:30:00Z');
    });

    it('should load persisted achievements from DB on LOAD_MOVIES', async () => {
      mockAdapter.loadAchievements = vi.fn().mockResolvedValue([
        { achievementId: 'first-blood', unlockedAt: '2026-01-15T10:00:00Z' },
        { achievementId: 'collector-novice', unlockedAt: '2026-02-20T14:30:00Z' },
      ]);

      await conductor.dispatch({ type: 'LOAD_MOVIES' });

      const state = conductor.getState();
      const firstBlood = state.achievements.find((a) => a.id === 'first-blood');
      const novice = state.achievements.find((a) => a.id === 'collector-novice');
      const guru = state.achievements.find((a) => a.id === 'genre-guru');

      expect(firstBlood?.unlocked).toBe(true);
      expect(firstBlood?.unlockedAt).toBe('2026-01-15T10:00:00Z');
      expect(novice?.unlocked).toBe(true);
      expect(novice?.unlockedAt).toBe('2026-02-20T14:30:00Z');
      expect(guru?.unlocked).toBe(false);
    });

    it('should persist newly unlocked achievements via adapter', async () => {
      // Start with empty achievements, add 1 movie → first-blood should unlock and persist
      mockAdapter.loadAchievements = vi.fn().mockResolvedValue([]);
      await conductor.dispatch({ type: 'LOAD_MOVIES' });

      const testMovie: Movie = {
        id: '101',
        title: 'Persist Test',
        posterPath: null,
        runtime: 120,
        releaseDate: '2025-01-01',
        overview: 'Test',
        voteAverage: 8,
      };
      mockAdapter.exists = vi.fn().mockResolvedValue(false);
      mockAdapter.add = vi.fn().mockResolvedValue({ ...testMovie, id: 'uuid-101' });

      await conductor.dispatch({ type: 'ADD_MOVIE', payload: testMovie });

      expect(mockAdapter.saveAchievement).toHaveBeenCalledWith('first-blood');
    });

    it('should not re-persist already unlocked achievements', async () => {
      const freshAdapter: MovieServiceAdapter = {
        ...mockAdapter,
        loadAchievements: vi.fn().mockResolvedValue([
          { achievementId: 'first-blood', unlockedAt: '2026-01-15T10:00:00Z' },
        ]),
        getTrending: vi.fn().mockResolvedValue([{ id: '1' }, { id: '2' }] as any),
        exists: vi.fn().mockResolvedValue(false),
        add: vi.fn().mockResolvedValue({ id: 'uuid-new', title: 'New' } as Movie),
        saveAchievement: vi.fn().mockResolvedValue(undefined),
      };
      const freshConductor = new MovieConductor(freshAdapter);

      await freshConductor.dispatch({ type: 'LOAD_MOVIES' });
      const firstBlood = freshConductor
        .getState()
        .achievements.find((a) => a.id === 'first-blood');
      expect(firstBlood?.unlocked).toBe(true);

      await freshConductor.dispatch({
        type: 'ADD_MOVIE',
        payload: { id: 'x', title: 'X', posterPath: null, releaseDate: null, overview: null, voteAverage: null },
      });

      expect(freshAdapter.saveAchievement).not.toHaveBeenCalled();
    });
  });

  describe('Episode Tracking Persistence', () => {
    it('should persist episode progress to adapter on toggle', async () => {
      // Arrange: load a TV show into state
      const tvShow: Movie = {
        id: 'tv-1',
        tmdbId: 123,
        title: 'Test Series',
        posterPath: null,
        runtime: 30,
        releaseDate: '2024-01-01',
        overview: 'A test show',
        voteAverage: 8,
        mediaType: 'tv',
      };
      mockAdapter.getTrending = vi.fn().mockResolvedValue([tvShow]);
      await conductor.dispatch({ type: 'LOAD_MOVIES' });

      // Act: toggle an episode
      await conductor.dispatch({
        type: 'TOGGLE_EPISODE',
        payload: { showId: 123, season: 1, episode: 1 },
      });

      // Assert: adapter.saveEpisodeProgress was called with the updated state
      expect(mockAdapter.saveEpisodeProgress).toHaveBeenCalledTimes(1);
      const savedEpisodes = (mockAdapter.saveEpisodeProgress as any).mock.calls[0][0];
      expect(savedEpisodes).toHaveLength(1);
      expect(savedEpisodes[0]).toMatchObject({
        tmdbId: 123,
        seasonNumber: 1,
        episodeNumber: 1,
        watched: true,
      });
    });

    it('should load episode progress from adapter on LOAD_MOVIES', async () => {
      // Arrange
      const storedEpisodes = [
        {
          tmdbId: 123,
          title: 'Test Series',
          seasonNumber: 1,
          episodeNumber: 1,
          watched: true,
          watchedAt: '2025-01-01T00:00:00Z',
        },
      ];
      mockAdapter.loadEpisodeProgress = vi.fn().mockResolvedValue(storedEpisodes);

      // Act
      await conductor.dispatch({ type: 'LOAD_MOVIES' });

      // Assert
      const state = conductor.getState();
      expect(state.episodes).toEqual(storedEpisodes);
      expect(mockAdapter.loadEpisodeProgress).toHaveBeenCalledTimes(1);
    });

    it('should persist corrected state on second toggle (watched→unwatched)', async () => {
      const tvShow: Movie = {
        id: 'tv-2',
        tmdbId: 456,
        title: 'Another Show',
        posterPath: null,
        runtime: 30,
        releaseDate: '2024-01-01',
        overview: '',
        voteAverage: 7,
        mediaType: 'tv',
      };
      mockAdapter.getTrending = vi.fn().mockResolvedValue([tvShow]);
      mockAdapter.loadEpisodeProgress = vi.fn().mockResolvedValue([]);
      (mockAdapter.saveEpisodeProgress as any).mockClear();
      await conductor.dispatch({ type: 'LOAD_MOVIES' });

      // Toggle ON
      await conductor.dispatch({
        type: 'TOGGLE_EPISODE',
        payload: { showId: 456, season: 1, episode: 1 },
      });
      expect(mockAdapter.saveEpisodeProgress).toHaveBeenCalledTimes(1);
      expect((mockAdapter.saveEpisodeProgress as any).mock.calls[0][0][0].watched).toBe(true);

      // Toggle OFF
      await conductor.dispatch({
        type: 'TOGGLE_EPISODE',
        payload: { showId: 456, season: 1, episode: 1 },
      });
      expect(mockAdapter.saveEpisodeProgress).toHaveBeenCalledTimes(2);
      expect((mockAdapter.saveEpisodeProgress as any).mock.calls[1][0][0].watched).toBe(false);
    });
  });

  describe('Diary Entry Creation', () => {
    it('should create diary entry when marking movie as watched', async () => {
      // Arrange
      const movie: Movie = {
        id: 'diary-test-1',
        tmdbId: 789,
        title: 'Diary Movie',
        posterPath: null,
        runtime: 100,
        releaseDate: '2023-06-15',
        overview: 'Test diary entry',
        voteAverage: 7.5,
        watched: false,
      };
      mockAdapter.getTrending = vi.fn().mockResolvedValue([movie]);
      mockAdapter.update = vi.fn().mockResolvedValue(undefined);
      mockAdapter.saveDiaryEntry = vi.fn().mockResolvedValue(undefined);
      await conductor.dispatch({ type: 'LOAD_MOVIES' });

      // Act: toggle to watched
      await conductor.dispatch({ type: 'TOGGLE_WATCHED', payload: movie.id });

      // Assert: diary entry was saved
      expect(mockAdapter.saveDiaryEntry).toHaveBeenCalledTimes(1);
      const diaryEntry = (mockAdapter.saveDiaryEntry as any).mock.calls[0][0];
      expect(diaryEntry.title).toBe('Diary Movie');
      expect(diaryEntry.watched).toBe(true);
      expect(diaryEntry.watchedAt).toBeTruthy();

      // State should reflect the diary entry
      const state = conductor.getState();
      expect(state.diaryEntries.length).toBeGreaterThanOrEqual(1);
      const entry = state.diaryEntries.find((e) => e.tmdbId === 789);
      expect(entry).toBeDefined();
      expect(entry!.watched).toBe(true);
    });

    it('should load diary entries from adapter on LOAD_MOVIES', async () => {
      const diaryMovies = [
        {
          id: 'd1',
          tmdbId: 111,
          title: 'Watched Film',
          posterPath: null,
          releaseDate: '2022-01-01',
          mediaType: 'movie',
          source: 'database' as const,
          watched: true,
          watchedAt: '2025-03-01T00:00:00Z',
        },
      ];
      mockAdapter.getDiaryEntries = vi.fn().mockResolvedValue(diaryMovies);

      await conductor.dispatch({ type: 'LOAD_MOVIES' });

      const state = conductor.getState();
      expect(state.diaryEntries).toEqual(diaryMovies);
      expect(mockAdapter.getDiaryEntries).toHaveBeenCalledTimes(1);
    });
  });

  describe('SELECT_MOVIE id resolution', () => {
    it('uses tmdbId (not the internal DB id) when fetching details for a saved movie', async () => {
      const savedMovie: Movie = {
        id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', // internal Supabase UUID
        tmdbId: 1924, // Superman
        mediaType: 'movie',
        title: 'Superman',
        posterPath: null,
        runtime: 143,
        releaseDate: '1978-12-15',
        overview: 'Saved record',
        voteAverage: 7.3,
        source: 'database',
        watched: true,
        favorite: false,
      };

      const tmdbDetails: Movie = {
        id: '1924',
        tmdbId: 1924,
        title: 'Superman',
        posterPath: null,
        runtime: 143,
        releaseDate: '1978-12-15',
        overview: 'Trailer-rich details',
        voteAverage: 7.3,
        trailerKey: 'SUPERMAN-TRAILER',
        source: 'tmdb',
      };

      const detailsSpy = vi.fn().mockResolvedValue(tmdbDetails);
      const adapter: MovieServiceAdapter = {
        ...mockAdapter,
        getTrending: vi.fn().mockResolvedValue([savedMovie]),
        getMovieDetails: detailsSpy,
      };
      const c = new MovieConductor(adapter);

      await c.dispatch({ type: 'LOAD_MOVIES' });
      await c.dispatch({ type: 'SELECT_MOVIE', payload: savedMovie.id });

      // Adapter must be called with the TMDB id, not the UUID
      expect(detailsSpy).toHaveBeenCalledTimes(1);
      expect(detailsSpy).toHaveBeenCalledWith('1924', 'movie');

      // Selected movie keeps the local identity but gets the TMDB trailer
      const selected = c.getState().selectedMovie!;
      expect(selected.id).toBe(savedMovie.id);
      expect(selected.tmdbId).toBe(1924);
      expect(selected.trailerKey).toBe('SUPERMAN-TRAILER');
      expect(selected.watched).toBe(true);
    });

    it('falls back to the local item when a saved movie has no tmdbId', async () => {
      const orphan: Movie = {
        id: 'ffffffff-1111-2222-3333-444444444444',
        title: 'Legacy Entry',
        posterPath: null,
        runtime: 90,
        releaseDate: null,
        overview: null,
        voteAverage: null,
        source: 'database',
      };

      const detailsSpy = vi.fn().mockResolvedValue({} as Movie);
      const adapter: MovieServiceAdapter = {
        ...mockAdapter,
        getTrending: vi.fn().mockResolvedValue([orphan]),
        getMovieDetails: detailsSpy,
      };
      const c = new MovieConductor(adapter);

      await c.dispatch({ type: 'LOAD_MOVIES' });
      await c.dispatch({ type: 'SELECT_MOVIE', payload: orphan.id });

      // No TMDB call with the wrong id
      expect(detailsSpy).not.toHaveBeenCalled();
      // Selected movie is the local record so the modal does not show stranger trailers
      expect(c.getState().selectedMovie?.id).toBe(orphan.id);
    });
  });
});
