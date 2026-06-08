import { MovieServiceAdapter, UserIntent, WatchlistState, Movie, Achievement, MovieStatistics, EpisodeEntry } from '../../types/domain';

type Listener = (state: WatchlistState) => void;

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first-blood', title: 'First Blood', description: 'Add your first movie to the collection.', iconName: 'Popcorn', unlocked: false, threshold: 1 },
  { id: 'collector-novice', title: 'Collector Novice', description: 'Collect 5 movies.', iconName: 'Library', unlocked: false, threshold: 5 },
  { id: 'genre-guru', title: 'Genre Guru', description: 'Collect 10 movies to become a guru.', iconName: 'Library', unlocked: false, threshold: 10 },
  { id: 'film-fanatic', title: 'Film Fanatic', description: 'Collect 25 movies in your library.', iconName: 'Popcorn', unlocked: false, threshold: 25 },
  { id: 'cinema-legend', title: 'Cinema Legend', description: 'Collect 50 movies in your library.', iconName: 'Library', unlocked: false, threshold: 50 },
  { id: 'first-watched', title: 'First Watch', description: 'Mark your first movie as watched.', iconName: 'Popcorn', unlocked: false, threshold: 1 },
  { id: 'rating-pro', title: 'Rating Pro', description: 'Rate 10 movies with a personal score.', iconName: 'Library', unlocked: false, threshold: 10 },
];

const INITIAL_STATISTICS: MovieStatistics = {
  totalMovies: 0,
  watchedCount: 0,
  totalRuntimeMinutes: 0,
  favoriteCount: 0,
  byGenre: [],
  byDecade: [],
  averageUserRating: 0,
  ratedCount: 0,
  byYear: [],
  thisYearCount: 0,
  allTimeCount: 0,
  topTags: []
};

const toNumber = (value: unknown): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

