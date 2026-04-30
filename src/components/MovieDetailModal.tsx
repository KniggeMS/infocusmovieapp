import { useTranslation } from 'react-i18next';
import { Movie, CastMember, WatchProvider } from '../types/domain';
import { MovieConductor } from '../core/conductor/MovieConductor';
import { X, Play, Check, Plus, Share2, ListPlus } from 'lucide-react';

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
      {/* Backdrop Blur Layer */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-7xl bg-app-bg sm:rounded-3xl border-t sm:border border-app-border shadow-2xl h-[95vh] sm:h-[90vh] overflow-y-auto overflow-x-hidden animate-slide-up scrollbar-hide">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[120] bg-black/50 p-2 rounded-full text-app-text/80 hover:text-app-text hover:bg-app-secondary backdrop-blur-md transition-all pointer-events-auto"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Hero Header */}
        <HeroSection movie={movie} />

        {/* Action Buttons */}
        <ActionButtons
          movie={movie}
          isInLibrary={isInLibrary}
          customLists={customLists}
          onAddToLibrary={onAddToLibrary}
          onShare={onShare}
          onSelectMovie={(id) => conductor.dispatch({ type: 'SELECT_MOVIE', payload: id })}
          onAddToList={(listId) => {
            conductor.dispatch({
              type: 'ADD_TO_LIST',
              payload: { listId, movie }
            });
            onShowToast(`Added to ${customLists.find(l => l.id === listId)?.name}`, 'success');
          }}
        />

        {/* Content Body */}
        <div className="p-5 sm:p-10 space-y-6 sm:space-y-8 bg-app-bg relative z-30">
          <MetadataRow movie={movie} />
          <PlotSection movie={movie} />
          <MetadataGrid movie={movie} />
          <CastSection cast={movie.cast} />
          <WatchProvidersSection watchProviders={movie.watchProviders} />
          <RecommendationsSection
            recommendations={movie.recommendations}
            onSelectMovie={(id) => conductor.dispatch({ type: 'SELECT_MOVIE', payload: id })}
          />
        </div>
      </div>
    </div>
  );
}

// --- Sub-Components ---

