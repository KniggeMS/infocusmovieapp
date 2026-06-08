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
import { NotificationBell } from './components/NotificationBell'; // ✅ Korrekt hier oben

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

  // Reload movies when user changes (Login)
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

  // Show Loading Screen while checking auth
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-app-text">
        {t('common.loading')}
      </div>
    );
  }

  // Show Login Screen if no user
  if (!user) {
    return <LoginScreen onLogin={setUser} />;
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

      {/* ─── Header (Frosted Glass) ─── */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-app-bg/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3 px-4 py-3">

          {/* Logo + Titel */}
          <div className="flex items-center gap-2 shrink-0">
            <Film size={20} className="text-blue-400" />
            <span className="font-bold text-sm tracking-tight text-app-text">InFocus</span>
          </div>

          {/* Suchfeld */}
          <div className="flex-1 relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted pointer-events-none"
            />
            <GlassInput
              type="text"
              placeholder={t('common.search', 'Suchen…')}
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl"
            />
          </div>

          {/* Rechte Seite: Glocke + Profil */}
          <div className="flex items-center gap-1 shrink-0">
            <NotificationBell /> {/* ✅ Glocke */}
            <button
              onClick={() => setShowProfile(true)}
              className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xs font-bold hover:bg-blue-500/30 transition-all"
              aria-label="Profil öffnen"
            >
              {user.email?.[0]?.toUpperCase() ?? 'U'}
            </button>
          </div>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="pt-[68px] pb-20 px-4">

        {/* Status Indicators */}
        {state.status === 'loading' && (
          <div className="flex items-center justify-center py-8 text-app-text-muted text-sm gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            >
              <Sparkles size={16} />
            </motion.div>
            {t('common.loading')}
          </div>
        )}

        {state.error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 mb-4">
            <span>⚠️</span>
            {state.error}
          </div>
        )}

        {/* ─── Views ─── */}
        {state.filter === 'diary' ? (
          <>
            <DiaryView
              items={state.items}
              onSelectMovie={(id) => conductor.dispatch({ type: 'SELECT_MOVIE', payload: id })}
            />
            <ActivityFeed
              items={state.items}
              onSelectMovie={(id) => conductor.dispatch({ type: 'SELECT_MOVIE', payload: id })}
            />
          </>
        ) : state.filter === 'series' ? (
          <EpisodeTracker
            items={state.items}
            onSelectShow={(id) => conductor.dispatch({ type: 'SELECT_MOVIE', payload: id })}
            onToggleEpisode={(showId, season, episode) =>
              conductor.dispatch({ type: 'TOGGLE_EPISODE', payload: { showId, season, episode } })
            }
          />
        ) : state.filter === 'lists' ? (
          <ListsOverview
            lists={state.customLists}
            items={state.items}
            conductor={conductor}
            onSelectList={(listId) => conductor.dispatch({ type: 'SELECT_LIST', payload: listId })}
          />
        ) : state.filter === 'achievements' ? (
          <AchievementsGrid items={state.items} />
        ) : state.filter === 'statistics' ? (
          <StatisticsDashboard items={state.items} />
        ) : state.filter === 'recommendations' ? (
          <Recommendations
            items={state.items}
            onAddMovie={handleAddMovie}
            conductor={conductor}
          />
        ) : (
          /* ─── Movie Grid ─── */
          <>
            {state.filter === 'list' && state.activeListId && (
              <div className="flex items-center gap-2 mb-4 text-sm text-app-text-muted">
                <Shield size={14} />
                <span>
                  Liste:{' '}
                  <span className="text-app-text font-medium">
                    {state.customLists.find(l => l.id === state.activeListId)?.name}
                  </span>
                </span>
              </div>
            )}

            {/* Tag filter: kollapsibel für mobile Usability */}
            {allTags.length > 0 && (
              <div className="mb-4">
                <button
                  onClick={() => setTagsExpanded(!tagsExpanded)}
                  className="flex items-center gap-2 text-xs text-app-text-muted uppercase tracking-wider hover:text-app-text transition-colors"
                >
                  Tags
                  {state.tagFilter && (
                    <span className="bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                      1
                    </span>
                  )}
                  {tagsExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
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
                          onClick={() =>
                            conductor.dispatch({ type: 'SET_TAG_FILTER', payload: active ? null : tag })
                          }
                          className={`px-2.5 py-1 rounded-full border text-xs transition ${
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

            {/* Poster Grid */}
            <div className="grid grid-cols-3 gap-2">
              {filteredItems.map((movie) => (
                <GlassCard
                  key={movie.id}
                  onClick={() => conductor.dispatch({ type: 'SELECT_MOVIE', payload: movie.id })}
                  className="relative aspect-[2/3] overflow-hidden p-0 cursor-pointer active:scale-95 transition-transform"
                >
                  {movie.posterPath ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w342${movie.posterPath}`}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      width={342}
                      height={513}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-app-surface text-app-text-faint text-xs">
                      No Image
                    </div>
                  )}

                  {movie.watched && (
                    <span className="absolute top-1.5 left-1.5 bg-green-500/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      ✓ Gesehen
                    </span>
                  )}

                  {movie.voteAverage && (
                    <span className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-sm text-yellow-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      ★ {movie.voteAverage.toFixed(1)}
                    </span>
                  )}

                  {/* Action Buttons */}
                  <div className="absolute bottom-1.5 right-1.5 flex flex-col gap-1">
                    {movie.source !== 'tmdb' && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            conductor.dispatch({ type: 'TOGGLE_FAVORITE', payload: movie.id });
                          }}
                          className="bg-black/60 backdrop-blur-md p-2 rounded-full transition-all hover:scale-110 shadow-lg"
                        >
                          <Heart size={12} className={movie.favorite ? 'text-red-400 fill-red-400' : 'text-white'} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            conductor.dispatch({ type: 'TOGGLE_WATCHED', payload: movie.id });
                          }}
                          className="bg-black/60 backdrop-blur-md p-2 rounded-full transition-all hover:scale-110 shadow-lg"
                        >
                          <Eye size={12} className={movie.watched ? 'text-green-400' : 'text-white'} />
                        </button>
                      </>
                    )}
                    {movie.source === 'tmdb' && !isMovieInLibrary(movie) ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAddMovie(movie); }}
                        className="bg-black/60 backdrop-blur-md p-2 rounded-full transition-all hover:scale-110 shadow-lg hover:bg-blue-500/40"
                        title={t('common.addToWatchlist', 'Zur Watchlist hinzufügen')}
                      >
                        <Plus size={12} className="text-white" />
                      </button>
                    ) : movie.source === 'tmdb' && isMovieInLibrary(movie) ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          conductor.dispatch({ type: 'SELECT_MOVIE', payload: movie.id });
                        }}
                        className="bg-black/60 backdrop-blur-md p-2 rounded-full transition-all hover:scale-110 shadow-lg hover:bg-blue-500/40"
                        title={t('common.inLibrary', 'In Bibliothek')}
                      >
                        <Shield size={12} className="text-blue-400" />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          conductor.dispatch({ type: 'REMOVE_MOVIE', payload: movie.id });
                        }}
                        className="bg-black/60 backdrop-blur-md p-2 rounded-full transition-all hover:scale-110 shadow-lg hover:bg-red-500/40"
                      >
                        <Trash2 size={12} className="text-red-400" />
                      </button>
                    )}
                  </div>

                  {/* Title Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6">
                    <p className="text-white text-[10px] font-semibold leading-tight truncate">
                      {movie.title}
                    </p>
                    <p className="text-white/50 text-[9px]">
                      {movie.mediaType === 'tv' ? t('common.series') : t('common.movie')}
                      {' · '}
                      {movie.releaseDate?.split('-')[0] || 'N/A'}
                    </p>
                    {movie.source !== 'tmdb' && movie.tags && movie.tags.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {movie.tags.slice(0, 2).map(tag => (
                          <span
                            key={tag}
                            className="bg-blue-500/30 text-blue-200 text-[8px] px-1 py-0.5 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {movie.source !== 'tmdb' &&
                      typeof movie.userRating === 'number' &&
                      movie.userRating > 0 && (
                        <p className="text-yellow-400 text-[9px] mt-0.5">★ {movie.userRating}/10</p>
                    )}
                  </div>
                </GlassCard>
              ))}
            </div>

            {/* Empty State */}
            {state.status === 'idle' && state.items.length === 0 && !state.error && (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <div className="text-5xl">🍿</div>
                <p className="text-app-text font-semibold">{t('common.noResults')}</p>
                <p className="text-app-text-muted text-sm">{t('common.beginSearch')}</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* ─── Bottom Navigation ─── */}
      <BottomNav
        currentFilter={state.filter}
        onShowAll={() => {
          setSearchTerm('');
          conductor.dispatch({ type: 'SET_FILTER', payload: 'all' });
          conductor.dispatch({ type: 'LOAD_MOVIES' });
        }}
        onShowDiary={() => conductor.dispatch({ type: 'SET_FILTER', payload: 'diary' })}
        onShowProfile={() => setShowProfile(true)}
        onShowSeries={() => conductor.dispatch({ type: 'SET_FILTER', payload: 'series' })}
        onShowLists={() => conductor.dispatch({ type: 'SET_FILTER', payload: 'lists' })}
      />

      {/* ─── Profile Modal ─── */}
      {showProfile && user && (
        <ProfileModal
          user={user}
          onClose={() => setShowProfile(false)}
          onLogout={handleLogout}
          onUpdateUser={setUser}
        />
      )}

      {/* ─── Movie Detail Modal ─── */}
      {state.selectedMovie && (
        <MovieDetailModal
          movie={state.selectedMovie}
          conductor={conductor}
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