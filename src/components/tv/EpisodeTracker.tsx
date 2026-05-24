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
      <div className="text-center py-20 text-app-text-muted">
        <Film className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">{t('series.noSeries')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showData.map(({ show, showEpisodes, seasons }, idx) => {
        const watchedCount = showEpisodes.filter(e => e.watched).length;
        const totalEpisodes = show.totalEpisodes || showEpisodes.length || 0;
        const progress = totalEpisodes > 0 ? Math.round((watchedCount / totalEpisodes) * 100) : 0;

        return (
          <motion.div
            key={show.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.3 }}
          >
            <GlassCard className="overflow-hidden">
              <div className="flex items-center gap-3 p-4">
                <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0 bg-app-secondary">
                  {show.posterPath ? (
                    <img src={show.posterPath} alt={show.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[8px] text-app-text-muted">N/A</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3
                      className="font-bold text-sm text-app-text truncate cursor-pointer hover:text-accent-glow transition-colors"
                      onClick={() => onSelectMovie(show.id)}
                    >
                      {show.title}
                    </h3>
                    <ChevronRight className="w-4 h-4 text-app-text-muted shrink-0" />
                  </div>
                  <p className="text-[10px] text-app-text-muted mt-0.5">
                    {show.releaseDate?.split('-')[0] || ''} · {show.genres?.slice(0, 2).join(', ') || ''}
                  </p>
                </div>
              </div>

              <div className="px-4 pb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-app-text-muted">{t('series.progress')}</span>
                  <span className="text-[10px] text-app-text-muted">{watchedCount}/{totalEpisodes} ({progress}%)</span>
                </div>
                <div className="h-1.5 rounded-full bg-app-secondary overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-accent-color"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {seasons.length > 0 && (
                <div className="px-4 pb-4 space-y-2">
                  {seasons.map(([seasonNum, eps]) => {
                    const seasonWatched = eps.filter(e => e.watched).length;
                    return (
                      <div key={seasonNum}>
                        <p className="text-[10px] font-bold text-app-text-muted uppercase tracking-wider mb-1">
                          {t('series.season')} {seasonNum} · {seasonWatched}/{eps.length}
                        </p>
                        <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5">
                          {eps.map(ep => (
                            <button
                              key={`${ep.seasonNumber}-${ep.episodeNumber}`}
                              onClick={() => onToggleEpisode(show.tmdbId!, ep.seasonNumber, ep.episodeNumber)}
                              className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold transition-all active:scale-90 ${
                                ep.watched
                                  ? 'bg-accent-color/20 text-accent-color border border-accent-color/30'
                                  : 'bg-app-secondary text-app-text-muted border border-app-border hover:border-accent-color/30'
                              }`}
                            >
                              {ep.watched ? <Check className="w-3 h-3" /> : ep.episodeNumber}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {showEpisodes.length > 0 && watchedCount < totalEpisodes && (
                <div className="px-4 pb-4">
                  <button
                    onClick={() => onSelectMovie(show.id)}
                    className="w-full glass-button rounded-lg py-2 text-xs text-app-text-muted flex items-center justify-center gap-2"
                  >
                    <Clock className="w-3 h-3" />
                    {t('series.resume')}
                  </button>
                </div>
              )}
            </GlassCard>
          </motion.div>
        );
      })}
    </div>
  );
}
