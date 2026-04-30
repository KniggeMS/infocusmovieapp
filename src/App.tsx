import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
import { useToast } from './components/Toast';
import { Search, Plus, Trash2, Heart, Eye, Shield, ListPlus } from 'lucide-react';
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
    if (state.filter === 'favorites') return movie.favorite;
    if (state.filter === 'watched') return movie.watched;
    return true;
  });

  return (
    <div className="min-h-screen bg-app-bg text-app-text font-sans pb-24">
      
      {/* Header (Sticky Glass) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-app-bg/80 backdrop-blur-xl border-b border-app-border px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <img 
                    src="/pwa-icon-192.png" 
                    alt="InFocus Logo" 
                    className="h-14 w-14 rounded-full object-cover border-2 border-app-border shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                />
                
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
                 <div className="flex bg-app-secondary border border-app-border rounded-2xl px-3 py-2 sm:px-4 sm:py-3 text-sm focus-within:ring-2 focus-within:ring-blue-500 w-full items-center gap-2 max-w-[150px] sm:max-w-md transition-all">
                    <Search className="w-4 h-4 text-app-text-muted shrink-0" />
                    <input 
                        id="search-movies"
                        name="search"
                        type="text" 
                        placeholder={t('common.search')} 
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="bg-transparent border-none focus:outline-none w-full text-app-text placeholder-app-text-muted text-xs sm:text-sm"
                    />
                </div>
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
        
        {state.filter === 'achievements' ? (
          <AchievementsGrid achievements={state.achievements} />
        ) : state.filter === 'statistics' ? (
          <StatisticsDashboard statistics={state.statistics} />
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {filteredItems.map((movie) => (
                        <div 
                            key={movie.id} 
                            onClick={() => conductor.dispatch({ type: 'SELECT_MOVIE', payload: movie.id })}
                            className="relative aspect-[2/3] rounded-2xl overflow-hidden group shadow-lg bg-app-card-bg cursor-pointer"
                        >
                            {/* Image */}
                            {movie.posterPath ? (
                                <img 
                                    src={movie.posterPath} 
                                    alt={movie.title} 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-app-text-muted bg-app-card-bg">
                                    No Image
                                </div>
                            )}

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-90" />

                            {/* Action Button (Top Right) */}
                            <div className="absolute top-3 right-3 z-10">
                                {movie.source === 'tmdb' ? (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleAddMovie(movie); }}
                                        className="bg-black/40 backdrop-blur-md p-2 rounded-full transition-all shadow-lg text-app-text hover:bg-accent-blue"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); conductor.dispatch({ type: 'REMOVE_MOVIE', payload: movie.id }); }}
                                        className="bg-black/40 backdrop-blur-md p-2 rounded-full text-app-text hover:bg-red-500 transition-all shadow-lg"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Text Content */}
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                                <h3 className="font-bold text-sm truncate text-app-text">{movie.title}</h3>
                                <div className="text-xs text-app-text-muted flex items-center gap-2 mt-1">
                                    <span className="bg-app-secondary px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                                        {movie.mediaType === 'tv' ? t('common.series') : t('common.movie')}
                                    </span>
                                    <span>{movie.releaseDate?.split('-')[0] || 'N/A'}</span>
                                    {movie.voteAverage && (
                                        <span className="flex items-center gap-1 text-accent-glow">
                                            ★ {movie.voteAverage.toFixed(1)}
                                        </span>
                                    )}
                                </div>
                                {movie.source !== 'tmdb' && (
                                    <div className="flex items-center gap-3 mt-2">
                                        <Heart 
                                            className={`w-5 h-5 cursor-pointer transition hover:scale-110 ${movie.favorite ? "fill-red-500 text-red-500" : "text-app-text-muted"}`} 
                                            onClick={(e) => { e.stopPropagation(); conductor.dispatch({ type: 'TOGGLE_FAVORITE', payload: movie.id }); }}
                                        />
                                        <Eye 
                                            className={`w-5 h-5 cursor-pointer transition hover:scale-110 ${movie.watched ? "text-blue-400" : "text-gray-600"}`} 
                                            onClick={(e) => { e.stopPropagation(); conductor.dispatch({ type: 'TOGGLE_WATCHED', payload: movie.id }); }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
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
        onShowFavorites={() => conductor.dispatch({ type: 'SET_FILTER', payload: 'favorites' })}
        onShowProfile={() => setShowProfile(true)}
        onShowWatched={() => conductor.dispatch({ type: 'SET_FILTER', payload: 'watched' })}
        onShowAchievements={() => conductor.dispatch({ type: 'SET_FILTER', payload: 'achievements' })}
        onShowStatistics={() => conductor.dispatch({ type: 'SET_FILTER', payload: 'statistics' })}
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