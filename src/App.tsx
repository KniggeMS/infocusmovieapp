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
import {     Search, Plus, Trash2, Heart, Eye, Shield, ListPlus, Sparkles, Film, ChevronDown, ChevronUp } from 'lucide-react';
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

  // Auth State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Initialize with current state from conductor
  const [state, setState] = useState<WatchlistState>(conductor.getState());
  const [searchTerm, setSearchTerm] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  
    // UI State for Actions
    const [showListMenu, setShowListMenu] = useState(false);
    const [tagsExpanded, setTagsExpanded] = useState(false);

  useEffect(() => {
    // Check for existing session
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
        // Hide Splash Screen once auth check is done (or failed)
        try {
            await SplashScreen.hide();
        } catch (e) {
            // Ignore splash screen errors on web
        }
      }
    };
    checkUser();

    // Subscribe to conductor updates
    const unsubscribe = conductor.subscribe((newState) => {
      setState(newState);
    });

    return () => unsubscribe();
  }, [conductor]);

  // Reload movies when user changes (Login)
  useEffect(() => {
    if (user) {
        // Small timeout to ensure Supabase Auth Header is propagated
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

  // Show Loading Screen while checking auth
  if (authLoading) {
      return <div className="min-h-screen bg-app-bg flex items-center justify-center text-app-text">{t('common.loading')}</div>;
  }

  // Show Login Screen if no user
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

  // Hilfsfunktion: Prüft ob ein TMDB-Film bereits in der Bibliothek ist
  const isMovieInLibrary = (movie: Movie) => {
    if (movie.source !== 'tmdb') return true; // DB-Filme sind per Definition in der Bibliothek
    return state.items.some(m => 
      m.tmdbId === Number(movie.id) || m.id === movie.id
    );
  };

  return (
    <div className="min-h-screen bg-app-bg text-app-text font-sans pb-24">
      
      {/* Header (Frosted Glass) */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-card rounded-none border-x-0 border-t-0 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src="/pwa-icon-192.png"
                    alt="InFocus Logo"
                    className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl object-cover border-2 border-white/10 shadow-[0_0_15px_rgba(59,130,246,0.2)] flex-shrink-0"
                  />
                  <div className="hidden sm:block">
                    <div className="text-sm font-bold text-app-text leading-tight">InFocus</div>
                    <div className="text-[9px] text-app-text-muted tracking-widest uppercase leading-tight">Family CineLog</div>
                  </div>
                </div>
                
                {/* Role Badge */}
                {user.role === 'admin' && (
                    <span className="flex items-center gap-1 bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        <Shield className="w-3 h-3" />
                        {t('auth.admin')}
                    </span>
                )}
                {user.role === 'manager' && (
                    <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {t('auth.manager')}
                    </span>
                )}
            </div>
            
            <div className="flex-1 flex justify-end gap-3">
                <GlassInput
                    icon={<Search className="w-4 h-4" />}
                    type="text"
                    placeholder={t('common.search')}
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="max-w-[150px] sm:max-w-md w-full"
                />
            </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto pt-28 px-4">
        
        {/* Status Indicators */}
        {state.status === 'loading' && (
          <div className="text-center py-4 text-accent-glow animate-pulse font-medium">
            {t('common.loading')}
          </div>
        )}

        {state.error && (
          <div className="bg-red-900/50 border border-red-500/50 text-red-200 p-4 rounded-xl mb-8 flex items-center gap-3">
             <span className="text-lg">⚠️</span>
             <span>{state.error}</span>
          </div>
        )}
        
        <AnimatePresence mode="wait">
        <motion.div
          key={state.filter + (state.activeListId || '')}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
        >
        {state.filter === 'diary' ? (
          <>
            <ActivityFeed items={state.items} onSelectMovie={(id) => conductor.dispatch({ type: 'SELECT_MOVIE', payload: id })} />
            <div className="mt-8">
              <DiaryView items={state.items} onSelectMovie={(id) => conductor.dispatch({ type: 'SELECT_MOVIE', payload: id })} />
            </div>
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
          <AchievementsGrid achievements={state.achievements} />
        ) : state.filter === 'statistics' ? (
                    <StatisticsDashboard movies={state.items} />

        ) : state.filter === 'recommendations' ? (
          <Recommendations
            library={state.items}
            conductor={conductor}
            onAddToLibrary={handleAddMovie}
          />
        ) : (
            /* Movie Grid */
            <>
                {state.filter === 'list' && state.activeListId && (
                    <div className="mb-6 flex items-center gap-2 text-xl font-bold text-app-text animate-fade-in">
                        <ListPlus className="w-6 h-6 text-blue-500" />
                        <span className="text-blue-500 mr-1">List:</span>
                        {state.customLists.find(l => l.id === state.activeListId)?.name}
                    </div>
                )}

                {/* Tag filter: kollapsibel für mobile Usability */}
                {allTags.length > 0 && (
                    <div className="mb-4">
                        <button
                            onClick={() => setTagsExpanded(!tagsExpanded)}
                            className="flex items-center gap-2 text-xs text-app-text-muted uppercase tracking-wider hover:text-app-text transition-colors"
                        >
                            <span className="flex items-center gap-1">
                                Tags
                                {state.tagFilter && (
                                    <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                        1
                                    </span>
                                )}
                            </span>
                            {tagsExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                            )}
                        </button>
                        <AnimatePresence>
                            {tagsExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                >
                                    <div className="flex flex-wrap items-center gap-2 text-xs pt-2">
                                        {state.tagFilter && (
                                            <button
                                                onClick={() => conductor.dispatch({ type: 'SET_TAG_FILTER', payload: null })}
                                                className="bg-app-secondary text-app-text-muted hover:text-app-text px-2 py-1 rounded-full border border-app-border"
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
                                                    className={`px-2.5 py-1 rounded-full border transition ${
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
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {filteredItems.map((movie, index) => (
                        <GlassCard
                            key={movie.id}
                            hover
                            onClick={() => conductor.dispatch({ type: 'SELECT_MOVIE', payload: movie.id })}
                            className="relative aspect-[2/3] overflow-hidden p-0"
                        >
                            {movie.posterPath ? (
                                <img
                                    src={movie.posterPath}
                                    alt={movie.title}
                                    loading="lazy"
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-app-text-muted text-sm">
                                    No Image
                                </div>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300" />

                            {movie.watched && (
                                <div className="absolute top-3 left-3 z-10 bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
                                    <span>✓ Gesehen</span>
                                </div>
                            )}

                            {movie.voteAverage && (
                                <div className="absolute top-3 right-3 z-10 bg-black/60 backdrop-blur-sm text-accent-glow text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
                                    ★ {movie.voteAverage.toFixed(1)}
                                </div>
                            )}

                            <div className="absolute inset-0 z-10 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                {movie.source !== 'tmdb' && (
                                    <>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); conductor.dispatch({ type: 'TOGGLE_FAVORITE', payload: movie.id }); }}
                                            className="bg-black/60 backdrop-blur-md p-2.5 rounded-full transition-all hover:scale-110 shadow-lg"
                                        >
                                            <Heart className={`w-5 h-5 ${movie.favorite ? 'fill-red-500 text-red-500' : 'text-white/80 hover:text-red-400'}`} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); conductor.dispatch({ type: 'TOGGLE_WATCHED', payload: movie.id }); }}
                                            className="bg-black/60 backdrop-blur-md p-2.5 rounded-full transition-all hover:scale-110 shadow-lg"
                                        >
                                            <Eye className={`w-5 h-5 ${movie.watched ? 'text-emerald-400' : 'text-white/80 hover:text-emerald-400'}`} />
                                        </button>
                                    </>
                                )}
                                {movie.source === 'tmdb' && !isMovieInLibrary(movie) ? (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleAddMovie(movie); }}
                                        className="bg-black/60 backdrop-blur-md p-2.5 rounded-full transition-all hover:scale-110 shadow-lg hover:bg-blue-500/40"
                                        title={t('common.addToWatchlist', 'Zur Watchlist hinzufügen')}
                                    >
                                        <Plus className="w-5 h-5 text-white/80" />
                                    </button>
                                ) : movie.source === 'tmdb' && isMovieInLibrary(movie) ? (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); conductor.dispatch({ type: 'SELECT_MOVIE', payload: movie.id }); }}
                                        className="bg-black/60 backdrop-blur-md p-2.5 rounded-full transition-all hover:scale-110 shadow-lg hover:bg-blue-500/40"
                                        title={t('common.inLibrary', 'In Bibliothek – zum Detailansicht')}
                                    >
                                        <ListPlus className="w-5 h-5 text-white/80" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); conductor.dispatch({ type: 'REMOVE_MOVIE', payload: movie.id }); }}
                                        className="bg-black/60 backdrop-blur-md p-2.5 rounded-full transition-all hover:scale-110 shadow-lg hover:bg-red-500/40"
                                    >
                                        <Trash2 className="w-5 h-5 text-white/80" />
                                    </button>
                                )}
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 p-3 z-20">
                                <h3 className="font-bold text-sm truncate text-app-text drop-shadow-lg">{movie.title}</h3>
                                <div className="text-xs text-app-text-muted flex items-center gap-2 mt-1">
                                    <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider backdrop-blur-sm">
                                        {movie.mediaType === 'tv' ? t('common.series') : t('common.movie')}
                                    </span>
                                    <span>{movie.releaseDate?.split('-')[0] || 'N/A'}</span>
                                </div>
                                {movie.source !== 'tmdb' && movie.tags && movie.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {movie.tags.slice(0, 2).map(tag => (
                                            <span key={tag} className="text-[10px] bg-blue-500/15 text-blue-300 border border-blue-500/30 rounded px-1.5 py-0.5 backdrop-blur-sm">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {movie.source !== 'tmdb' && typeof movie.userRating === 'number' && movie.userRating > 0 && (
                                    <div className="mt-1">
                                        <span className="text-xs text-yellow-400 font-bold drop-shadow-lg">★ {movie.userRating}/10</span>
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    ))}
                </div>

                {/* Empty State */}
                {state.status === 'idle' && state.items.length === 0 && !state.error && (
                <div className="text-center py-20 text-app-text-muted">
                    <div className="text-4xl mb-4 opacity-50">🍿</div>
                    <p className="text-lg font-medium">{t('common.noResults')}</p>
                    <p className="text-sm mt-1 opacity-60">{t('common.beginSearch')}</p>
                </div>
                )}
            </>
        )}
        </motion.div>
        </AnimatePresence>

      </div>

      {/* Bottom Navigation */}
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
      
      {/* Profile Modal */}
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

      {/* Movie Detail Modal */}
      {state.selectedMovie && (
        <MovieDetailModal
          movie={state.selectedMovie}
          conductor={conductor}
          libraryItems={state.items}
          customLists={state.customLists}
          onClose={() => conductor.dispatch({ type: 'CLOSE_DETAILS' })}
          onAddToLibrary={(movie) => {
            handleAddMovie(movie);
          }}
          onShare={handleShare}
          onShowToast={showToast}
        />
      )}

    </div>
  );
}

export default App;