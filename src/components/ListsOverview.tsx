import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ListPlus, Share2, Trash2, Film, ChevronRight } from 'lucide-react';
import { CustomList, Movie } from '../types/domain';
import { MovieConductor } from '../core/conductor/MovieConductor';
import { GlassCard, GlassButton } from './glass';
import { ListCreationModal } from './ListCreationModal';
import { shareList } from '../lib/share';
import { useToast } from './Toast';

interface ListsOverviewProps {
  lists: CustomList[];
  items: Movie[];
  conductor: MovieConductor;
  onSelectList: (listId: string) => void;
}

export function ListsOverview({ lists, items, conductor, onSelectList }: ListsOverviewProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [showCreation, setShowCreation] = useState(false);

  const listMovies = useMemo(() => {
    const map = new Map<string, Movie[]>();
    for (const list of lists) {
      const movieIds = list.items || [];
      map.set(list.id, items.filter(m => movieIds.includes(m.id) || (list.movieCount > 0 && movieIds.length === 0)));
    }
    return map;
  }, [lists, items]);

  const handleShare = async (list: CustomList) => {
    const movies = listMovies.get(list.id) || [];
    const result = await shareList(list, movies);
    if (result.method === 'clipboard' && result.success) {
      showToast(result.message || 'Link copied!', 'success');
    }
  };

  if (lists.length === 0) {
    return (
      <div className="text-center py-20 text-app-text-muted">
        <Film className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">{t('nav.lists')}</p>
        <p className="text-sm mt-1 opacity-60 mb-6">Erstelle deine erste Liste</p>
        <GlassButton pill accent onClick={() => setShowCreation(true)} className="mx-auto">
          <ListPlus className="w-4 h-4" />
          <span>Neue Liste</span>
        </GlassButton>
        {showCreation && <ListCreationModal conductor={conductor} onClose={() => setShowCreation(false)} />}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-app-text-muted uppercase tracking-wider">{t('nav.lists')} ({lists.length})</span>
        <GlassButton pill accent onClick={() => setShowCreation(true)} className="text-xs">
          <ListPlus className="w-3.5 h-3.5" />
          <span>Neue Liste</span>
        </GlassButton>
      </div>

      {showCreation && <ListCreationModal conductor={conductor} onClose={() => setShowCreation(false)} />}

      {lists.map((list, idx) => {
        const previewMovies = listMovies.get(list.id) || [];
        return (
          <motion.div
            key={list.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.25 }}
          >
            <GlassCard className="overflow-hidden">
              <div
                className="flex items-center gap-3 p-4 cursor-pointer hover:brightness-110 transition-all"
                onClick={() => onSelectList(list.id)}
              >
                <div className="flex -space-x-2 shrink-0">
                  {previewMovies.slice(0, 3).map(m => (
                    <div key={m.id} className="w-9 h-13 rounded-lg overflow-hidden border border-white/10 shadow-lg">
                      {m.posterPath ? (
                        <img src={m.posterPath} alt={m.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-app-secondary flex items-center justify-center text-[6px] text-app-text-muted">N/A</div>
                      )}
                    </div>
                  ))}
                  {previewMovies.length === 0 && (
                    <div className="w-9 h-13 rounded-lg bg-app-secondary flex items-center justify-center text-[8px] text-app-text-muted">—</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-app-text truncate">{list.name}</h3>
                  {list.description && <p className="text-[10px] text-app-text-muted truncate mt-0.5">{list.description}</p>}
                  <p className="text-[10px] text-app-text-muted mt-0.5">{list.movieCount || previewMovies.length} Filme</p>
                </div>
                <ChevronRight className="w-4 h-4 text-app-text-muted shrink-0" />
              </div>

              <div className="flex border-t border-glass-border">
                <button
                  onClick={() => handleShare(list)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] text-app-text-muted hover:text-app-text hover:bg-white/5 transition-all"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Teilen
                </button>
                <button
                  onClick={() => conductor.dispatch({ type: 'DELETE_LIST', payload: list.id })}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] text-red-400/70 hover:text-red-400 hover:bg-red-500/5 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Löschen
                </button>
              </div>
            </GlassCard>
          </motion.div>
        );
      })}
    </div>
  );
}