export class MovieConductor {
  private adapter: MovieServiceAdapter;
  private listeners: Listener[] = [];
  private loadInFlight: Promise<void> | null = null;
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
    tagFilter: null,
    diaryEntries: [],
    tvShows: [],
    episodes: [],
  };

  constructor(adapter: MovieServiceAdapter) {
    this.adapter = adapter;
  }

  // --- Static Utils ---
  static getRuntimeMinutes(movie: Movie): number {
    const runtime = toNumber((movie as Movie & { runtime?: unknown }).runtime);
    if (runtime > 0) return runtime;

    const duration = toNumber((movie as Movie & { duration?: unknown }).duration);
    if (duration > 0) return duration;

    const episodes = toNumber((movie as Movie & { episodes?: unknown }).episodes);
    const episodeRuntime = toNumber((movie as Movie & { episodeRuntime?: unknown }).episodeRuntime);
    if (episodes > 0 && episodeRuntime > 0) return episodes * episodeRuntime;

    return 0;
  }

  static getRuntimeHours(movie: Movie): number {
    return MovieConductor.getRuntimeMinutes(movie) / 60;
  }

  static getWatchedRuntimeMinutes(movies: Movie[]): number {
    return movies.reduce((sum, movie) => {
      return movie.watched ? sum + MovieConductor.getRuntimeMinutes(movie) : sum;
    }, 0);
  }

  // --- Instance Methods ---
  public subscribe(listener: Listener): () => void {
    this.listeners.push(listener);
    listener(this.getState());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public clear(): void {
    this.state = {
      ...this.state,
      items: [],
      customLists: [],
      achievements: INITIAL_ACHIEVEMENTS,
      statistics: INITIAL_STATISTICS,
      selectedMovie: null,
      activeListId: null
    };
    this.notify();
  }

  public getState(): WatchlistState {
    return { ...this.state };
  }

  public async dispatch(intent: UserIntent): Promise<void> {
    switch (intent.type) {
      case 'LOAD_MOVIES':       await this.handleLoadMovies(); break;
      case 'SEARCH':            await this.handleSearch(intent.payload); break;
      case 'ADD_MOVIE':         await this.handleAddMovie(intent.payload); break;
      case 'REMOVE_MOVIE':      await this.handleRemoveMovie(intent.payload); break;
      case 'TOGGLE_WATCHED':    await this.handleToggleWatched(intent.payload); break;
      case 'TOGGLE_FAVORITE':   await this.handleToggleFavorite(intent.payload); break;
      case 'SET_FILTER':        this.updateState({ filter: intent.payload, activeListId: null }); break;
      case 'SELECT_MOVIE':      await this.handleSelectMovie(intent.payload); break;
      case 'CLOSE_DETAILS':     this.updateState({ selectedMovie: null }); break;
      case 'CREATE_LIST':       await this.handleCreateList(intent.payload); break;
      case 'DELETE_LIST':       await this.handleDeleteList(intent.payload); break;
      // ✅ FIX: jetzt movieId statt movie-Objekt
      case 'ADD_TO_LIST': await this.handleAddMovieToList(intent.payload.listId, intent.payload.movie); break;
      // ✅ NEU: Film aus Liste entfernen
      case 'REMOVE_FROM_LIST':  await this.handleRemoveMovieFromList(intent.payload.listId, intent.payload.movieId); break;
      case 'SELECT_LIST':       await this.handleSelectList(intent.payload); break;
      case 'UPDATE_USER_RATING': await this.handleUpdateField(intent.payload.id, { userRating: intent.payload.userRating }); break;
      case 'UPDATE_NOTES':      await this.handleUpdateField(intent.payload.id, { notes: intent.payload.notes }); break;
      case 'UPDATE_TAGS':       await this.handleUpdateField(intent.payload.id, { tags: intent.payload.tags }); break;
      case 'SET_TAG_FILTER':    this.updateState({ tagFilter: intent.payload }); break;
      case 'LOAD_TV_PROGRESS':  await this.handleLoadTvProgress(); break;
      case 'TOGGLE_EPISODE':    await this.handleToggleEpisode(intent.payload); break;
      case 'DIARY_ENTRY':       await this.handleDiaryEntry(intent.payload); break;
    }
  }

  private async handleUpdateField(id: string, patch: Partial<Movie>): Promise<void> {
    const movie = this.state.items.find(m => m.id === id);
    if (!movie) return;

    const previousState = {
      items: [...this.state.items],
      selectedMovie: this.state.selectedMovie ? { ...this.state.selectedMovie } : null,
      statistics: { ...this.state.statistics }
    };

    const updatedItems = this.state.items.map(m => m.id === id ? { ...m, ...patch } : m);
    const updatedSelected = this.state.selectedMovie && this.state.selectedMovie.id === id
      ? { ...this.state.selectedMovie, ...patch }
      : this.state.selectedMovie;

    this.updateState({
      items: updatedItems,
      selectedMovie: updatedSelected,
      statistics: this.calculateStatistics(updatedItems),
    });

    try {
      await this.adapter.update(id, patch);
    } catch (error) {
      console.error('Update failed, rolling back:', error);
      this.updateState({
        ...previousState,
        error: error instanceof Error ? error.message : 'Update failed',
      });
    }
  }

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

  // ✅ FIX: nimmt jetzt movieId (string) statt movie-Objekt
  private async handleAddMovieToList(listId: string, movieId: string): Promise<void> {
    const movie = this.state.items.find(m => m.id === movieId);
    if (!movie) return;

    // Optimistisches Update: movieId in items-Array der Liste eintragen
    const updatedLists = this.state.customLists.map(l => {
      if (l.id !== listId) return l;
      const currentItems: string[] = (l as any).items || [];
      if (currentItems.includes(movieId)) return l; // bereits drin
      return { ...l, items: [...currentItems, movieId], movieCount: (l.movieCount || 0) + 1 };
    });
    this.updateState({ customLists: updatedLists, error: null });

    try {
      await this.adapter.addMovieToList(listId, movie);
    } catch (error) {
      // Rollback
      const rollback = this.state.customLists.map(l => {
        if (l.id !== listId) return l;
        const currentItems: string[] = (l as any).items || [];
        return {
          ...l,
          items: currentItems.filter(id => id !== movieId),
          movieCount: Math.max((l.movieCount || 1) - 1, 0)
        };
      });
      this.updateState({ customLists: rollback, error: error instanceof Error ? error.message : 'Failed to add to list' });
    }
  }

  // ✅ NEU: Film aus Liste entfernen
  private async handleRemoveMovieFromList(listId: string, movieId: string): Promise<void> {
    const oldLists = [...this.state.customLists];

    const updatedLists = this.state.customLists.map(l => {
      if (l.id !== listId) return l;
      const currentItems: string[] = (l as any).items || [];
      return {
        ...l,
        items: currentItems.filter(id => id !== movieId),
        movieCount: Math.max((l.movieCount || 1) - 1, 0)
      };
    });
    this.updateState({ customLists: updatedLists, error: null });

    try {
      if (typeof (this.adapter as any).removeMovieFromList === 'function') {
        await (this.adapter as any).removeMovieFromList(listId, movieId);
      }
    } catch (error) {
      this.updateState({ customLists: oldLists, error: error instanceof Error ? error.message : 'Failed to remove from list' });
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

  private async handleLoadMovies(): Promise<void> {
    if (this.loadInFlight) return this.loadInFlight;
    this.updateState({ status: 'loading' });
    this.loadInFlight = (async () => {
      try {
        const [movies, lists] = await Promise.all([
          this.adapter.getTrending(),
          this.adapter.getLists()
        ]);
        this.updateState({
          items: movies,
          customLists: lists,
          status: 'idle',
          statistics: this.calculateStatistics(movies),
          achievements: this.checkAchievements(movies)
        });
      } catch (error) {
        this.updateState({ status: 'error', error: error instanceof Error ? error.message : 'Load failed' });
      } finally {
        this.loadInFlight = null;
      }
    })();
    return this.loadInFlight;
  }

  private async handleSearch(query: string): Promise<void> {
    this.updateState({ status: 'loading' });
    try {
      const results = await this.adapter.search(query);
      this.updateState({ items: results, status: 'idle' });
    } catch (error) {
      this.updateState({ status: 'error', error: error instanceof Error ? error.message : 'Search failed' });
    }
  }

  private async handleAddMovie(movie: Movie): Promise<void> {
    try {
      const alreadyExists = await this.adapter.exists({ title: movie.title, tmdbId: movie.tmdbId });
      if (alreadyExists) {
        this.updateState({ error: `Movie "${movie.title}" already exists!` });
        return;
      }
      const added = await this.adapter.add(movie);
      const items = [added, ...this.state.items];
      this.updateState({
        items,
        statistics: this.calculateStatistics(items),
        achievements: this.checkAchievements(items)
      });
    } catch (error) {
      this.updateState({ error: error instanceof Error ? error.message : 'Add failed' });
    }
  }

  private async handleRemoveMovie(id: string): Promise<void> {
    try {
      await this.adapter.delete(id);
      const items = this.state.items.filter(m => m.id !== id);
      this.updateState({ items, statistics: this.calculateStatistics(items) });
    } catch (error) {
      this.updateState({ error: error instanceof Error ? error.message : 'Remove failed' });
    }
  }

  private async handleToggleWatched(id: string): Promise<void> {
    const movie = this.state.items.find(m => m.id === id);
    if (!movie) return;
    const nowWatched = !movie.watched;
    const watchedAt = nowWatched ? new Date().toISOString() : null;
    try {
      await this.adapter.update(id, { watched: nowWatched, watchedAt });
      const updated = this.state.items.map(m =>
        m.id === id ? { ...m, watched: nowWatched, watchedAt } : m
      );
      this.updateState({ items: updated, statistics: this.calculateStatistics(updated) });
    } catch (error) {
      this.updateState({ error: error instanceof Error ? error.message : 'Toggle watched failed' });
    }
  }

  private async handleDiaryEntry(movie: Movie): Promise<void> {
    const watchedAt = new Date().toISOString();
    const patched = { ...movie, watched: true, watchedAt };
    if (movie.source === 'database') {
      try {
        await this.adapter.update(movie.id, { watched: true, watchedAt });
      } catch { /* ignore */ }
    }
    const entry = { ...patched, id: crypto.randomUUID(), addedAt: watchedAt, source: 'database' as const };
    const items = [entry, ...this.state.items];
    this.updateState({
      items,
      statistics: this.calculateStatistics(items),
      achievements: this.checkAchievements(items),
    });
  }

  private async handleLoadTvProgress(): Promise<void> {
    const tvShows = this.state.items.filter(m => m.mediaType === 'tv');
    this.updateState({ tvShows });
  }

  private async handleToggleEpisode(payload: { showId: number; season: number; episode: number }): Promise<void> {
    const existing = this.state.episodes.find(
      e => e.tmdbId === payload.showId && e.seasonNumber === payload.season && e.episodeNumber === payload.episode
    );
    let updated: EpisodeEntry[];
    if (existing) {
      updated = this.state.episodes.map(e =>
        e.tmdbId === payload.showId && e.seasonNumber === payload.season && e.episodeNumber === payload.episode
          ? { ...e, watched: !e.watched, watchedAt: !e.watched ? new Date().toISOString() : null }
          : e
      );
    } else {
      const show = this.state.items.find(m => m.tmdbId === payload.showId);
      updated = [...this.state.episodes, {
        tmdbId: payload.showId,
        title: show?.title || '',
        seasonNumber: payload.season,
        episodeNumber: payload.episode,
        watched: true,
        watchedAt: new Date().toISOString(),
      }];
    }
    this.updateState({ episodes: updated });
  }

  private async handleToggleFavorite(id: string): Promise<void> {
    const movie = this.state.items.find(m => m.id === id);
    if (!movie) return;
    try {
      await this.adapter.update(id, { favorite: !movie.favorite });
      const updated = this.state.items.map(m => m.id === id ? { ...m, favorite: !m.favorite } : m);
      this.updateState({ items: updated, statistics: this.calculateStatistics(updated) });
    } catch (error) {
      this.updateState({ error: error instanceof Error ? error.message : 'Toggle favorite failed' });
    }
  }

  private async handleSelectMovie(id: string): Promise<void> {
    try {
      const localMovie =
        this.state.items.find(m => m.id === id) ||
        (await this.adapter.getById(id)) ||
        null;

      const tmdbId = localMovie?.tmdbId != null ? String(localMovie.tmdbId) : (localMovie?.source === 'database' ? null : id);
      const mediaType = localMovie?.mediaType;

      let details: Movie | null = null;
      if (tmdbId) {
        try {
          details = await this.adapter.getMovieDetails(tmdbId, mediaType);
        } catch {
          details = null;
        }
      }

      if (details && localMovie) {
        details = {
          ...details,
          id: localMovie.id,
          tmdbId: localMovie.tmdbId ?? details.tmdbId,
          source: localMovie.source ?? details.source,
          watched: localMovie.watched ?? details.watched,
          favorite: localMovie.favorite ?? details.favorite,
          addedAt: localMovie.addedAt ?? details.addedAt,
          userRating: localMovie.userRating ?? null,
          notes: localMovie.notes ?? null,
          tags: localMovie.tags ?? [],
          genres: details.genres && details.genres.length > 0 ? details.genres : (localMovie.genres ?? []),
        };
      }

      this.updateState({ selectedMovie: details ?? localMovie });
    } catch (error) {
      this.updateState({ error: error instanceof Error ? error.message : 'Select failed' });
    }
  }

  private calculateStatistics(items: Movie[]): MovieStatistics {
    const genreCount = new Map<string, number>();
    const decadeCount = new Map<string, number>();
    const yearCount = new Map<string, number>();
    const tagCount = new Map<string, number>();

    let ratingSum = 0;
    let ratedCount = 0;
    const currentYear = new Date().getFullYear();
    let thisYearCount = 0;

    for (const m of items) {
      (m.genres || []).forEach(g => {
        if (!g) return;
        genreCount.set(g, (genreCount.get(g) || 0) + 1);
      });

      const release = m.releaseDate?.slice(0, 4);
      if (release && /^\d{4}$/.test(release)) {
        const decade = `${release.slice(0, 3)}0s`;
        decadeCount.set(decade, (decadeCount.get(decade) || 0) + 1);
      }

      const added = m.addedAt?.slice(0, 4);
      if (added && /^\d{4}$/.test(added)) {
        yearCount.set(added, (yearCount.get(added) || 0) + 1);
        if (Number(added) === currentYear) thisYearCount++;
      }

      (m.tags || []).forEach(t => {
        if (!t) return;
        tagCount.set(t, (tagCount.get(t) || 0) + 1);
      });

      if (typeof m.userRating === 'number' && !Number.isNaN(m.userRating)) {
        ratingSum += m.userRating;
        ratedCount++;
      }
    }

    const sortDesc = <T extends { value?: number; count?: number }>(arr: T[]) =>
      arr.sort((a, b) => ((b.value ?? b.count ?? 0) - (a.value ?? a.count ?? 0)));

    const byGenre = sortDesc(Array.from(genreCount.entries()).map(([name, value]) => ({ name, value })));
    const byDecade = Array.from(decadeCount.entries())
      .map(([decade, count]) => ({ decade, count }))
      .sort((a, b) => a.decade.localeCompare(b.decade));
    const byYear = Array.from(yearCount.entries())
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year.localeCompare(b.year));
    const topTags = sortDesc(Array.from(tagCount.entries()).map(([name, value]) => ({ name, value })));

    return {
      totalMovies: items.length,
      watchedCount: items.filter(m => m.watched).length,
      totalRuntimeMinutes: items.reduce((sum, m) => sum + (m.runtime || 0), 0),
      favoriteCount: items.filter(m => m.favorite).length,
      byGenre: byGenre.slice(0, 8),
      byDecade,
      averageUserRating: ratedCount > 0 ? Number((ratingSum / ratedCount).toFixed(1)) : 0,
      ratedCount,
      byYear,
      thisYearCount,
      allTimeCount: items.length,
      topTags: topTags.slice(0, 8),
    };
  }

  private checkAchievements(items: Movie[]): Achievement[] {
    const count = items.length;
    const watchedCount = items.filter(m => m.watched).length;
    const ratedCount = items.filter(m => typeof m.userRating === 'number' && m.userRating > 0).length;

    return INITIAL_ACHIEVEMENTS.map(a => {
      let unlocked = false;
      switch (a.id) {
        case 'first-watched':
          unlocked = watchedCount >= a.threshold;
          break;
        case 'rating-pro':
          unlocked = ratedCount >= a.threshold;
          break;
        default:
          unlocked = count >= a.threshold;
      }
      return { ...a, unlocked };
    });
  }

  private updateState(updates: Partial<WatchlistState>): void {
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  private notify(): void {
    const currentState = this.getState();
    this.listeners.forEach(listener => listener(currentState));
  }
}