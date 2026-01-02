import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MovieConductor } from './core/conductor/MovieConductor';
import { WatchlistState, Movie } from './types/domain';
import { UserProfile } from './types/auth';
import { AuthService } from './services/AuthService';
import { LoginScreen } from './components/LoginScreen';
import { ProfileModal } from './components/ProfileModal';
import { Search, Plus, Trash2, Home, Heart, Zap, Eye, Trophy, Lock, Popcorn, Library, BarChart2, X, Check, LogOut, Shield, Play, User } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { SplashScreen } from '@capacitor/splash-screen';

interface AppProps {
  conductor: MovieConductor;
}

function App({ conductor }: AppProps) {
  const { t } = useTranslation();
  
  // Auth State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Initialize with current state from conductor
  const [state, setState] = useState<WatchlistState>(conductor.getState());
  const [searchTerm, setSearchTerm] = useState('');
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    // Check for existing session
    const checkUser = async () => {
      try {
        const currentUser = await AuthService.getInstance().getCurrentUser();
        setUser(currentUser);
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
        conductor.dispatch({ type: 'LOAD_MOVIES' });
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

  const handleAddMovie = (movie: Movie) => {
    conductor.dispatch({ type: 'ADD_MOVIE', payload: movie });
    setSearchTerm('');
    conductor.dispatch({ type: 'LOAD_MOVIES' });
    conductor.dispatch({ type: 'SET_FILTER', payload: 'all' });
  };

  // Show Loading Screen while checking auth
  if (authLoading) {
      return <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center text-white">{t('common.loading')}</div>;
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
    <div className="min-h-screen bg-[#0B0E14] text-white font-sans pb-24">
      
      {/* Header (Sticky Glass) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B0E14]/80 backdrop-blur-xl border-b border-white/5 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <img 
                    src="/pwa-icon-192.png" 
                    alt="InFocus Logo" 
                    className="h-14 w-14 rounded-full object-cover border-2 border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
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
                 <div className="flex bg-white/10 border border-white/10 rounded-2xl px-3 py-2 sm:px-4 sm:py-3 text-sm focus-within:ring-2 focus-within:ring-blue-500 w-full items-center gap-2 max-w-[150px] sm:max-w-md transition-all">
                    <Search className="w-4 h-4 text-gray-400 shrink-0" />
                    <input 
                        id="search-movies"
                        name="search"
                        type="text" 
                        placeholder={t('common.search')} 
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="bg-transparent border-none focus:outline-none w-full text-white placeholder-gray-400 text-xs sm:text-sm"
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
             /* Achievements Grid */
             <div className="grid grid-cols-2 gap-4">
                {state.achievements.map((achievement) => (
                    <div 
                        key={achievement.id}
                        className={`p-4 rounded-2xl border transition-all duration-500 flex flex-col items-center text-center gap-3 ${
                            achievement.unlocked 
                            ? 'bg-white/10 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.2)] opacity-100' 
                            : 'bg-white/5 border-transparent opacity-50 grayscale'
                        }`}
                    >
                        <div className="relative">
                            <div className={`p-3 rounded-full ${achievement.unlocked ? 'bg-yellow-400/20 text-yellow-400' : 'bg-white/5 text-gray-500'}`}>
                                {achievement.iconName === 'Popcorn' && <Popcorn className="w-8 h-8" />}
                                {achievement.iconName === 'Library' && <Library className="w-8 h-8" />}
                            </div>
                            {!achievement.unlocked && (
                                <div className="absolute -top-1 -right-1 bg-gray-900 rounded-full p-1 border border-white/10">
                                    <Lock className="w-3 h-3 text-gray-400" />
                                </div>
                            )}
                        </div>
                        
                        <div>
                            <h3 className={`text-sm font-bold leading-tight ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`}>
                                {achievement.title}
                            </h3>
                            <p className="text-[10px] text-gray-500 mt-1 leading-relaxed line-clamp-2">
                                {achievement.description}
                            </p>
                        </div>
                    </div>
                ))}
             </div>
        ) : state.filter === 'statistics' ? (
             /* Statistics Dashboard */
             <div className="space-y-8 animate-fade-in pb-10">
                
                {/* Section 1: KPIs */}
                <div className="grid grid-cols-3 gap-3">
                   <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-center backdrop-blur-sm">
                      <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">{t('stats.total')}</div>
                      <div className="text-2xl font-bold text-white">{state.statistics.totalMovies}</div>
                   </div>
                   <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-center backdrop-blur-sm">
                      <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">{t('stats.watched')}</div>
                      <div className="text-2xl font-bold text-blue-400">{state.statistics.watchedCount}</div>
                   </div>
                   <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-center backdrop-blur-sm">
                      <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">{t('stats.hours')}</div>
                      <div className="text-2xl font-bold text-yellow-400">{(state.statistics.totalRuntimeMinutes / 60).toFixed(1)}</div>
                   </div>
                </div>

                {/* Section 2: Genres (Pie Chart) */}
                {state.statistics.byGenre.length > 0 && (
                    <div className="bg-white/5 border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                           <Popcorn className="w-5 h-5 text-accent-glow" /> 
                           {t('stats.genres')}
                        </h3>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={state.statistics.byGenre}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {state.statistics.byGenre.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} stroke="rgba(0,0,0,0.5)" />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        {/* Legend */}
                        <div className="flex flex-wrap justify-center gap-3 mt-4">
                            {state.statistics.byGenre.slice(0, 5).map((entry, index) => (
                                <div key={entry.name} className="flex items-center gap-2 text-xs text-gray-400">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5] }} />
                                    {entry.name}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Section 3: Decades (Bar Chart) */}
                {state.statistics.byDecade.length > 0 && (
                    <div className="bg-white/5 border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                           <Library className="w-5 h-5 text-blue-400" /> 
                           {t('stats.timeline')}
                        </h3>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={state.statistics.byDecade}>
                                    <XAxis 
                                        dataKey="decade" 
                                        stroke="#6b7280" 
                                        fontSize={12} 
                                        tickLine={false} 
                                        axisLine={false}
                                    />
                                    <Tooltip 
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                                    />
                                    <Bar 
                                        dataKey="count" 
                                        fill="#3b82f6" 
                                        radius={[4, 4, 0, 0]} 
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

             </div>
        ) : (
            /* Movie Grid */
            <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {filteredItems.map((movie) => (
                        <div 
                            key={movie.id} 
                            onClick={() => conductor.dispatch({ type: 'SELECT_MOVIE', payload: movie.id })}
                            className="relative aspect-[2/3] rounded-2xl overflow-hidden group shadow-lg bg-gray-800 cursor-pointer"
                        >
                            {/* Image */}
                            {movie.posterPath ? (
                                <img 
                                    src={movie.posterPath} 
                                    alt={movie.title} 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500 bg-gray-800">
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
                                        className="bg-black/40 backdrop-blur-md p-2 rounded-full transition-all shadow-lg text-white hover:bg-accent-blue"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); conductor.dispatch({ type: 'REMOVE_MOVIE', payload: movie.id }); }}
                                        className="bg-black/40 backdrop-blur-md p-2 rounded-full text-white hover:bg-red-500 transition-all shadow-lg"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Text Content */}
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                                <h3 className="font-bold text-sm truncate text-white">{movie.title}</h3>
                                <div className="text-xs text-gray-400 flex items-center gap-2 mt-1">
                                    <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
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
                                            className={`w-5 h-5 cursor-pointer transition hover:scale-110 ${movie.favorite ? "fill-red-500 text-red-500" : "text-gray-400"}`} 
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
                <div className="text-center py-20 text-gray-500">
                    <div className="text-4xl mb-4 opacity-50">🍿</div>
                    <p className="text-lg font-medium">{t('common.noResults')}</p>
                    <p className="text-sm mt-1 opacity-60">{t('common.beginSearch')}</p>
                </div>
                )}
            </>
        )}

      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0B0E14]/90 backdrop-blur-2xl border-t border-white/5 px-6 py-4 flex justify-between items-center z-50 max-w-4xl mx-auto w-full md:rounded-t-3xl">
          <button 
            className={`transition-colors ${state.filter === 'all' ? 'text-blue-500' : 'text-gray-400 hover:text-white'}`}
            onClick={() => {
                setSearchTerm('');
                conductor.dispatch({ type: 'SET_FILTER', payload: 'all' });
                conductor.dispatch({ type: 'LOAD_MOVIES' });
            }}
            aria-label={t('nav.home')}
          >
            <Home className="w-6 h-6" />
          </button>
          
          <button 
            className={`transition-colors ${state.filter === 'favorites' ? 'text-blue-500' : 'text-gray-400 hover:text-white'}`}
            onClick={() => conductor.dispatch({ type: 'SET_FILTER', payload: 'favorites' })}
            aria-label={t('nav.favorites')}
          >
            <Heart className="w-6 h-6" />
          </button>
          
          <button 
            className={`transition-colors ${showProfile ? 'text-blue-500' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setShowProfile(true)}
            aria-label="Profile"
          >
            <User className="w-6 h-6" />
          </button>

          <button 
            className={`transition-colors ${state.filter === 'watched' ? 'text-blue-500' : 'text-gray-400 hover:text-white'}`}
            onClick={() => conductor.dispatch({ type: 'SET_FILTER', payload: 'watched' })}
            aria-label={t('nav.watched')}
          >
            <Eye className="w-6 h-6" />
          </button>
          
          <button 
            className={`transition-colors ${state.filter === 'achievements' ? 'text-blue-500' : 'text-gray-400 hover:text-white'}`}
            onClick={() => conductor.dispatch({ type: 'SET_FILTER', payload: 'achievements' })}
            aria-label={t('nav.achievements')}
          >
            <Zap className="w-6 h-6" />
          </button>
          
          <button 
            className={`transition-colors ${state.filter === 'statistics' ? 'text-blue-500' : 'text-gray-400 hover:text-white'}`}
            onClick={() => conductor.dispatch({ type: 'SET_FILTER', payload: 'statistics' })}
            aria-label={t('nav.statistics')}
          >
            <BarChart2 className="w-6 h-6" />
          </button>
      </nav>
      
      {/* Profile Modal */}
      {showProfile && user && (
          <ProfileModal 
              user={user} 
              conductor={conductor} 
              onClose={() => setShowProfile(false)}
              onLogout={handleLogout}
              onUpdateUser={setUser}
          />
      )}

      {/* Movie Detail Modal */}
      {state.selectedMovie && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center animate-fade-in">
            {/* Backdrop Blur Layer */}
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
                onClick={() => conductor.dispatch({ type: 'CLOSE_DETAILS' })}
            />
            
            {/* Modal Content */}
            <div className="relative w-full max-w-3xl bg-[#0B0E14] sm:rounded-3xl border-t sm:border border-white/10 shadow-2xl h-[95vh] sm:h-[90vh] overflow-y-auto overflow-x-hidden animate-slide-up no-scrollbar">
                
                {/* Close Button */}
                <button 
                    onClick={() => conductor.dispatch({ type: 'CLOSE_DETAILS' })}
                    className="absolute top-4 right-4 z-[120] bg-black/50 p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-md transition-all pointer-events-auto"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Hero Header (YouTube Trailer or Backdrop) */}
                <div className="relative w-full aspect-[16/10] sm:aspect-video sm:h-[450px] overflow-hidden group">
                    {/* Media Layer */}
                    {state.selectedMovie.trailerKey ? (
                        <div className="absolute inset-0 w-full h-full pointer-events-none sm:scale-125">
                            <iframe 
                                className="w-full h-full object-cover opacity-80 sm:opacity-100"
                                src={`https://www.youtube.com/embed/${state.selectedMovie.trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${state.selectedMovie.trailerKey}&playsinline=1&rel=0&disablekb=1&iv_load_policy=3`}
                                title="Trailer"
                                allow="autoplay; encrypted-media" 
                            />
                        </div>
                    ) : (
                         <img 
                            src={state.selectedMovie.backdropPath || state.selectedMovie.posterPath || ''} 
                            alt={state.selectedMovie.title}
                            className="w-full h-full object-cover opacity-80"
                        />
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/40 to-transparent" />
                    
                    {/* Content Container (Bottom Left) */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-10 flex flex-col justify-end h-full z-20 pointer-events-none">
                        
                        {/* Title Only */}
                        <div className="mb-4 sm:mb-6 z-10 pointer-events-none">
                            <h2 className="text-2xl sm:text-5xl font-bold text-white mb-2 sm:mb-3 leading-tight drop-shadow-2xl line-clamp-2">
                                {state.selectedMovie.title}
                            </h2>
                        </div>

                        {/* Action Buttons Row */}
                        <div className="flex flex-wrap items-center gap-3 z-[110] pointer-events-auto">
                            
                            {/* Play Trailer Button (If exists) */}
                            {state.selectedMovie.trailerKey && (
                                <button 
                                    onClick={() => window.open(`https://youtube.com/watch?v=${state.selectedMovie!.trailerKey}`, '_blank')}
                                    className="flex items-center gap-2 bg-white text-black hover:bg-gray-200 transition-all px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg font-bold text-sm sm:text-lg shadow-xl active:scale-95"
                                >
                                    <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-black" />
                                    {t('common.playTrailer')}
                                </button>
                            )}

                            {/* Add/Library Button */}
                            {state.items.some(m => m.tmdbId === Number(state.selectedMovie?.id) || m.id === state.selectedMovie?.id) ? (
                                <button 
                                    className="flex items-center gap-2 bg-gray-500/30 backdrop-blur-md text-white/90 px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg font-bold text-sm sm:text-lg border border-white/10 cursor-default"
                                >
                                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                                    {t('common.inLibrary')}
                                </button>
                            ) : (
                                <button 
                                    onClick={() => handleAddMovie(state.selectedMovie!)}
                                    className="flex items-center gap-2 bg-gray-600/60 hover:bg-gray-600/80 backdrop-blur-md text-white transition-all px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg font-bold text-sm sm:text-lg border border-white/20 shadow-lg hover:scale-105 active:scale-95"
                                >
                                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                                    {t('common.addToWatchlist')}
                                </button>
                            )}

                        </div>

                        {/* Poster (Hidden on mobile, visible on desktop overlap) */}
                        <div className="hidden sm:block absolute -bottom-16 right-10 w-32 aspect-[2/3] rounded-lg shadow-2xl border-2 border-white/10 z-20 overflow-hidden transform rotate-3 hover:rotate-0 transition-all duration-500">
                             <img 
                                src={state.selectedMovie.posterPath || ''} 
                                alt="Poster" 
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>

                {/* Content Body */}
                <div className="p-5 sm:p-10 space-y-6 sm:space-y-8 bg-[#0B0E14] relative z-30">
                    
                    {/* Metadata (Moved here) */}
                    <div className="mt-6 mb-4 flex flex-wrap items-center gap-3 text-sm text-gray-400">
                        {state.selectedMovie.releaseDate && <span>{state.selectedMovie.releaseDate.split('-')[0]}</span>}
                        {state.selectedMovie.runtime && <span>• {state.selectedMovie.runtime} min</span>}
                        {state.selectedMovie.voteAverage && <span className="text-green-400 font-bold">• {Math.round(state.selectedMovie.voteAverage * 10)}% {t('common.match')}</span>}
                        {state.selectedMovie.genres && state.selectedMovie.genres.slice(0, 2).map(g => (
                            <span key={g} className="text-gray-300">• {g}</span>
                        ))}
                    </div>

                    {/* Plot */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">{t('common.plot')}</h3>
                        <p className="text-gray-200 leading-relaxed text-base sm:text-lg font-light">
                            {state.selectedMovie.overview || 'No overview available.'}
                        </p>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-4 border-y border-white/5">
                        {state.selectedMovie.director && (
                            <div>
                                <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">
                                    {state.selectedMovie.mediaType === 'tv' ? t('common.creator') : t('common.director')}
                                </h3>
                                <div className="text-white font-medium">{state.selectedMovie.director}</div>
                            </div>
                        )}
                        <div>
                             <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">{t('common.released')}</h3>
                             <div className="text-white font-medium">{state.selectedMovie.releaseDate?.split('-')[0] || 'N/A'}</div>
                        </div>
                        <div>
                             <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">{t('common.type')}</h3>
                             <div className="text-white font-medium">
                                {state.selectedMovie.mediaType === 'tv' ? t('common.series') : t('common.movie')}
                             </div>
                        </div>
                         {/* More fields can go here */}
                    </div>

                    {/* Cast */}
                    {state.selectedMovie.cast && state.selectedMovie.cast.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">{t('common.cast')}</h3>
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                                {state.selectedMovie.cast.map((actor, idx) => (
                                    <div key={idx} className="flex flex-col items-center gap-2 min-w snap-start">
                                        <div className="w-20 h-20 rounded-full overflow-hidden bg-white/10 border border-white/5 shadow-lg">
                                            {actor.profilePath ? (
                                                <img src={actor.profilePath} alt={actor.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">N/A</div>
                                            )}
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xs font-bold text-white truncate w-24">{actor.name}</div>
                                            <div className="text-[10px] text-gray-400 truncate w-24">{actor.character}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Where to Watch */}
                    {state.selectedMovie.watchProviders && (
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">{t('common.providers')}</h3>
                            
                            <div className="space-y-6">
                                {/* Stream (Flatrate) */}
                                {state.selectedMovie.watchProviders.flatrate && state.selectedMovie.watchProviders.flatrate.length > 0 && (
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs font-bold text-gray-500 w-12 shrink-0 uppercase">Stream</span>
                                        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                                            {state.selectedMovie.watchProviders.flatrate.map((provider, idx) => (
                                                <img 
                                                    key={idx} 
                                                    src={provider.logoPath} 
                                                    alt={provider.providerName} 
                                                    title={provider.providerName}
                                                    className="w-12 h-12 rounded-xl shadow-lg border border-white/10 hover:scale-110 transition-transform cursor-help"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Rent */}
                                {state.selectedMovie.watchProviders.rent && state.selectedMovie.watchProviders.rent.length > 0 && (
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs font-bold text-gray-500 w-12 shrink-0 uppercase">Rent</span>
                                        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                                            {state.selectedMovie.watchProviders.rent.map((provider, idx) => (
                                                <img 
                                                    key={idx} 
                                                    src={provider.logoPath} 
                                                    alt={provider.providerName} 
                                                    title={provider.providerName}
                                                    className="w-10 h-10 rounded-xl shadow-lg border border-white/10 opacity-70 hover:opacity-100 transition-all grayscale hover:grayscale-0"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Buy */}
                                {state.selectedMovie.watchProviders.buy && state.selectedMovie.watchProviders.buy.length > 0 && (
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs font-bold text-gray-500 w-12 shrink-0 uppercase">Buy</span>
                                        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                                            {state.selectedMovie.watchProviders.buy.map((provider, idx) => (
                                                <img 
                                                    key={idx} 
                                                    src={provider.logoPath} 
                                                    alt={provider.providerName} 
                                                    title={provider.providerName}
                                                    className="w-10 h-10 rounded-xl shadow-lg border border-white/10 opacity-70 hover:opacity-100 transition-all grayscale hover:grayscale-0"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Fallback if no providers */}
                                {(!state.selectedMovie.watchProviders.flatrate?.length && 
                                  !state.selectedMovie.watchProviders.rent?.length && 
                                  !state.selectedMovie.watchProviders.buy?.length) && (
                                    <div className="text-sm text-gray-600 italic">
                                        No streaming information available for your region.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Recommendations */}
                    {state.selectedMovie.recommendations && state.selectedMovie.recommendations.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">{t('common.recommendations')}</h3>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                {state.selectedMovie.recommendations.slice(0, 5).map((rec) => (
                                    <div 
                                        key={rec.id} 
                                        onClick={() => conductor.dispatch({ type: 'SELECT_MOVIE', payload: rec.id })}
                                        className="flex flex-col gap-2 cursor-pointer group"
                                    >
                                        <div className="aspect-[2/3] rounded-xl overflow-hidden bg-white/10 border border-white/5 relative shadow-lg">
                                            {rec.posterPath ? (
                                                <img 
                                                    src={rec.posterPath} 
                                                    alt={rec.title} 
                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">N/A</div>
                                            )}
                                        </div>
                                        <div className="text-xs font-bold text-gray-300 truncate group-hover:text-blue-400 transition-colors">
                                            {rec.title}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
      
    </div>
  );
}

export default App;