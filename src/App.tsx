import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { MovieConductor } from './core/conductor/MovieConductor';
import { WatchlistState, Movie } from './types/domain';
import { UserProfile } from './types/auth';
import { AuthService } from './services/AuthService';
import { LoginScreen } from './components/LoginScreen';
import { ProfileModal } from './components/ProfileModal';
import { MovieDetailModal } from './components/MovieDetailModal';
import { StatisticsDashboard } from './components/StatisticsDashboard';
import { AchievementsGrid } from './components/AchievementsGrid';
import { BottomNav } from './components/BottomNav';
import { Recommendations } from './components/Recommendations';
import { useToast } from './components/Toast';
import { Search, Plus, Trash2, Heart, Eye, Shield, ListPlus, Sparkles, Film, ChevronDown, ChevronUp } from 'lucide-react';
import { GlassCard, GlassInput } from './components/glass';
import { DiaryView } from './components/diary/DiaryView';
import { ActivityFeed } from './components/diary/ActivityFeed';
import { EpisodeTracker } from './components/tv/EpisodeTracker';
import { ListsOverview } from './components/ListsOverview';
import { SplashScreen } from '@capacitor/splash-screen';
import { shareMovie } from './lib/share';
// import { NotificationBell } from './components/NotificationBell'; // re-enable when component is ready

interface AppProps {
  conductor: MovieConductor;
}

