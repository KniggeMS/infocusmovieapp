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

interface AppProps {
  conductor: MovieConductor;
}

function App({ conductor }: AppProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [state, setState] = useState<WatchlistState>(conductor.getState());
  const [searchTerm, setSearchTerm] = useState('');
  const [showProfile, setShowProfile] = useState(false);
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
        } catch (e) {}
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
    return <div className="flex items-center justify-center h-screen text-app-text-muted">{t('common.loading')}</div>;
  }

  if (!user) {
    // ✅ FIX: onLoginSuccess statt onLogin
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
    <div className="min-h-screen bg-app-bg text-app-text">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-app-bg/80 border-b border-app-border px-4 py-3 flex items-center gap-3">
        <div className="flex-1">
          <GlassInput
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder={t('common.search', 'Suchen...')}
            className="w-full"
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <button
          onClick={() => setShowProfile(true)}
          className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xs font-bold hover:bg-blue-500/30 transition-all"
        >
          {user.role === 'admin' ? <Shield className="w-4 h-4" /> : (user.displayName?.[0] ?? user.email?.[0] ?? '?').toUpperCase()}
        </button>
      </header>

      {/* Main Content */}
      <main className="relative">
        {state.status === 'loading' && (
          <div className="flex items-center justify-center py-12 text-app-text-muted text-sm gap-2">
            <div className="w-4 h-4 border-2 border-blue-400/40 border-t-blue-400 rounded-full animate-spin" />
            {t('common.loading')}
          </div>
        )}

        {state.error && (
          <div className="mx-4 mt-4 bg-red-900/50 border border-red-500/50 text-red-200 p-4 rounded-xl flex items-center gap-3">
            <Film className="w-5 h-5 flex-shrink-0" />
            <span>{state.error}</span>
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
            episodes={state.episodes}
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
  <AchievementsGrid achievements={state.achievements} />   // ✅ achievements prop
) : state.filter === 'statistics' ? (
  <StatisticsDashboard movies={state.items} />             // ✅ movies statt statistics+items
) : state.filter === 'recommendations' ? (
  <Recommendations
    library={state.items}
    conductor={conductor}
    onAddToLibrary={handleAddMovie}
  />
        ) : (
          <>
            {state.filter === 'list' && state.activeListId && (
              <div className="flex items-center gap-2 px-4 pt-4 text-sm text-app-text-muted">
                <ListPlus className="w-4 h-4" />
                <span>List:</span>
                <span className="font-medium text-app-text">{state.customLists.find(l => l.id === state.activeListId)?.name}</span>
              </div>
            )}

            {allTags.length > 0 && (
              <div className="px-4 pt-3">
                <button
                  onClick={() => setTagsExpanded(!tagsExpanded)}
                  className="flex items-center gap-2 text-xs text-app-text-muted uppercase tracking-wider hover:text-app-text transition-colors"
                >
                  <span>Tags</span>
                  {state.tagFilter && (
                    <span className="w-4 h-4 bg-blue-500 rounded-full text-white text-[10px] flex items-center justify-center">1</span>
                  )}
                  {tagsExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                {tagsExpanded && (
                  <div className="flex flex-wrap gap-2 mt-2">
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

            <div className="grid grid-cols-3 gap-2 p-4">
              {filteredItems.map((movie, index) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <GlassCard
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
                      <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 text-app-text-muted gap-1">
                        <Film className="w-8 h-8 opacity-30" />
                        <span className="text-[10px] px-2 text-center leading-tight">{movie.title}</span>
                      </div>
                    )}

                    {movie.watched && (
                      <div className="absolute top-1.5 left-1.5 bg-green-500/80 backdrop-blur-sm text-white text-[9px] px-1.5 py-0.5 rounded-full">
                        ✓ Gesehen
                      </div>
                    )}

                    {movie.voteAverage && (
                      <div className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-sm text-yellow-400 text-[9px] px-1.5 py-0.5 rounded-full">
                        ★ {movie.voteAverage.toFixed(1)}
                      </div>
                    )}

                    {movie.source !== 'tmdb' && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); conductor.dispatch({ type: 'TOGGLE_FAVORITE', payload: movie.id }); }}
                          className="absolute bottom-8 right-1.5 bg-black/60 backdrop-blur-md p-2.5 rounded-full transition-all hover:scale-110 shadow-lg"
                        >
                          <Heart className={`w-3.5 h-3.5 ${movie.favorite ? 'fill-red-400 text-red-400' : 'text-white'}`} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); conductor.dispatch({ type: 'TOGGLE_WATCHED', payload: movie.id }); }}
                          className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-md p-2.5 rounded-full transition-all hover:scale-110 shadow-lg"
                        >
                          <Eye className={`w-3.5 h-3.5 ${movie.watched ? 'fill-green-400 text-green-400' : 'text-white'}`} />
                        </button>
                      </>
                    )}

                    {movie.source === 'tmdb' && !isMovieInLibrary(movie) ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAddMovie(movie); }}
                        className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-md p-2.5 rounded-full transition-all hover:scale-110 shadow-lg hover:bg-blue-500/40"
                        title={t('common.addToWatchlist', 'Zur Watchlist hinzufügen')}
                      >
                        <Plus className="w-3.5 h-3.5 text-white" />
                      </button>
                    ) : movie.source === 'tmdb' && isMovieInLibrary(movie) ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); conductor.dispatch({ type: 'SELECT_MOVIE', payload: movie.id }); }}
                        className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-md p-2.5 rounded-full transition-all hover:scale-110 shadow-lg hover:bg-blue-500/40"
                        title={t('common.inLibrary', 'In Bibliothek')}
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-400" />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); conductor.dispatch({ type: 'REMOVE_MOVIE', payload: movie.id }); }}
                        className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-md p-2.5 rounded-full transition-all hover:scale-110 shadow-lg hover:bg-red-500/40"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-white" />
                      </button>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-2 pb-1.5 pt-4">
                      <p className="text-white text-[10px] font-medium truncate">{movie.title}</p>
                      <p className="text-white/60 text-[9px]">
                        {movie.mediaType === 'tv' ? t('common.series') : t('common.movie')} · {movie.releaseDate?.split('-')[0] || 'N/A'}
                      </p>
                      {movie.source !== 'tmdb' && movie.tags && movie.tags.length > 0 && (
                        <div className="flex gap-1 mt-0.5 flex-wrap">
                          {movie.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-blue-300 text-[8px]">#{tag}</span>
                          ))}
                        </div>
                      )}
                      {movie.source !== 'tmdb' && typeof movie.userRating === 'number' && movie.userRating > 0 && (
                        <p className="text-yellow-400 text-[9px]">★ {movie.userRating}/10</p>
                      )}
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>

            {state.status === 'idle' && state.items.length === 0 && !state.error && (
              <div className="flex flex-col items-center justify-center py-24 text-center px-6">
                <Film className="w-16 h-16 text-app-text-muted opacity-20 mb-4" />
                <p className="text-app-text font-medium mb-1">{t('common.noResults')}</p>
                <p className="text-app-text-muted text-sm">{t('common.beginSearch')}</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* ✅ FIX: BottomNav — onNavigateHome + showProfile statt onShowAll */}
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