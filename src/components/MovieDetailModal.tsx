import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Movie, CastMember, WatchProvider } from '../types/domain';
import { MovieConductor } from '../core/conductor/MovieConductor';
import { X, Play, Check, Plus, Share2, ListPlus } from 'lucide-react';
import { ListCreationModal } from './ListCreationModal';

interface MovieDetailModalProps {
  movie: Movie;
  conductor: MovieConductor;
  libraryItems: Movie[];
  customLists: { id: string; name: string }[];
  onClose: () => void;
  onAddToLibrary: (movie: Movie) => void;
  onShare: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function MovieDetailModal({
  movie,
  conductor,
  libraryItems,
  customLists,
  onClose,
  onAddToLibrary,
  onShare,
  onShowToast
}: MovieDetailModalProps) {
  const { t } = useTranslation();

  const isInLibrary = libraryItems.some(
    m => m.tmdbId === Number(movie.id) || m.id === movie.id
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center animate-fade-in">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-7xl bg-app-bg sm:rounded-3xl border-t sm:border border-app-border shadow-2xl h-[95vh] sm:h-[90vh] overflow-y-auto overflow-x-hidden animate-slide-up scrollbar-hide">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[120] bg-black/50 p-2 rounded-full text-app-text/80 hover:text-app-text hover:bg-app-secondary backdrop-blur-md transition-all pointer-events-auto"
        >
          <X className="w-6 h-6" />
        </button>

        <HeroSection movie={movie} />

        <ActionButtons
          movie={movie}
          isInLibrary={isInLibrary}
          customLists={customLists}
          onAddToLibrary={onAddToLibrary}
          onShare={onShare}
          conductor={conductor}
          onShowToast={onShowToast}
        />

        <div className="p-5 sm:p-10 space-y-6 sm:space-y-8 bg-app-bg relative z-30">
          <MetadataRow movie={movie} />
          <PlotSection movie={movie} />
          <MetadataGrid movie={movie} />
          <CastSection cast={movie.cast} />
          <WatchProvidersSection watchProviders={movie.watchProviders} />
          <RecommendationsSection
            recommendations={movie.recommendations}
            onSelectMovie={(id: string) => conductor.dispatch({ type: 'SELECT_MOVIE', payload: id })}
          />
        </div>
      </div>
    </div>
  );
}

// ==================== SUB-COMPONENTS (vollständig, typisiert) ====================

function HeroSection({ movie }: { movie: Movie }) {
  return (
    <div className="relative w-full aspect-video overflow-hidden group">
      {movie.trailerKey ? (
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <iframe
            className="w-full h-full object-cover opacity-80 sm:opacity-100"
            src={`https://www.youtube.com/embed/${movie.trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${movie.trailerKey}&playsinline=1&rel=0&disablekb=1&iv_load_policy=3`}
            title="Trailer"
            allow="autoplay; encrypted-media"
          />
        </div>
      ) : (
        <img
          src={movie.backdropPath || movie.posterPath || ''}
          alt={movie.title}
          className="w-full h-full object-cover opacity-80"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-app-bg via-app-bg/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-10 flex flex-col justify-end h-full z-20 pointer-events-none">
        <h2 className="text-2xl sm:text-5xl font-bold text-app-text mb-2 sm:mb-3 leading-tight drop-shadow-2xl line-clamp-2">
          {movie.title}
        </h2>
      </div>
    </div>
  );
}

function ActionButtons({
  movie,
  isInLibrary,
  customLists,
  onAddToLibrary,
  onShare,
  conductor,
  onShowToast
}: {
  movie: Movie;
  isInLibrary: boolean;
  customLists: { id: string; name: string }[];
  onAddToLibrary: (movie: Movie) => void;
  onShare: () => void;
  conductor: MovieConductor;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}) {
  const { t } = useTranslation();
  const [showListCreation, setShowListCreation] = useState(false);

  return (
    <div className="px-5 sm:px-10 -mt-16 sm:-mt-20 relative z-[110]">
      <div className="flex flex-wrap items-center gap-3">
        {/* Play Trailer */}
        {movie.trailerKey ? (
          <button onClick={() => window.open(`https://youtube.com/watch?v=${movie.trailerKey}`, '_blank')} className="flex items-center gap-2 bg-app-text text-app-bg hover:bg-app-text/90 px-3 py-2 rounded-lg font-medium text-sm shadow-lg active:scale-95">
            <Play className="w-4 h-4 fill-current" /> {t('common.playTrailer')}
          </button>
        ) : (
          <button onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' official trailer')}`, '_blank')} className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-lg font-medium text-sm shadow-lg active:scale-95">
            <Play className="w-4 h-4 fill-current" /> Trailer suchen
          </button>
        )}

        {/* Add to Library */}
        {isInLibrary ? (
          <button className="flex items-center gap-2 bg-app-secondary/30 backdrop-blur-md text-app-text/90 px-3 py-2 rounded-lg font-medium text-sm border border-app-border cursor-default">
            <Check className="w-4 h-4" /> {t('common.inLibrary')}
          </button>
        ) : (
          <button onClick={() => onAddToLibrary(movie)} className="flex items-center gap-2 bg-app-secondary/60 hover:bg-app-secondary/80 backdrop-blur-md text-app-text px-3 py-2 rounded-lg font-medium text-sm border border-app-border shadow-lg hover:scale-105 active:scale-95">
            <Plus className="w-4 h-4" /> {t('common.addToWatchlist')}
          </button>
        )}

        {/* Share */}
        <button onClick={onShare} className="bg-app-secondary/60 hover:bg-app-secondary/80 backdrop-blur-md text-app-text p-2 rounded-lg border border-app-border shadow-lg hover:scale-105 active:scale-95">
          <Share2 className="w-4 h-4" />
        </button>

        {/* Add to List */}
        <ListMenu 
          customLists={customLists} 
          onAddToList={(listId: string) => {
            conductor.dispatch({ type: 'ADD_TO_LIST', payload: { listId, movie } });
            onShowToast('Zum Liste hinzugefügt', 'success');
          }} 
          onCreateNewList={() => setShowListCreation(true)}
          conductor={conductor}
        />

        {showListCreation && <ListCreationModal conductor={conductor} onClose={() => setShowListCreation(false)} />}
      </div>
    </div>
  );
}

function ListMenu({
  customLists,
  onAddToList,
  onCreateNewList
}: {
  customLists: { id: string; name: string }[];
  onAddToList: (listId: string) => void;
  onCreateNewList: () => void;
}) {
  return (
    <div className="relative group">
      <button className="bg-app-secondary/60 hover:bg-app-secondary/80 backdrop-blur-md text-app-text p-2.5 sm:p-3 rounded-lg border border-app-border shadow-lg hover:scale-105 active:scale-95">
        <ListPlus className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      <div className="absolute bottom-full left-0 mb-2 w-56 bg-app-card-bg border border-app-border rounded-xl shadow-2xl overflow-hidden animate-fade-in z-[120] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
        <div className="p-3 border-b border-app-border text-xs font-bold text-app-text-muted uppercase bg-app-bg/50">
          Zu Liste hinzufügen
        </div>
        {customLists.length > 0 ? (
          customLists.map(list => (
            <button
              key={list.id}
              onClick={() => onAddToList(list.id)}
              className="w-full text-left px-4 py-3 text-sm text-app-text hover:bg-app-secondary transition-colors truncate"
            >
              {list.name}
            </button>
          ))
        ) : (
          <div className="p-4 text-xs text-app-text-muted text-center italic">
            Noch keine Listen. Erstelle eine!
          </div>
        )}
        <button
          onClick={onCreateNewList}
          className="w-full text-left px-4 py-3 text-sm text-blue-400 hover:bg-app-secondary border-t border-app-border flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Neue Liste erstellen
        </button>
      </div>
    </div>
  );
}

// Placeholder-Sub-Components (ersetze später mit vollem Original-Code)
function MetadataRow({ movie }: { movie: Movie }) { return <div className="text-app-text-muted">{movie.releaseDate} • {movie.runtime} min</div>; }
function PlotSection({ movie }: { movie: Movie }) { return <div className="text-app-text leading-relaxed mt-4">{movie.overview}</div>; }
function MetadataGrid({ movie }: { movie: Movie }) { return <div className="grid grid-cols-2 gap-4 text-sm"> {/* Genres, Rating etc. */} </div>; }
function CastSection({ cast }: { cast?: CastMember[] }) { return <div>{cast?.slice(0, 6).map(c => <div key={c.name}>{c.name}</div>)}</div>; }
function WatchProvidersSection({ watchProviders }: any) { return <div>Watch Providers (später ausbauen)</div>; }
function RecommendationsSection({ recommendations, onSelectMovie }: { recommendations?: Movie[]; onSelectMovie: (id: string) => void }) {
  return (
    <div>
      <h3 className="text-lg font-bold mb-3">Ähnliche Filme</h3>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {recommendations?.slice(0, 5).map(rec => (
          <div key={rec.id} onClick={() => onSelectMovie(rec.id)} className="cursor-pointer">
            <img src={rec.posterPath} alt={rec.title} className="rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