function App({ conductor }: AppProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();

  // Auth State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Initialize with current state from conductor
  const [state, setState] = useState<WatchlistState>(conductor.getState());
  const [searchTerm, setSearchTerm] = useState('');
  const [showProfile, setShowProfile] = useState(false);

  // UI State
  const [showListMenu, setShowListMenu] = useState(false);
  const [tagsExpanded, setTagsExpanded] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await AuthService.getInstance().getCurrentUser();
        setUser(currentUser);
        if (currentUser?.theme) {
          document.documentElement.setAttribute('data-theme', currentUser.theme);
        }
      } catch (e) {
        console.error('Auth check failed:', e);
      } finally {
        setAuthLoading(false);
        try {
          await SplashScreen.hide();
        } catch (e) {
          // Ignore splash screen errors on web
        }
      }
    };
    checkUser();

    const unsubscribe = conductor.subscribe((newState) => {
      setState(newState);
    });

    return () => unsubscribe();
  }, [conductor]);

  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        conductor.dispatch({ type: 'SET_FILTER', payload: 'all' });
        conductor.dispatch({ type: 'LOAD_MOVIES' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user, conductor]);

  const handleLogout = async () => {
    await AuthService.getInstance().signOut();
    conductor.clear();
    setUser(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.length === 0) {
      conductor.dispatch({ type: 'LOAD_MOVIES' });
    } else if (value.length > 2) {
      conductor.dispatch({ type: 'SEARCH', payload: value });
    }
  };

  const handleShare = async () => {
    if (!state.selectedMovie) return;
    const result = await shareMovie(state.selectedMovie);
    if (result.method === 'clipboard' && result.success) {
      showToast(result.message || 'Link copied!', 'success');
    }
  };

  const handleAddMovie = (movie: Movie) => {
    conductor.dispatch({ type: 'ADD_MOVIE', payload: movie });
    setSearchTerm('');
    conductor.dispatch({ type: 'LOAD_MOVIES' });
    conductor.dispatch({ type: 'SET_FILTER', payload: 'all' });
  };

  if (authLoading) {
    return <div>{t('common.loading')}</div>;
  }

  // FIX: prop war onSetUser, korrekt ist onLoginSuccess
  if (!user) {
    return <LoginScreen onLoginSuccess={setUser} />;
  }

  const filteredItems = state.items.filter((movie) => {
    if (state.filter === 'favorites' && !movie.favorite) return false;
    if (state.filter === 'watched' && !movie.watched) return false;
    if (state.tagFilter && !(movie.tags || []).includes(state.tagFilter)) return false;
    return true;
  });

  const allTags = Array.from(
    new Set(state.items.flatMap((m) => m.tags || []).filter(Boolean))
  ).sort();

  const isMovieInLibrary = (movie: Movie) => {
    if (movie.source !== 'tmdb') return true;
    return state.items.some(m =>
      m.tmdbId === Number(movie.id) || m.id === movie.id
    );
  };

    return (
    <div className="app-container">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-header px-4 py-3 flex items-center gap-3">
        <GlassInput
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder={t('common.search')}
          icon={<Search size={16} />}
          className="flex-1"
        />
      </header>

      {/* Main Content */}
      <main className="px-3 pt-3">
        {state.status === 'loading' && (
          <div className="text-center py-4 text-app-text-muted text-sm">{t('common.loading')}</div>
        )}
        {state.error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 text-red-400 text-sm mb-3">
            <span>⚠️</span>
            {state.error}
          </div>
        )}

        {state.filter === 'diary' ? (
          <>
            <DiaryView items={state.items} onSelectMovie={(id) => conductor.dispatch({ type: 'SELECT_MOVIE', payload: id })} />
            <ActivityFeed items={state.items} onSelectMovie={(id) => conductor.dispatch({ type: 'SELECT_MOVIE', payload: id })} />
          </>
        ) : state.filter === 'series' ? (
          <EpisodeTracker
            items={state.items}
            episodes={state.episodes ?? []}
            onSelectMovie={(id) => conductor.dispatch({ type: 'SELECT_MOVIE', payload: id })}
            onToggleEpisode={(showId, season, episode) => conductor.dispatch({ type: 'TOGGLE_EPISODE', payload: { showId, season, episode } })}
          />
        ) : state.filter === 'lists' ? (
          <ListsOverview
            lists={state.customLists}
            items={state.items}
            conductor={conductor}
            onSelectList={(listId) => conductor.dispatch({ type: 'SELECT_LIST', payload: listId })}
          />
        ) : state.filter === 'achievements' ? (
          <AchievementsGrid achievements={state.achievements ?? []} />
        ) : state.filter === 'statistics' ? (
          <StatisticsDashboard movies={state.items} />
        ) : state.filter === 'recommendations' ? (
          <Recommendations library={state.items} conductor={conductor} onAddToLibrary={handleAddMovie} />
        ) : (
          <>
            {state.filter === 'list' && state.activeListId && (
              <div className="flex items-center gap-2 px-1 mb-3 text-sm text-app-text-muted">
                <span>List:</span>
                <span className="font-medium text-app-text">
                  {state.customLists.find(l => l.id === state.activeListId)?.name}
                </span>
              </div>
            )}

            {allTags.length > 0 && (
              <div className="mb-3">
                <button
                  onClick={() => setTagsExpanded(!tagsExpanded)}
                  className="flex items-center gap-2 text-xs text-app-text-muted uppercase tracking-wider hover:text-app-text transition-colors"
                >
                  <span>Tags</span>
                  {state.tagFilter && (
                    <span className="w-4 h-4 rounded-full bg-accent-color text-white text-[9px] flex items-center justify-center">1</span>
                  )}
                  {tagsExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {tagsExpanded && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {state.tagFilter && (
                      <button
                        onClick={() => conductor.dispatch({ type: 'SET_TAG_FILTER', payload: null })}
                        className="bg-app-secondary text-app-text-muted hover:text-app-text px-2 py-1 rounded-full border border-app-border text-xs"
                      >
                        Alle
                      </button>
                    )}
                    {allTags.map(tag => {
                      const active = state.tagFilter === tag;
                      return (
                        <button
                          key={tag}
                          onClick={() => conductor.dispatch({ type: 'SET_TAG_FILTER', payload: active ? null : tag })}
                          className={`px-2.5 py-1 rounded-full border transition text-xs ${
                            active
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'bg-blue-500/10 text-blue-300 border-blue-500/30 hover:bg-blue-500/20'
                          }`}
                        >
                          #{tag}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              {filteredItems.map((movie) => (
                <GlassCard
                  key={movie.id}
                  onClick={() => conductor.dispatch({ type: 'SELECT_MOVIE', payload: movie.id })}
                  className="relative aspect-[2/3] overflow-hidden p-0"
                >
                  {movie.posterPath ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w342${movie.posterPath}`}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-app-secondary text-app-text-muted text-xs">No Image</div>
                  )}
                  {movie.watched && (
                    <span className="absolute top-1 left-1 bg-green-500/80 text-white text-[10px] px-1.5 py-0.5 rounded-full">✓ Gesehen</span>
                  )}
                  {movie.voteAverage && (
                    <span className="absolute top-1 right-1 bg-black/60 text-yellow-400 text-[10px] px-1.5 py-0.5 rounded-full">★ {movie.voteAverage.toFixed(1)}</span>
                  )}
                  <div className="absolute bottom-1 right-1 flex flex-col gap-1">
                    {movie.source !== 'tmdb' && (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); conductor.dispatch({ type: 'TOGGLE_FAVORITE', payload: movie.id }); }} className="bg-black/60 backdrop-blur-md p-2.5 rounded-full transition-all hover:scale-110 shadow-lg">
                          <Heart size={14} className={movie.favorite ? 'fill-red-500 text-red-500' : 'text-white'} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); conductor.dispatch({ type: 'TOGGLE_WATCHED', payload: movie.id }); }} className="bg-black/60 backdrop-blur-md p-2.5 rounded-full transition-all hover:scale-110 shadow-lg">
                          <Eye size={14} className={movie.watched ? 'fill-green-500 text-green-500' : 'text-white'} />
                        </button>
                      </>
                    )}
                    {movie.source === 'tmdb' && !isMovieInLibrary(movie) ? (
                      <button onClick={(e) => { e.stopPropagation(); handleAddMovie(movie); }} className="bg-black/60 backdrop-blur-md p-2.5 rounded-full transition-all hover:scale-110 shadow-lg hover:bg-blue-500/40" title={t('common.addToWatchlist', 'Zur Watchlist hinzufügen')}>
                        <Plus size={14} className="text-white" />
                      </button>
                    ) : movie.source === 'tmdb' && isMovieInLibrary(movie) ? (
                      <button onClick={(e) => { e.stopPropagation(); conductor.dispatch({ type: 'SELECT_MOVIE', payload: movie.id }); }} className="bg-black/60 backdrop-blur-md p-2.5 rounded-full transition-all hover:scale-110 shadow-lg hover:bg-blue-500/40" title={t('common.inLibrary', 'In Bibliothek')}>
                        <Shield size={14} className="text-blue-400" />
                      </button>
                    ) : (
                      <button onClick={(e) => { e.stopPropagation(); conductor.dispatch({ type: 'REMOVE_MOVIE', payload: movie.id }); }} className="bg-black/60 backdrop-blur-md p-2.5 rounded-full transition-all hover:scale-110 shadow-lg hover:bg-red-500/40">
                        <Trash2 size={14} className="text-white" />
                      </button>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2">
                    <p className="text-white text-xs font-medium leading-tight line-clamp-2">{movie.title}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-app-text-muted text-[10px]">{movie.mediaType === 'tv' ? t('common.series') : t('common.movie')}</span>
                      <span className="text-app-text-muted text-[10px]">·</span>
                      <span className="text-app-text-muted text-[10px]">{movie.releaseDate?.split('-')[0] || 'N/A'}</span>
                    </div>
                    {movie.source !== 'tmdb' && movie.tags && movie.tags.length > 0 && (
                      <div className="flex flex-wrap gap-0.5 mt-1">
                        {movie.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[9px] bg-blue-500/20 text-blue-300 px-1 rounded">#{tag}</span>
                        ))}
                      </div>
                    )}
                    {movie.source !== 'tmdb' && typeof movie.userRating === 'number' && movie.userRating > 0 && (
                      <span className="text-[10px] text-yellow-400">★ {movie.userRating}/10</span>
                    )}
                  </div>
                </GlassCard>
              ))}
            </div>

            {state.status === 'idle' && state.items.length === 0 && !state.error && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <span className="text-4xl mb-4">🍿</span>
                <p className="text-app-text-muted">{t('common.noResults')}</p>
                <p className="text-app-text-faint text-sm mt-1">{t('common.beginSearch')}</p>
              </div>
            )}
          </>
        )}
      </main>

      <BottomNav
        currentFilter={state.filter}
        showProfile={showProfile}
        onNavigateHome={() => {
          setSearchTerm('');
          conductor.dispatch({ type: 'SET_FILTER', payload: 'all' });
          conductor.dispatch({ type: 'LOAD_MOVIES' });
        }}
        onShowDiary={() => conductor.dispatch({ type: 'SET_FILTER', payload: 'diary' })}
        onShowProfile={() => setShowProfile(true)}
        onShowSeries={() => conductor.dispatch({ type: 'SET_FILTER', payload: 'series' })}
        onShowLists={() => conductor.dispatch({ type: 'SET_FILTER', payload: 'lists' })}
      />

      {showProfile && user && (
        <ProfileModal
          user={user}
          conductor={conductor}
          customLists={state.customLists}
          onClose={() => setShowProfile(false)}
          onLogout={handleLogout}
          onUpdateUser={setUser}
        />
      )}

      {state.selectedMovie && (
        <MovieDetailModal
          movie={state.selectedMovie}
          conductor={conductor}
          libraryItems={state.items}
          customLists={state.customLists}
          onClose={() => conductor.dispatch({ type: 'CLOSE_DETAILS' })}
          onAddToLibrary={(movie) => { handleAddMovie(movie); }}
          onShare={handleShare}
          onShowToast={showToast}
        />
      )}
    </div>
  );
}

export default App;