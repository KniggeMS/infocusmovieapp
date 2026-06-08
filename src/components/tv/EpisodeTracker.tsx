import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Film, ChevronRight, Check, Clock } from 'lucide-react';
import { Movie, EpisodeEntry } from '../../types/domain';
import { GlassCard, GlassSection, GlassDivider } from '../glass';

interface EpisodeTrackerProps {
  items: Movie[];
  episodes: EpisodeEntry[];
  onSelectMovie: (id: string) => void;
  onToggleEpisode: (showId: number, season: number, episode: number) => void;
}

export function EpisodeTracker({ items, episodes, onSelectMovie, onToggleEpisode }: EpisodeTrackerProps) {
  const { t } = useTranslation();

  const tvShows = useMemo(() => items.filter(m => m.mediaType === 'tv'), [items]);

  const showData = useMemo(() => {
    return tvShows.map(show => {
      const showEpisodes = episodes.filter(e => e.tmdbId === show.tmdbId);
      const seasonsMap = new Map<number, EpisodeEntry[]>();
      for (const ep of showEpisodes) {
        if (!seasonsMap.has(ep.seasonNumber)) seasonsMap.set(ep.seasonNumber, []);
        seasonsMap.get(ep.seasonNumber)!.push(ep);
      }
      const seasons = Array.from(seasonsMap.entries()).sort(([a], [b]) => a - b);
      return { show, showEpisodes, seasons };
    });
  }, [tvShows, episodes]);

  if (tvShows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-app-text-muted">
        <Film size={48} className="mb-4 opacity-30" />
        <p>{t('series.noSeries')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      {showData.map(({ show, showEpisodes, seasons }, idx) => {
        const watchedCount = showEpisodes.filter(e => e.watched).length;
        const totalEpisodes = show.totalEpisodes || showEpisodes.length || 0;
        const progress = totalEpisodes > 0 ? Math.round((watchedCount / totalEpisodes) * 100) : 0;

        return (
          <GlassCard key={show.id} className="p-3">
            <div className="flex gap-3">
              {show.posterPath ? (
                <img
                  src={`https://image.tmdb.org/t/p/w92${show.posterPath}`}
                  alt={show.title}
                  className="w-14 h-20 object-cover rounded-lg flex-shrink-0"
                  loading="lazy"
                />
              ) : (
                <div className="w-14 h-20 bg-app-secondary rounded-lg flex items-center justify-center text-xs text-app-text-muted flex-shrink-0">N/A</div>
              )}

              <div className="flex-1 min-w-0">
                <button onClick={() => onSelectMovie(show.id)} className="text-left w-full">
                  <p className="font-semibold text-app-text text-sm leading-tight line-clamp-1">{show.title}</p>
                  <p className="text-xs text-app-text-muted mt-0.5">
                    {show.releaseDate?.split('-')[0] || ''} · {show.genres?.slice(0, 2).join(', ') || ''}
                  </p>
                </button>

                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-app-text-muted mb-1">
                    <span>{t('series.progress')}</span>
                    <span>{watchedCount}/{totalEpisodes} ({progress}%)</span>
                  </div>
                  <div className="h-1.5 bg-app-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-color rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {seasons.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {seasons.map(([seasonNum, eps]) => {
                      const seasonWatched = eps.filter(e => e.watched).length;
                      return (
                        <div key={seasonNum}>
                          <p className="text-xs text-app-text-muted mb-1.5">
                            {t('series.season')} {seasonNum} · {seasonWatched}/{eps.length}
                          </p>
                          <div className="grid grid-cols-8 gap-1">
                            {eps.map(ep => (
                              <button
                                key={ep.episodeNumber}
                                onClick={() => onToggleEpisode(show.tmdbId!, ep.seasonNumber, ep.episodeNumber)}
                                className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold transition-all active:scale-90 ${
                                  ep.watched
                                    ? 'bg-accent-color/20 text-accent-color border border-accent-color/30'
                                    : 'bg-app-secondary text-app-text-muted border border-app-border hover:border-accent-color/30'
                                }`}
                              >
                                {ep.watched ? <Check size={10} /> : ep.episodeNumber}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {showEpisodes.length > 0 && watchedCount < totalEpisodes && (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onSelectMovie(show.id)}
                    className="w-full glass-button rounded-lg py-2 text-xs text-app-text-muted flex items-center justify-center gap-2 mt-2"
                  >
                    <Clock size={12} />
                    {t('series.resume')}
                    <ChevronRight size={12} />
                  </motion.button>
                )}
              </div>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}