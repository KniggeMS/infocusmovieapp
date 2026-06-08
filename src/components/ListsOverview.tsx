import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ListPlus, Share2, Trash2, Film } from 'lucide-react';
import { CustomList, Movie } from '../types/domain';
import { MovieConductor } from '../core/conductor/MovieConductor';
import { GlassCard } from './glass';
import { ListCreationModal } from './ListCreationModal';
import { ListShareModal } from './ListShareModal';

interface ListsOverviewProps {
  lists: CustomList[];
  items: Movie[];
  conductor: MovieConductor;
  onSelectList: (listId: string) => void;
}

export function ListsOverview({ lists, items, conductor, onSelectList }: ListsOverviewProps) {
  const { t } = useTranslation();
  const [showCreation, setShowCreation] = useState(false);
  const [sharingList, setSharingList] = useState<CustomList | null>(null);

  const listMovies = useMemo(() => {
    const map = new Map<string, Movie[]>();
    for (const list of lists) {
      const movieIds = (list as any).items || [];
      map.set(list.id, items.filter(m => movieIds.includes(m.id)));
    }
    return map;
  }, [lists, items]);

  const handleDelete = (e: React.MouseEvent, listId: string) => {
    e.stopPropagation();
    conductor.dispatch({ type: 'DELETE_LIST', payload: listId });
  };

  if (lists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-app-text-muted">
        <Film size={48} className="mb-4 opacity-30" />
        <p className="font-medium text-app-text">{t('nav.lists')}</p>
        <p className="text-sm mt-1 mb-6">Erstelle deine erste Liste</p>
        <button
          onClick={() => setShowCreation(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-xl text-sm hover:bg-blue-500/30 transition-all"
        >
          <ListPlus size={16} />
          Neue Liste
        </button>
        {showCreation && (
          <ListCreationModal conductor={conductor} onClose={() => setShowCreation(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="pb-24 space-y-3">
      <div className="flex items-center justify-between px-1 mb-2">
        <h2 className="text-lg font-bold text-app-text">{t('nav.lists')} ({lists.length})</h2>
        <button
          onClick={() => setShowCreation(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-xl text-xs hover:bg-blue-500/30 transition-all"
        >
          <ListPlus size={14} />
          Neue Liste
        </button>
      </div>

      {showCreation && (
        <ListCreationModal conductor={conductor} onClose={() => setShowCreation(false)} />
      )}

      {lists.map((list, idx) => {
        const previewMovies = listMovies.get(list.id) || [];
        return (
          <motion.div
            key={list.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <GlassCard
              onClick={() => onSelectList(list.id)}
              className="p-3 cursor-pointer"
            >
              <div className="flex gap-3">
                {/* Poster-Stack */}
                <div className="flex -space-x-2 flex-shrink-0">
                  {previewMovies.slice(0, 3).length > 0 ? (
                    previewMovies.slice(0, 3).map(m => (
                      <div key={m.id} className="w-10 h-14 rounded-lg overflow-hidden border-2 border-app-bg flex-shrink-0">
                        {m.posterPath ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w92${m.posterPath}`}
                            alt={m.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-app-secondary flex items-center justify-center text-[9px] text-app-text-muted">N/A</div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="w-10 h-14 rounded-lg bg-app-secondary flex items-center justify-center">
                      <Film size={16} className="text-app-text-muted opacity-40" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-app-text text-sm leading-tight">{list.name}</p>
                  {(list as any).description && (
                    <p className="text-xs text-app-text-muted mt-0.5 line-clamp-1">{(list as any).description}</p>
                  )}
                  <p className="text-xs text-app-text-muted mt-1">
                    {(list as any).movieCount || previewMovies.length} Filme
                  </p>
                </div>
              </div>

              {/* Aktionen */}
              <div className="flex border-t border-app-border mt-2 pt-1">
                <button
                  onClick={(e) => { e.stopPropagation(); setSharingList(list); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] text-app-text-muted hover:text-blue-400 hover:bg-blue-500/5 transition-all"
                >
                  <Share2 size={12} />
                  Teilen
                </button>
                <button
                  onClick={(e) => handleDelete(e, list.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] text-red-400/70 hover:text-red-400 hover:bg-red-500/5 transition-all"
                >
                  <Trash2 size={12} />
                  Löschen
                </button>
              </div>
            </GlassCard>
          </motion.div>
        );
      })}

      {/* Share Modal */}
      {sharingList && (
        <ListShareModal
          list={sharingList}
          items={listMovies.get(sharingList.id) || []}
          onClose={() => setSharingList(null)}
        />
      )}
    </div>
  );
}