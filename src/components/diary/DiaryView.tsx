import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { BookOpen, Star, Eye, Clock } from 'lucide-react';
import { Movie } from '../../types/domain';
import { GlassCard, GlassSection } from '../glass';

interface DiaryViewProps {
  items: Movie[];
  onSelectMovie: (id: string) => void;
}

function getDateGroup(dateStr: string | null | undefined): string {
  if (!dateStr) return 'unknown';
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'today';
  if (date.toDateString() === yesterday.toDateString()) return 'yesterday';

  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  if (date >= weekAgo) return 'thisWeek';

  const monthAgo = new Date(today);
  monthAgo.setDate(monthAgo.getDate() - 30);
  if (date >= monthAgo) return 'thisMonth';

  return 'earlier';
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function DiaryView({ items, onSelectMovie }: DiaryViewProps) {
  const { t } = useTranslation();

  const diaryEntries = useMemo(() => {
    return items
      .filter((m) => m.watched)
      .sort((a, b) => {
        const aDate = a.watchedAt || a.addedAt || '';
        const bDate = b.watchedAt || b.addedAt || '';
        return bDate.localeCompare(aDate);
      });
  }, [items]);

  const grouped = useMemo(() => {
    const groups: Record<string, Movie[]> = {};
    for (const entry of diaryEntries) {
      const group = getDateGroup(entry.watchedAt || entry.addedAt);
      if (!groups[group]) groups[group] = [];
      groups[group].push(entry);
    }
    return groups;
  }, [diaryEntries]);

  const groupLabels: Record<string, string> = {
    today: t('diary.today'),
    yesterday: t('diary.yesterday'),
    thisWeek: t('diary.thisWeek'),
    thisMonth: t('diary.thisMonth'),
    earlier: t('diary.earlier'),
  };

  const groupOrder = ['today', 'yesterday', 'thisWeek', 'thisMonth', 'earlier'];

  if (diaryEntries.length === 0) {
    return (
      <div className="text-center py-20 text-app-text-muted">
        <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">{t('diary.noEntries')}</p>
        <p className="text-sm mt-1 opacity-60">{t('diary.logFirst')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {groupOrder.map((group) => {
        const entries = grouped[group];
        if (!entries || entries.length === 0) return null;
        return (
          <div key={group}>
            <GlassSection title={groupLabels[group]} className="mb-3" />
            <div className="space-y-2">
              {entries.map((entry, idx) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03, duration: 0.25 }}
                >
                  <GlassCard
                    hover
                    onClick={() => onSelectMovie(entry.id)}
                    className="flex items-center gap-3 p-3"
                  >
                    {/* Mini Poster */}
                    <div className="w-10 h-14 rounded-lg overflow-hidden shrink-0 bg-app-secondary">
                      {entry.posterPath ? (
                        <img
                          src={entry.posterPath}
                          alt={entry.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] text-app-text-muted">
                          N/A
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-app-text-muted">
                          {entry.mediaType === 'tv' ? '📺' : '🎬'}
                        </span>
                        <h4 className="font-semibold text-sm text-app-text truncate">
                          {entry.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[10px] text-app-text-muted flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {t('diary.entry')}
                        </span>
                        {typeof entry.userRating === 'number' && entry.userRating > 0 && (
                          <span className="text-[10px] text-yellow-400 flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            {entry.userRating}/10
                          </span>
                        )}
                        {entry.watchedAt && (
                          <span className="text-[10px] text-app-text-muted flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(entry.watchedAt).toLocaleTimeString('de-DE', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Year */}
                    <span className="text-[10px] text-app-text-muted shrink-0">
                      {entry.releaseDate?.split('-')[0] || ''}
                    </span>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}

      <div className="text-center text-[10px] text-app-text-muted py-4">
        {diaryEntries.length} {t('stats.watched')}
      </div>
    </div>
  );
}
