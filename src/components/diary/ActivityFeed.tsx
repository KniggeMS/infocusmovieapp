import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Star, Eye } from 'lucide-react';
import { Movie } from '../../types/domain';
import { GlassCard, GlassSection, GlassDivider } from '../glass';

interface ActivityFeedProps {
  items: Movie[];
  onSelectMovie: (id: string) => void;
}

export function ActivityFeed({ items, onSelectMovie }: ActivityFeedProps) {
  const { t } = useTranslation();

  const activities = useMemo(() => {
    const result: Array<{ type: 'watched' | 'rated'; movie: Movie; date: string }> = [];
    for (const movie of items) {
      if (movie.watched && (movie.watchedAt || movie.addedAt)) {
        result.push({ type: 'watched', movie, date: movie.watchedAt || movie.addedAt! });
      }
      if (typeof movie.userRating === 'number' && movie.userRating > 0 && (movie.watchedAt || movie.addedAt)) {
        result.push({ type: 'rated', movie, date: movie.watchedAt || movie.addedAt! });
      }
    }
    return result.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20);
  }, [items]);

  const currentWatches = useMemo(() => {
    return items.filter(m => !m.watched).slice(0, 6);
  }, [items]);

  return (
    <div className="space-y-6">
      {currentWatches.length > 0 && (
        <>
          <GlassSection title={t('diary.currentWatches')} icon={<Eye className="w-3.5 h-3.5" />} />
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {currentWatches.map(movie => (
              <GlassCard
                key={movie.id}
                hover
                onClick={() => onSelectMovie(movie.id)}
                className="flex-shrink-0 w-28 p-2 text-center"
              >
                <div className="w-full aspect-[2/3] rounded-lg overflow-hidden bg-app-secondary mb-2">
                  {movie.posterPath ? (
                    <img src={movie.posterPath} alt={movie.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[8px] text-app-text-muted">N/A</div>
                  )}
                </div>
                <p className="text-[10px] font-medium text-app-text truncate">{movie.title}</p>
              </GlassCard>
            ))}
          </div>
          <GlassDivider />
        </>
      )}

      <GlassSection title={t('diary.activity')} />
      <div className="space-y-2">
        {activities.length === 0 ? (
          <p className="text-sm text-app-text-muted text-center py-8">{t('diary.noEntries')}</p>
        ) : (
          activities.map((activity, idx) => (
            <motion.div
              key={`${activity.movie.id}-${activity.type}-${activity.date}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03, duration: 0.2 }}
            >
              <GlassCard
                hover
                onClick={() => onSelectMovie(activity.movie.id)}
                className="flex items-center gap-3 p-3"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${activity.type === 'watched' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                  {activity.type === 'watched' ? <Eye className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-app-text truncate">
                    <strong>{activity.movie.title}</strong>
                  </p>
                  <p className="text-[10px] text-app-text-muted">
                    {activity.type === 'watched' ? t('diary.entry') : t('diary.rated')}
                    {' '}★ {activity.movie.userRating}/10
                  </p>
                </div>
                <span className="text-[10px] text-app-text-muted shrink-0">
                  {new Date(activity.date).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}
                </span>
              </GlassCard>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
