import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ListPlus, Share2, Trash2, Film } from 'lucide-react';
import { CustomList, Movie } from '../types/domain';
import { MovieConductor } from '../core/conductor/MovieConductor';
import { GlassCard, GlassButton } from './glass';
import { ListCreationModal } from './ListCreationModal';
import { ListShareModal } from './ListShareModal';
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
  const [sharingList, setSharingList] = useState<CustomList | null>(null);

  const listMovies = useMemo(() => {
    const map = new Map<string, Movie[]>();
    for (const list of lists) {
      const movieIds = list.items || [];
      map.set(list.id, items.filter(m =>
        movieIds.includes(m.id) ||
        (list.movieCount > 0 && movieIds.length === 0)
      ));
    }
    return map;
  }, [lists, items]);

  const handleShareClick = (e: React.MouseEvent, list: CustomList) => {
    e.stopPropagation();
    setSharingList(list);
  };

  const handleDelete = (e: React.MouseEvent, listId: string) => {
    e.stopPropagation();
    conductor.dispatch({ type: 'DELETE_LIST', payload: listId });
  };

  // Empty State
  if (lists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20 px-4">
        <div className="text-6xl">🎬</div>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-app-text mb-1">{t('nav.lists')}</h2>
          <p className="text-sm text-app-text-muted">Erstelle deine erste Liste</p>
        </div>
        <GlassButton onClick={() => setShowCreation(true)} className="mx-auto">
          <ListPlus size={16} />
          Neue Liste
        </GlassButton>
        {showCreation && (
          <ListCreationModal conductor={conductor} onClose={() => setShowCreation(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-app-text">
          {t('nav.lists')} <span className="text-app-text-muted font-normal">({lists.length})</span>
        </h2>
        <GlassButton onClick={() => setShowCreation(true)} className="text-xs">
          <ListPlus size={14} />
          Neue Liste
        </GlassButton>
      </div>

      {showCreation && (
        <ListCreationModal conductor={conductor} onClose={() => setShowCreation(false)} />
      )}

      {/* Listen */}
      <div className="space-y-3">
        {lists.map((list, idx) => {
          const previewMovies = listMovies.get(list.id) || [];
          return (
            <motion.div
              key={list.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <GlassCard
                className="overflow-hidden cursor-pointer active:scale-[0.99] transition-transform"
                onClick={() => onSelectList(list.id)}
              >
                {/* Poster-Vorschau + Info */}
                <div className="flex gap-3 p-3">
                  {/* Poster-Stack */}
                  <div className="flex gap-1 shrink-0">
                    {previewMovies.slice(0, 3).length > 0 ? (
                      previewMovies.slice(0, 3).map(m => (
                        <div key={m.id} className="w-10 h-14 rounded-md overflow-hidden bg-white/5">
                          {m.posterPath ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w92${m.posterPath}`}
                              alt={m.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[8px] text-app-text-muted">
                              N/A
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="w-10 h-14 rounded-md bg-white/5 flex items-center justify-center">
                        <Film size={16} className="text-app-text-faint" />
                      </div>
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <p className="text-sm font-semibold text-app-text truncate">{list.name}</p>
                    {list.description && (
                      <p className="text-xs text-app-text-muted truncate mt-0.5">{list.description}</p>
                    )}
                    <p className="text-[10px] text-app-text-faint mt-1">
                      {list.movieCount || previewMovies.length} Filme
                    </p>
                  </div>
                </div>

                {/* Aktionen */}
                <div className="flex border-t border-white/5">
                  <button
                    onClick={(e) => handleShareClick(e, list)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] text-app-text-muted hover:text-blue-400 hover:bg-blue-500/5 transition-all"
                  >
                    <Share2 size={12} />
                    Teilen
                  </button>
                  <div className="w-px bg-white/5" />
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
      </div>

      {/* Share Modal */}
      {sharingList && (
        <ListShareModal
          list={sharingList}
          onClose={() => setSharingList(null)}
        />
      )}
    </div>
  );
}