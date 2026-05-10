import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Movie, CastMember, WatchProvider } from '../types/domain';
import { MovieConductor } from '../core/conductor/MovieConductor';
import { X, Play, Check, Plus, Share2, ListPlus, Star, Tag, NotebookPen } from 'lucide-react';
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

export const MovieDetailModal = React.memo(({
  movie,
  conductor,
  libraryItems,
  customLists,
  onClose,
  onAddToLibrary,
  onShare,
  onShowToast
}: MovieDetailModalProps) => {
  const { t } = useTranslation();

  const isInLibrary = useMemo(() => 
    libraryItems.some(m => m.tmdbId === Number(movie.id) || m.id === movie.id),
    [libraryItems, movie.id]
  );

  const handleSelectMovie = useCallback((id: string) => {
    conductor.dispatch({ type: 'SELECT_MOVIE', payload: id });
  }, [conductor]);

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center animate-fade-in">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-7xl bg-app-bg sm:rounded-3xl border-t sm:border border-app-border shadow-2xl h-[95vh] sm:h-[90vh] overflow-y-auto overflow-x-hidden animate-slide-up scrollbar-hide">
        <button
          onClick={onClose}
          aria-label={t('common.close', 'Schließen')}
          className="fixed sm:absolute top-3 right-3 sm:top-4 sm:right-4 z-[140] bg-black/60 p-2 rounded-full text-app-text/90 hover:text-app-text hover:bg-app-secondary backdrop-blur-md transition-all pointer-events-auto"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <HeroSection movie={movie} />

        <div className="px-5 sm:px-10 pt-4 sm:pt-6 pb-2 bg-app-bg relative z-30">
          <h2 className="text-2xl sm:text-4xl font-bold text-app-text leading-tight break-words pr-12 sm:pr-16">
            {movie.title}
          </h2>
        </div>

        <ActionButtons
          movie={movie}
          isInLibrary={isInLibrary}
          customLists={customLists}
          onAddToLibrary={onAddToLibrary}
          onShare={onShare}
          conductor={conductor}
          onShowToast={onShowToast}
        />

        <div className="px-5 sm:px-10 pt-4 pb-6 sm:pt-6 sm:pb-10 space-y-5 sm:space-y-6 bg-app-bg relative z-30">
          <MetadataRow movie={movie} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-5 sm:space-y-6">
              <PlotSection movie={movie} />
              <CastSection cast={movie.cast} />
            </div>
            <div className="space-y-5 sm:space-y-6">
              <MetadataGrid movie={movie} />
              <WatchProvidersSection watchProviders={movie.watchProviders} />
            </div>
          </div>

          {movie.source === 'database' && (
            <PersonalSection
              movie={movie}
              conductor={conductor}
              onShowToast={onShowToast}
            />
          )}

          <RecommendationsSection
            recommendations={movie.recommendations}
            onSelectMovie={handleSelectMovie}
          />
        </div>
      </div>
    </div>
  );
});

MovieDetailModal.displayName = 'MovieDetailModal';

// --- Optimized Sub-Components ---

const HeroSection = React.memo(({ movie }: { movie: Movie }) => {
  return (
    <div className="relative w-full aspect-video max-h-[40vh] sm:max-h-[45vh] overflow-hidden bg-black">
      {movie.trailerKey ? (
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <iframe
            className="w-full h-full object-cover"
            src={`https://www.youtube.com/embed/${movie.trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${movie.trailerKey}&playsinline=1&rel=0&disablekb=1&iv_load_policy=3`}
            title="Trailer"
            allow="autoplay; encrypted-media"
            loading="lazy"
          />
        </div>
      ) : (
        <img
          src={movie.backdropPath || movie.posterPath || ''}
          alt={movie.title}
          className="w-full h-full object-cover"
          loading="eager"
        />
      )}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-app-bg to-transparent pointer-events-none" />
    </div>
  );
});

HeroSection.displayName = 'HeroSection';

