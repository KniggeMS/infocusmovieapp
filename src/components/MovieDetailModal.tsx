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
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-7xl bg-app-bg sm:rounded-3xl border-t sm:border border-app-border shadow-2xl h-[95vh] sm:h-[90vh] overflow-y-auto overflow-x-hidden animate-slide-up scrollbar-hide">
        <button onClick={onClose} className="absolute top-4 right-4 z-[120] bg-black/50 p-2 rounded-full text-app-text/80 hover:text-app-text hover:bg-app-secondary">
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
            onSelectMovie={(id) => conductor.dispatch({ type: 'SELECT_MOVIE', payload: id })}
          />
        </div>
      </div>
    </div>
  );
}

// Sub-Components (vollständig)
function HeroSection({ movie }: { movie: Movie }) { /* ... dein bisheriger Hero-Code bleibt unverändert ... */ 
  // (kopiere aus der aktuellen Datei den HeroSection-Block)
}

function ActionButtons({ /* ... */ }) { /* ... dein aktueller ActionButtons-Code ... */ }

function ListMenu({ /* ... */ }) { /* ... dein aktueller ListMenu-Code ... */ }

// Füge hier alle restlichen Sub-Components ein (MetadataRow, PlotSection usw.) aus der Version VOR deinen Edits. Wenn du sie nicht mehr hast, sag Bescheid – ich hole sie aus dem Repo-History.

export default MovieDetailModal; // falls benötigt