function HeroSection({ movie }: { movie: Movie }) {
  console.log('Movie trailerKey:', movie.trailerKey, 'for', movie.title);
  return (
    <div className="relative w-full aspect-video overflow-hidden group">
      {/* Media Layer */}
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

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-app-bg via-app-bg/40 to-transparent" />

      {/* Title */}
      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-10 flex flex-col justify-end h-full z-20 pointer-events-none">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-5xl font-bold text-app-text mb-2 sm:mb-3 leading-tight drop-shadow-2xl line-clamp-2">
            {movie.title}
          </h2>
        </div>

        {/* Poster on desktop */}
        <div className="hidden sm:block absolute -bottom-16 right-10 w-32 aspect-[2/3] rounded-lg shadow-2xl border-2 border-app-border z-20 overflow-hidden transform rotate-3 hover:rotate-0 transition-all duration-500">
          {movie.posterPath && (
            <img
              src={movie.posterPath}
              alt="Poster"
              className="w-full h-full object-cover"
            />
          )}
        </div>
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
  onSelectMovie,
  onAddToList
}: {
  movie: Movie;
  isInLibrary: boolean;
  customLists: { id: string; name: string }[];
  onAddToLibrary: (movie: Movie) => void;
  onShare: () => void;
  onSelectMovie: (id: string) => void;
  onAddToList: (listId: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="px-5 sm:px-10 -mt-16 sm:-mt-20 relative z-[110]">
      <div className="flex flex-wrap items-center gap-3">
        {/* Play Trailer Button */}
        {movie.trailerKey ? (
          <button
            onClick={() => window.open(`https://youtube.com/watch?v=${movie.trailerKey}`, '_blank')}
            className="flex items-center gap-2 bg-app-text text-app-bg hover:bg-app-text/90 transition-all px-3 py-2 rounded-lg font-medium text-sm shadow-lg active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            {t('common.playTrailer')}
          </button>
        ) : (
          <button
            onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' official trailer')}`, '_blank')}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white transition-all px-3 py-2 rounded-lg font-medium text-sm shadow-lg active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            Trailer suchen
          </button>
        )}

        {/* Add/Library Button */}
        {isInLibrary ? (
          <button className="flex items-center gap-2 bg-app-secondary/30 backdrop-blur-md text-app-text/90 px-3 py-2 rounded-lg font-medium text-sm border border-app-border cursor-default">
            <Check className="w-4 h-4" />
            {t('common.inLibrary')}
          </button>
        ) : (
          <button
            onClick={() => onAddToLibrary(movie)}
            className="flex items-center gap-2 bg-app-secondary/60 hover:bg-app-secondary/80 backdrop-blur-md text-app-text transition-all px-3 py-2 rounded-lg font-medium text-sm border border-app-border shadow-lg hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            {t('common.addToWatchlist')}
          </button>
        )}

        {/* Share Button */}
        <button
          onClick={onShare}
          className="bg-app-secondary/60 hover:bg-app-secondary/80 backdrop-blur-md text-app-text transition-all p-2 rounded-lg border border-app-border shadow-lg hover:scale-105 active:scale-95"
          aria-label="Share"
        >
          <Share2 className="w-4 h-4" />
        </button>

        {/* Add to List */}
        <ListMenu customLists={customLists} onAddToList={onAddToList} />
      </div>
    </div>
  );
}

function ListMenu({
  customLists,
  onAddToList
}: {
  customLists: { id: string; name: string }[];
  onAddToList: (listId: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="relative group">
      <button
        className="bg-app-secondary/60 hover:bg-app-secondary/80 backdrop-blur-md text-app-text transition-all p-2.5 sm:p-3 rounded-lg border border-app-border shadow-lg hover:scale-105 active:scale-95"
        aria-label="Add to List"
      >
        <ListPlus className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Dropdown */}
      <div className="absolute bottom-full left-0 mb-2 w-48 bg-app-card-bg border border-app-border rounded-xl shadow-2xl overflow-hidden animate-fade-in z-[120] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
        <div className="p-2 border-b border-app-border text-xs font-bold text-app-text-muted uppercase bg-app-bg/50">
          Add to List
        </div>
        {customLists.length > 0 ? (
          customLists.map(list => (
            <button
              key={list.id}
              onClick={() => onAddToList(list.id)}
              className="w-full text-left px-3 py-2 text-sm text-app-text hover:bg-app-secondary transition-colors truncate"
            >
              {list.name}
            </button>
          ))
        ) : (
          <div className="p-3 text-xs text-app-text-muted text-center italic">
            No lists yet. Create one in your profile!
          </div>
        )}
      </div>
    </div>
  );
}

function MetadataRow({ movie }: { movie: Movie }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-app-text-muted mt-6 mb-4">
      {movie.releaseDate && <span>{movie.releaseDate.split('-')[0]}</span>}
      {movie.runtime && <span>• {movie.runtime} min</span>}
      {movie.voteAverage && (
        <span className="text-green-400 font-bold">
          • {Math.round(movie.voteAverage * 10)}% {t('common.match')}
        </span>
      )}
      {movie.genres?.slice(0, 2).map(g => (
        <span key={g} className="text-app-text-muted opacity-80">• {g}</span>
      ))}
    </div>
  );
}

function PlotSection({ movie }: { movie: Movie }) {
  const { t } = useTranslation();

  return (
    <div>
      <h3 className="text-sm font-bold text-app-text-muted uppercase tracking-wider mb-2 sm:mb-3">
        {t('common.plot')}
      </h3>
      <p className="text-app-text leading-relaxed text-base sm:text-lg font-light">
        {movie.overview || 'No overview available.'}
      </p>
    </div>
  );
}

function MetadataGrid({ movie }: { movie: Movie }) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-4 border-y border-app-border">
      {movie.director && (
        <div>
          <h3 className="text-xs font-bold text-app-text-muted uppercase mb-1">
            {movie.mediaType === 'tv' ? t('common.creator') : t('common.director')}
          </h3>
          <div className="text-app-text font-medium">{movie.director}</div>
        </div>
      )}
      <div>
        <h3 className="text-xs font-bold text-app-text-muted uppercase mb-1">{t('common.released')}</h3>
        <div className="text-app-text font-medium">{movie.releaseDate?.split('-')[0] || 'N/A'}</div>
      </div>
      <div>
        <h3 className="text-xs font-bold text-app-text-muted uppercase mb-1">{t('common.type')}</h3>
        <div className="text-app-text font-medium">
          {movie.mediaType === 'tv' ? t('common.series') : t('common.movie')}
        </div>
      </div>
    </div>
  );
}

function CastSection({ cast }: { cast?: CastMember[] }) {
  const { t } = useTranslation();

  if (!cast || cast.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-bold text-app-text-muted uppercase tracking-wider mb-4">
        {t('common.cast')}
      </h3>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
        {cast.map((actor, idx) => (
          <div key={idx} className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-app-secondary border border-app-border shadow-lg">
              {actor.profilePath ? (
                <img src={actor.profilePath} alt={actor.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-app-text-muted">N/A</div>
              )}
            </div>
            <div className="text-center">
              <div className="text-xs font-bold text-app-text truncate w-full">{actor.name}</div>
              <div className="text-[10px] text-app-text-muted truncate w-full">{actor.character}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WatchProvidersSection({ watchProviders }: { watchProviders?: { flatrate?: WatchProvider[]; rent?: WatchProvider[]; buy?: WatchProvider[] } }) {
  const { t } = useTranslation();

  if (!watchProviders) return null;

  const hasProviders =
    watchProviders.flatrate?.length ||
    watchProviders.rent?.length ||
    watchProviders.buy?.length;

  return (
    <div className="bg-app-secondary rounded-2xl p-6 border border-app-border">
      <h3 className="text-sm font-bold text-app-text-muted uppercase tracking-wider mb-4">
        {t('common.providers')}
      </h3>

      <div className="space-y-6">
        {watchProviders.flatrate && watchProviders.flatrate.length > 0 && (
          <ProviderRow label="Stream" providers={watchProviders.flatrate} />
        )}
        {watchProviders.rent && watchProviders.rent.length > 0 && (
          <ProviderRow label="Rent" providers={watchProviders.rent} grayscale />
        )}
        {watchProviders.buy && watchProviders.buy.length > 0 && (
          <ProviderRow label="Buy" providers={watchProviders.buy} grayscale />
        )}

        {!hasProviders && (
          <div className="text-sm text-app-text-muted italic">
            No streaming information available for your region.
          </div>
        )}
      </div>
    </div>
  );
}

function ProviderRow({
  label,
  providers,
  grayscale = false
}: {
  label: string;
  providers: WatchProvider[];
  grayscale?: boolean;
}) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-xs font-bold text-app-text-muted w-12 shrink-0 uppercase">{label}</span>
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        {providers.map((provider, idx) => (
          <img
            key={idx}
            src={provider.logoPath}
            alt={provider.providerName}
            title={provider.providerName}
            className={`w-12 h-12 rounded-xl shadow-lg border border-app-border hover:scale-110 transition-transform cursor-help ${
              grayscale ? 'opacity-70 hover:opacity-100 grayscale hover:grayscale-0' : ''
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function RecommendationsSection({
  recommendations,
  onSelectMovie
}: {
  recommendations?: Movie[];
  onSelectMovie: (id: string) => void;
}) {
  const { t } = useTranslation();

  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-bold text-app-text-muted uppercase tracking-wider mb-4">
        {t('common.recommendations')}
      </h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
        {recommendations.slice(0, 5).map((rec) => (
          <div
            key={rec.id}
            onClick={() => onSelectMovie(rec.id)}
            className="flex flex-col gap-2 cursor-pointer group"
          >
            <div className="aspect-[2/3] rounded-xl overflow-hidden bg-app-secondary border border-app-border relative shadow-lg">
              {rec.posterPath ? (
                <img
                  src={rec.posterPath}
                  alt={rec.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-app-text-muted">N/A</div>
              )}
            </div>
            <div className="text-xs font-bold text-app-text-muted truncate group-hover:text-blue-400 transition-colors">
              {rec.title}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