const ActionButtons = React.memo(({
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
}) => {
  const { t } = useTranslation();
  const [showListCreation, setShowListCreation] = useState(false);

  const handleAddToList = useCallback((listId: string) => {
    conductor.dispatch({ type: 'ADD_TO_LIST', payload: { listId, movie } });
    onShowToast(t('common.addedToList', 'Zur Liste hinzugefügt'), 'success');
  }, [conductor, movie, onShowToast, t]);

  return (
    <div className="px-5 sm:px-10 pt-1 pb-2 relative z-30">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {movie.trailerKey ? (
          <button 
            onClick={() => window.open(`https://youtube.com/watch?v=${movie.trailerKey}`, '_blank')} 
            className="flex items-center gap-2 bg-app-text text-app-bg hover:bg-app-text/90 px-3 py-2 rounded-lg font-medium text-sm shadow-lg active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-current" /> {t('common.playTrailer')}
          </button>
        ) : (
          <button 
            onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' official trailer')}`, '_blank')} 
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-lg font-medium text-sm shadow-lg active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-current" /> {t('common.searchTrailer', 'Trailer suchen')}
          </button>
        )}

        {isInLibrary ? (
          <button className="flex items-center gap-2 bg-app-secondary/30 backdrop-blur-md text-app-text/90 px-3 py-2 rounded-lg font-medium text-sm border border-app-border cursor-default">
            <Check className="w-4 h-4" /> {t('common.inLibrary')}
          </button>
        ) : (
          <button 
            onClick={() => onAddToLibrary(movie)} 
            className="flex items-center gap-2 bg-app-secondary/60 hover:bg-app-secondary/80 backdrop-blur-md text-app-text px-3 py-2 rounded-lg font-medium text-sm border border-app-border shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" /> {t('common.addToWatchlist')}
          </button>
        )}

        <button 
          onClick={onShare} 
          className="bg-app-secondary/60 hover:bg-app-secondary/80 backdrop-blur-md text-app-text p-2 rounded-lg border border-app-border shadow-lg hover:scale-105 active:scale-95 transition-all"
          aria-label={t('common.share', 'Teilen')}
        >
          <Share2 className="w-4 h-4" />
        </button>

        <ListMenu
          customLists={customLists}
          onAddToList={handleAddToList}
          onCreateNewList={useCallback(() => setShowListCreation(true), [])}
        />

        {showListCreation && (
          <ListCreationModal 
            conductor={conductor} 
            onClose={useCallback(() => setShowListCreation(false), [])} 
          />
        )}
      </div>
    </div>
  );
});

ActionButtons.displayName = 'ActionButtons';

const ListMenu = React.memo(({
  customLists,
  onAddToList,
  onCreateNewList
}: {
  customLists: { id: string; name: string }[];
  onAddToList: (listId: string) => void;
  onCreateNewList: () => void;
}) => {
  const { t } = useTranslation();

  return (
    <div className="relative group">
      <button 
        className="bg-app-secondary/60 hover:bg-app-secondary/80 backdrop-blur-md text-app-text p-2.5 sm:p-3 rounded-lg border border-app-border shadow-lg hover:scale-105 active:scale-95 transition-all"
        aria-label={t('common.addToList', 'Zu Liste hinzufügen')}
      >
        <ListPlus className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      <div className="absolute bottom-full left-0 mb-2 w-56 bg-app-card-bg border border-app-border rounded-xl shadow-2xl overflow-hidden animate-fade-in z-[120] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
        <div className="p-3 border-b border-app-border text-xs font-bold text-app-text-muted uppercase bg-app-bg/50">
          {t('common.addToList', 'Zu Liste hinzufügen')}
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
            {t('common.noListsYet', 'Noch keine Listen. Erstelle eine!')}
          </div>
        )}
        <button
          onClick={onCreateNewList}
          className="w-full text-left px-4 py-3 text-sm text-blue-400 hover:bg-app-secondary border-t border-app-border flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> {t('common.createNewList', 'Neue Liste erstellen')}
        </button>
      </div>
    </div>
  );
});

ListMenu.displayName = 'ListMenu';

const MetadataRow = React.memo(({ movie }: { movie: Movie }) => {
  const year = useMemo(() => movie.releaseDate?.slice(0, 4), [movie.releaseDate]);
  
  const parts = useMemo(() => {
    const p: string[] = [];
    if (year) p.push(year);
    if (movie.runtime) p.push(`${movie.runtime} min`);
    if (movie.mediaType) p.push(movie.mediaType === 'tv' ? 'Serie' : 'Film');
    return p;
  }, [year, movie.runtime, movie.mediaType]);

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-app-text-muted">
      {parts.map((p, i) => (
        <span key={i} className="px-2.5 py-1 bg-app-secondary/40 rounded-full border border-app-border">{p}</span>
      ))}
      {movie.voteAverage != null && (
        <span className="flex items-center gap-1 text-yellow-400 font-medium">
          ★ {movie.voteAverage.toFixed(1)}
        </span>
      )}
      {!!movie.tags?.length && (
        <div className="flex flex-wrap gap-1.5">
          {movie.tags.slice(0, 4).map(tag => (
            <span key={tag} className="text-xs bg-blue-500/10 text-blue-300 border border-blue-500/30 rounded-full px-2 py-0.5">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
});

MetadataRow.displayName = 'MetadataRow';

const PlotSection = React.memo(({ movie }: { movie: Movie }) => {
  const { t } = useTranslation();
  if (!movie.overview) return null;
  return (
    <section>
      <h3 className="text-base font-semibold text-app-text-muted uppercase tracking-wider mb-2">
        {t('common.plot', 'Handlung')}
      </h3>
      <p className="text-app-text leading-relaxed text-sm sm:text-base">{movie.overview}</p>
    </section>
  );
});

PlotSection.displayName = 'PlotSection';

const MetadataGrid = React.memo(({ movie }: { movie: Movie }) => {
  const { t } = useTranslation();
  
  const items = useMemo(() => [
    { label: t('common.director', 'Regie'), value: movie.director || null },
    { label: t('common.genres', 'Genres'), value: movie.genres?.join(', ') || null },
    { label: t('common.released', 'Veröffentlichung'), value: movie.releaseDate || null },
  ].filter(i => i.value), [movie.director, movie.genres, movie.releaseDate, t]);

  if (items.length === 0) return null;

  return (
    <section className="bg-app-secondary/30 border border-app-border rounded-2xl p-4 space-y-3 text-sm">
      {items.map(i => (
        <div key={i.label}>
          <div className="text-app-text-muted text-xs uppercase tracking-wider">{i.label}</div>
          <div className="text-app-text">{i.value}</div>
        </div>
      ))}
    </section>
  );
});

MetadataGrid.displayName = 'MetadataGrid';

const CastSection = React.memo(({ cast }: { cast?: CastMember[] }) => {
  const { t } = useTranslation();
  if (!cast?.length) return null;
  return (
    <section>
      <h3 className="text-base font-semibold text-app-text-muted uppercase tracking-wider mb-3">
        {t('common.cast', 'Besetzung')}
      </h3>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {cast.slice(0, 6).map(c => (
          <div key={c.name} className="text-center">
            {c.profilePath ? (
              <img 
                src={c.profilePath} 
                alt={c.name} 
                className="rounded-xl aspect-[2/3] object-cover" 
                loading="lazy"
              />
            ) : (
              <div className="rounded-xl aspect-[2/3] bg-app-secondary flex items-center justify-center text-app-text-muted text-xs">
                No image
              </div>
            )}
            <div className="text-xs text-app-text mt-1 truncate">{c.name}</div>
            <div className="text-[10px] text-app-text-muted truncate">{c.character}</div>
          </div>
        ))}
      </div>
    </section>
  );
});

CastSection.displayName = 'CastSection';

const WatchProvidersSection = React.memo(({ watchProviders }: { watchProviders?: Movie['watchProviders'] }) => {
  const { t } = useTranslation();
  const flat = watchProviders?.flatrate || [];
  const rent = watchProviders?.rent || [];
  const buy = watchProviders?.buy || [];
  
  if (flat.length === 0 && rent.length === 0 && buy.length === 0) return null;

  const renderRow = (label: string, items: WatchProvider[]) =>
    items.length === 0 ? null : (
      <div>
        <div className="text-xs uppercase tracking-wider text-app-text-muted mb-2">{label}</div>
        <div className="flex flex-wrap gap-2">
          {items.slice(0, 6).map(p => (
            <img 
              key={p.providerName} 
              title={p.providerName} 
              src={p.logoPath} 
              alt={p.providerName} 
              className="w-9 h-9 rounded-lg object-contain bg-white/5 border border-app-border p-1" 
              loading="lazy"
            />
          ))}
        </div>
      </div>
    );

  return (
    <section className="bg-app-secondary/30 border border-app-border rounded-2xl p-4 space-y-3">
      <h3 className="text-sm font-semibold text-app-text-muted uppercase tracking-wider">
        {t('common.whereToWatch', 'Wo zu sehen')}
      </h3>
      {renderRow(t('common.streaming', 'Streaming'), flat)}
      {renderRow(t('common.rent', 'Leihen'), rent)}
      {renderRow(t('common.buy', 'Kaufen'), buy)}
    </section>
  );
});

WatchProvidersSection.displayName = 'WatchProvidersSection';

const RecommendationsSection = React.memo(({ 
  recommendations, 
  onSelectMovie 
}: { 
  recommendations?: Movie[]; 
  onSelectMovie: (id: string) => void 
}) => {
  const { t } = useTranslation();
  if (!recommendations?.length) return null;
  return (
    <section>
      <h3 className="text-base font-semibold text-app-text-muted uppercase tracking-wider mb-3">
        {t('common.similarMovies', 'Ähnliche Filme')}
      </h3>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {recommendations.slice(0, 5).map(rec => (
          <div key={rec.id} onClick={() => onSelectMovie(rec.id)} className="cursor-pointer group">
            {rec.posterPath ? (
              <img 
                src={rec.posterPath} 
                alt={rec.title} 
                className="rounded-lg aspect-[2/3] object-cover transition-transform group-hover:scale-105" 
                loading="lazy"
              />
            ) : (
              <div className="rounded-lg aspect-[2/3] bg-app-secondary text-app-text-muted text-xs flex items-center justify-center">
                No image
              </div>
            )}
            <div className="text-xs text-app-text mt-1 truncate">{rec.title}</div>
          </div>
        ))}
      </div>
    </section>
  );
});

RecommendationsSection.displayName = 'RecommendationsSection';

const PersonalSection = React.memo(({
  movie,
  conductor,
  onShowToast,
}: {
  movie: Movie;
  conductor: MovieConductor;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}) => {
  const { t } = useTranslation();
  const [rating, setRating] = useState<number | null>(movie.userRating ?? null);
  const [notes, setNotes] = useState<string>(movie.notes ?? '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(movie.tags ?? []);
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    setRating(movie.userRating ?? null);
    setNotes(movie.notes ?? '');
    setTags(movie.tags ?? []);
  }, [movie.id, movie.userRating, movie.notes, movie.tags]);

  const persistRating = useCallback((value: number | null) => {
    setRating(value);
    conductor.dispatch({ type: 'UPDATE_USER_RATING', payload: { id: movie.id, userRating: value } });
  }, [conductor, movie.id]);

  const persistNotes = useCallback(async () => {
    setSavingNotes(true);
    await conductor.dispatch({ type: 'UPDATE_NOTES', payload: { id: movie.id, notes } });
    setSavingNotes(false);
    onShowToast(t('common.noteSaved', 'Notiz gespeichert'), 'success');
  }, [conductor, movie.id, notes, onShowToast, t]);

  const addTag = useCallback((raw: string) => {
    const cleaned = raw.trim().replace(/^#+/, '').toLowerCase();
    if (!cleaned || tags.includes(cleaned)) return;
    const next = [...tags, cleaned].slice(0, 12);
    setTags(next);
    setTagInput('');
    conductor.dispatch({ type: 'UPDATE_TAGS', payload: { id: movie.id, tags: next } });
  }, [conductor, movie.id, tags]);

  const removeTag = useCallback((tag: string) => {
    const next = tags.filter(t => t !== tag);
    setTags(next);
    conductor.dispatch({ type: 'UPDATE_TAGS', payload: { id: movie.id, tags: next } });
  }, [conductor, movie.id, tags]);

  return (
    <section className="bg-app-secondary/30 border border-app-border rounded-2xl p-4 sm:p-5 space-y-5">
      <h3 className="text-base font-semibold text-app-text uppercase tracking-wider flex items-center gap-2">
        <NotebookPen className="w-4 h-4 text-blue-400" /> {t('common.myEntry', 'Mein Eintrag')}
      </h3>

      {/* Rating */}
      <div>
        <div className="text-xs text-app-text-muted uppercase tracking-wider mb-2 flex items-center gap-2">
          <Star className="w-3.5 h-3.5" /> {t('common.myRating', 'Eigene Bewertung')}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {Array.from({ length: 10 }, (_, i) => i + 1).map(i => {
            const active = rating !== null && i <= rating;
            return (
              <button
                key={i}
                onClick={() => persistRating(rating === i ? null : i)}
                aria-label={`${t('common.rating', 'Bewertung')} ${i}`}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md text-xs font-bold transition-all active:scale-90 ${
                  active
                    ? 'bg-yellow-400/90 text-black'
                    : 'bg-app-secondary/60 text-app-text-muted hover:bg-app-secondary'
                }`}
              >
                {i}
              </button>
            );
          })}
          {rating !== null && (
            <button
              onClick={() => persistRating(null)}
              className="ml-2 text-xs text-app-text-muted underline hover:text-app-text transition-colors"
            >
              {t('common.reset', 'zurücksetzen')}
            </button>
          )}
        </div>
      </div>

      {/* Notes */}
      <div>
        <div className="text-xs text-app-text-muted uppercase tracking-wider mb-2">{t('common.note', 'Notiz')}</div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={persistNotes}
          placeholder={t('common.notePlaceholder', 'Was soll dir an diesem Film im Kopf bleiben?')}
          rows={3}
          className="w-full bg-app-bg border border-app-border rounded-lg p-3 text-sm text-app-text placeholder-app-text-muted focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
        <div className="text-[11px] text-app-text-muted mt-1">
          {savingNotes ? t('common.saving', 'Speichere…') : t('common.autoSaveHint', 'Wird beim Verlassen des Felds automatisch gespeichert.')}
        </div>
      </div>

      {/* Tags */}
      <div>
        <div className="text-xs text-app-text-muted uppercase tracking-wider mb-2 flex items-center gap-2">
          <Tag className="w-3.5 h-3.5" /> {t('common.tags', 'Tags')}
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map(tag => (
            <button
              key={tag}
              onClick={() => removeTag(tag)}
              className="text-xs bg-blue-500/10 text-blue-300 border border-blue-500/30 rounded-full px-2 py-1 hover:bg-red-500/20 hover:text-red-300 transition-all"
              title={t('common.remove', 'Entfernen')}
            >
              #{tag} ✕
            </button>
          ))}
        </div>
        <input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              addTag(tagInput);
            }
          }}
          placeholder={t('common.tagPlaceholder', 'Tag eingeben und Enter drücken')}
          className="w-full bg-app-bg border border-app-border rounded-lg p-2 text-sm text-app-text placeholder-app-text-muted focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>
    </section>
  );
});

PersonalSection.displayName = 'PersonalSection';

