import { useState, useEffect } from 'react';
import { MovieConductor } from './core/conductor/MovieConductor';
import { WatchlistState, Movie } from './types/domain';
import { UserProfile } from './types/auth';
import { AuthService } from './services/AuthService';
import { LoginScreen } from './components/LoginScreen';
import { Search, Plus, Trash2, Home, Heart, Zap, Eye, Trophy, Lock, Popcorn, Library, BarChart2, X, Check, LogOut, Shield } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { SplashScreen } from '@capacitor/splash-screen';

interface AppProps {
  conductor: MovieConductor;
}

function App({ conductor }: AppProps) {
  // Auth State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Initialize with current state from conductor
  const [state, setState] = useState<WatchlistState>(conductor.getState());
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleLogout = async () => {
    await AuthService.getInstance().signOut();
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
      return <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center text-white">Loading...</div>;
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
                        Admin
                    </span>
                )}
                {user.role === 'manager' && (
                    <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Manager
                    </span>
                )}
            </div>
            
            <div className="flex-1 flex justify-end gap-3">
                 <div className="hidden md:flex bg-white/10 border border-white/10 rounded-2xl px-4 py-3 text-sm focus-within:ring-2 focus-within:ring-blue-500 w-full items-center gap-2 max-w-[200px] sm:max-w-md transition-all">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="bg-transparent border-none focus:outline-none w-full text-white placeholder-gray-400"
                    />
                </div>
                
                {/* Logout Button */}
                <button 
                    onClick={handleLogout}
                    className="bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 p-3 rounded-2xl transition-colors border border-white/5"
                    title="Sign Out"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto pt-28 px-4">
        
        {/* Status Indicators */}
        {state.status === 'loading' && (
          <div className="text-center py-4 text-accent-glow animate-pulse font-medium">
            Synchronizing...
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
                      <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Total</div>
                      <div className="text-2xl font-bold text-white">{state.statistics.totalMovies}</div>
                   </div>
                   <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-center backdrop-blur-sm">
                      <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Watched</div>
                      <div className="text-2xl font-bold text-blue-400">{state.statistics.watchedCount}</div>
                   </div>
                   <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-center backdrop-blur-sm">
                      <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Hours</div>
                      <div className="text-2xl font-bold text-yellow-400">{(state.statistics.totalRuntimeMinutes / 60).toFixed(1)}</div>
                   </div>
                </div>

                {/* Section 2: Genres (Pie Chart) */}
                {state.statistics.byGenre.length > 0 && (
                    <div className="bg-white/5 border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                           <Popcorn className="w-5 h-5 text-accent-glow" /> 
                           Favorite Genres
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
                           Timeline
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
                    <p className="text-lg font-medium">No movies found</p>
                    <p className="text-sm mt-1 opacity-60">Search for a title to begin.</p>
                </div>
                )}
            </>
        )}

      </div>

      {/* Bottom Navigation (Fixed) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0B0E14]/90 backdrop-blur-2xl border-t border-white/5 px-6 py-4 flex justify-between items-center z-50 max-w-4xl mx-auto w-full md:rounded-t-3xl md:mb-0">
          <button 
            className={`transition-colors ${state.filter === 'all' ? 'text-blue-500' : 'text-gray-400 hover:text-white'}`}
            onClick={() => {
                setSearchTerm('');
                conductor.dispatch({ type: 'SET_FILTER', payload: 'all' });
                conductor.dispatch({ type: 'LOAD_MOVIES' });
            }}
            aria-label="Home"
          >
            <Home className="w-6 h-6" />
          </button>
          
          <button 
            className={`transition-colors ${state.filter === 'favorites' ? 'text-blue-500' : 'text-gray-400 hover:text-white'}`}
            onClick={() => conductor.dispatch({ type: 'SET_FILTER', payload: 'favorites' })}
            aria-label="Favorites"
          >
            <Heart className="w-6 h-6" />
          </button>
          
          <button 
            className="text-gray-400 hover:text-white transition-colors"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Search / Top"
          >
            <Search className="w-6 h-6" />
          </button>

          <button 
            className={`transition-colors ${state.filter === 'watched' ? 'text-blue-500' : 'text-gray-400 hover:text-white'}`}
            onClick={() => conductor.dispatch({ type: 'SET_FILTER', payload: 'watched' })}
            aria-label="List / Watched"
          >
            <Eye className="w-6 h-6" />
          </button>
          
          <button 
            className={`transition-colors ${state.filter === 'achievements' ? 'text-blue-500' : 'text-gray-400 hover:text-white'}`}
            onClick={() => conductor.dispatch({ type: 'SET_FILTER', payload: 'achievements' })}
            aria-label="Achievements"
          >
            <Zap className="w-6 h-6" />
          </button>
          
          <button 
            className={`transition-colors ${state.filter === 'statistics' ? 'text-blue-500' : 'text-gray-400 hover:text-white'}`}
            onClick={() => conductor.dispatch({ type: 'SET_FILTER', payload: 'statistics' })}
            aria-label="Statistics"
          >
            <BarChart2 className="w-6 h-6" />
          </button>
      </nav>

      {/* Movie Detail Modal */}
      {state.selectedMovie && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center animate-fade-in">
            {/* Backdrop Blur Layer */}
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
                onClick={() => conductor.dispatch({ type: 'CLOSE_DETAILS' })}
            />
            
            {/* Modal Content */}
            <div className="relative w-full max-w-2xl bg-[#0B0E14] sm:rounded-3xl border-t sm:border border-white/10 shadow-2xl h-[85vh] sm:h-[80vh] overflow-y-auto overflow-x-hidden animate-slide-up">
                
                {/* Close Button */}
                <button 
                    onClick={() => conductor.dispatch({ type: 'CLOSE_DETAILS' })}
                    className="absolute top-4 right-4 z-20 bg-black/50 p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-md transition-all"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Hero Image */}
                <div className="relative h-64 sm:h-80 w-full">
                    <img 
                        src={state.selectedMovie.posterPath || ''} 
                        alt={state.selectedMovie.title}
                        className="w-full h-full object-cover opacity-60 mask-image-b"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-transparent to-transparent" />
                    
                    <div className="absolute bottom-0 left-0 p-6 w-full flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-2 leading-tight shadow-black drop-shadow-lg">
                                {state.selectedMovie.title}
                            </h2>
                            <div className="flex items-center gap-4 text-sm text-gray-300">
                                {state.selectedMovie.releaseDate && <span>{state.selectedMovie.releaseDate.split('-')[0]}</span>}
                                {state.selectedMovie.runtime && <span>{state.selectedMovie.runtime} min</span>}
                                {state.selectedMovie.voteAverage && <span className="text-yellow-400">★ {state.selectedMovie.voteAverage.toFixed(1)}</span>}
                            </div>
                        </div>

                        {/* Add to Watchlist Button */}
                        <div className="shrink-0">
                            {state.items.some(m => m.tmdbId === Number(state.selectedMovie?.id) || m.id === state.selectedMovie?.id) ? (
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-gray-300 text-sm font-bold border border-white/5">
                                    <Check className="w-4 h-4" />
                                    In Library
                                </div>
                            ) : (
                                <button 
                                    onClick={() => handleAddMovie(state.selectedMovie!)}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 transition-colors px-4 py-2 rounded-xl text-white text-sm font-bold shadow-lg shadow-blue-900/20"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add to Watchlist
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    
                    {/* Plot */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Plot</h3>
                        <p className="text-gray-300 leading-relaxed text-base">
                            {state.selectedMovie.overview || 'No overview available.'}
                        </p>
                    </div>

                    {/* Director */}
                    {state.selectedMovie.director && (
                        <div>
                             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Director</h3>
                             <div className="text-white font-medium">{state.selectedMovie.director}</div>
                        </div>
                    )}

                    {/* Cast */}
                    {state.selectedMovie.cast && state.selectedMovie.cast.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Top Cast</h3>
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                {state.selectedMovie.cast.map((actor, idx) => (
                                    <div key={idx} className="flex flex-col items-center gap-2 min-w-[80px]">
                                        <div className="w-16 h-16 rounded-full overflow-hidden bg-white/10 border border-white/5">
                                            {actor.profilePath ? (
                                                <img src={actor.profilePath} alt={actor.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">N/A</div>
                                            )}
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xs font-bold text-white truncate w-20">{actor.name}</div>
                                            <div className="text-[10px] text-gray-400 truncate w-20">{actor.character}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Where to Watch */}
                    {state.selectedMovie.watchProviders && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Where to Watch</h3>
                            
                            <div className="space-y-4">
                                {/* Stream (Flatrate) */}
                                {state.selectedMovie.watchProviders.flatrate && state.selectedMovie.watchProviders.flatrate.length > 0 && (
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-gray-500 w-12 shrink-0">Stream</span>
                                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                            {state.selectedMovie.watchProviders.flatrate.map((provider, idx) => (
                                                <img 
                                                    key={idx} 
                                                    src={provider.logoPath} 
                                                    alt={provider.providerName} 
                                                    title={provider.providerName}
                                                    className="w-10 h-10 rounded-xl shadow-lg border border-white/10"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Rent */}
                                {state.selectedMovie.watchProviders.rent && state.selectedMovie.watchProviders.rent.length > 0 && (
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-gray-500 w-12 shrink-0">Rent</span>
                                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                            {state.selectedMovie.watchProviders.rent.map((provider, idx) => (
                                                <img 
                                                    key={idx} 
                                                    src={provider.logoPath} 
                                                    alt={provider.providerName} 
                                                    title={provider.providerName}
                                                    className="w-10 h-10 rounded-xl shadow-lg border border-white/10 opacity-80 hover:opacity-100 transition-opacity"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Buy */}
                                {state.selectedMovie.watchProviders.buy && state.selectedMovie.watchProviders.buy.length > 0 && (
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-gray-500 w-12 shrink-0">Buy</span>
                                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                            {state.selectedMovie.watchProviders.buy.map((provider, idx) => (
                                                <img 
                                                    key={idx} 
                                                    src={provider.logoPath} 
                                                    alt={provider.providerName} 
                                                    title={provider.providerName}
                                                    className="w-10 h-10 rounded-xl shadow-lg border border-white/10 opacity-80 hover:opacity-100 transition-opacity"
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
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">You might also like</h3>
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                {state.selectedMovie.recommendations.map((rec) => (
                                    <div 
                                        key={rec.id} 
                                        onClick={() => conductor.dispatch({ type: 'SELECT_MOVIE', payload: rec.id })}
                                        className="flex flex-col gap-2 min-w-[100px] w-[100px] cursor-pointer group"
                                    >
                                        <div className="aspect-[2/3] rounded-lg overflow-hidden bg-white/10 border border-white/5 relative">
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
                                        <div className="text-xs font-medium text-gray-300 truncate group-hover:text-blue-400 transition-colors">
                                            {rec.title}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="pt-4 flex gap-3">
                         {/* Here we could add Add/Remove/Favorite buttons if we wanted strict context actions inside modal */}
                    </div>
                </div>
            </div>
        </div>
      )}
      
    </div>
  );
}

export default App;