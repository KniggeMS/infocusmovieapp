import { useEffect, useState } from 'react';
import { Sparkles, Plus } from 'lucide-react';
import { Movie } from '../types/domain';
import { getSmartRecommendations, RecommendationItem, UserPreferences } from '../services/Recommendations';
import { MovieConductor } from '../core/conductor/MovieConductor';
import { GlassCard } from './glass';

interface RecommendationsProps {
  library: Movie[];
  conductor: MovieConductor;
  onAddToLibrary: (movie: Movie) => void;
}

export function Recommendations({ library, conductor, onAddToLibrary }: RecommendationsProps) {
  const [items, setItems] = useState<RecommendationItem[]>([]);
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    setLoading(true);
    setError(null);
    getSmartRecommendations(library, apiKey)
      .then(({ items, prefs }) => {
        if (cancelled) return;
        setItems(items);
        setPrefs(prefs);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Empfehlungen konnten nicht geladen werden');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [library]);

  const isEmpty = !loading && items.length === 0;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-app-text flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Smart Empfehlungen
          </h2>
          <p className="text-app-text-muted text-sm mt-1">
            Basieren auf deinen gespeicherten Filmen, Bewertungen und Favoriten.
          </p>
        </div>
      </header>

      {prefs && prefs.totalCount > 0 && prefs.topGenres.length > 0 && (
        <div className="bg-white/5 border border-app-border rounded-2xl p-4 text-sm text-app-text-muted">
          <div className="text-xs uppercase tracking-wider text-app-text-muted mb-1">Dein Profil</div>
          <div className="text-app-text">
            {prefs.totalCount} Filme · {prefs.favoriteCount} Favoriten · {prefs.watchedCount} gesehen
            {prefs.averageUserRating !== null && (
              <span> · ⌀ Bewertung {prefs.averageUserRating.toFixed(1)}</span>
            )}
          </div>
          <div className="mt-1">
            Top-Genres:{' '}
            {prefs.topGenres.map((g, i) => (
              <span key={g.name} className="text-blue-300">
                {i > 0 ? ', ' : ''}{g.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-10 text-app-text-muted animate-pulse">Empfehlungen werden gesucht…</div>
      )}

      {error && (
        <div className="bg-red-900/40 border border-red-500/30 text-red-200 p-4 rounded-2xl text-sm">{error}</div>
      )}

      {isEmpty && !error && (
        <div className="text-center py-12 text-app-text-muted">
          <div className="text-4xl mb-3 opacity-50">✨</div>
          <p className="text-base font-medium">Noch zu wenig Daten</p>
          <p className="text-sm mt-1 opacity-60">
            Bewerte oder markiere ein paar Filme als Favorit, um Empfehlungen zu verbessern.
          </p>
        </div>
      )}

      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {items.map((rec) => (
            <RecommendationCard
              key={rec.movie.id}
              item={rec}
              onSelect={() => conductor.dispatch({ type: 'SELECT_MOVIE', payload: rec.movie.id })}
              onAdd={() => onAddToLibrary(rec.movie)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RecommendationCard({
  item,
  onSelect,
  onAdd,
}: {
  item: RecommendationItem;
  onSelect: () => void;
  onAdd: () => void;
}) {
  return (
    <GlassCard hover className="flex flex-col overflow-hidden p-0" onClick={onSelect}>
      <div className="relative">
        {item.movie.posterPath ? (
          <img src={item.movie.posterPath} alt={item.movie.title} className="w-full aspect-[2/3] object-cover transition-transform duration-700 group-hover:scale-110" />
        ) : (
          <div className="w-full aspect-[2/3] bg-app-secondary text-app-text-muted text-xs flex items-center justify-center">No image</div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Hover Quick Action */}
        <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => { e.stopPropagation(); onAdd(); }}
            className="bg-black/60 backdrop-blur-md p-2.5 rounded-full transition-all hover:scale-110 hover:bg-blue-500/40 shadow-lg"
          >
            <Plus className="w-5 h-5 text-white/80" />
          </button>
        </div>
      </div>
      <div className="p-3 flex-1 flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-app-text truncate">{item.movie.title}</h3>
        <div className="text-xs text-app-text-muted">
          {item.movie.releaseDate?.slice(0, 4)}
          {item.movie.voteAverage != null && <span> · ★ {item.movie.voteAverage.toFixed(1)}</span>}
        </div>
        <p className="text-[11px] text-app-text-muted leading-snug line-clamp-3">
          {item.reasons.join(' · ')}
        </p>
        <button
          onClick={(e) => { e.stopPropagation(); onAdd(); }}
          className="mt-auto text-xs flex items-center gap-1 bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 px-2 py-1.5 rounded-md transition"
        >
          <Plus className="w-3.5 h-3.5" /> Auf Watchlist
        </button>
      </div>
    </GlassCard>
  );
}
