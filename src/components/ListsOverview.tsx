import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ListPlus, Share2, Trash2, Film, Plus, X, Search } from 'lucide-react';
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
  const [selectedList, setSelectedList] = useState<CustomList | null>(null);
  const [addSearch, setAddSearch] = useState('');

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

  const handleOpenList = (list: CustomList) => {
    setSelectedList(list);
    setAddSearch('');
    onSelectList(list.id);
  };

  const handleRemoveFromList = (movieId: string) => {
    if (!selectedList) return;
    conductor.dispatch({ type: 'REMOVE_FROM_LIST', payload: { listId: selectedList.id, movieId } });
  };

  const handleAddToList = (movieId: string) => {
    if (!selectedList) return;
    const movie = items.find(m => m.id === movieId);
    if (!movie) return;
    conductor.dispatch({ type: 'ADD_TO_LIST', payload: { listId: selectedList.id, movie } });
  };

  // ── Detailansicht einer Liste ──────────────────────────────────────────────
  if (selectedList) {
    const currentList = lists.find(l => l.id === selectedList.id) ?? selectedList;
    const currentMovieIds: string[] = (currentList as any).items || [];
    const currentMovies = items.filter(m => currentMovieIds.includes(m.id));

    const filteredLibrary = addSearch.length > 1
      ? items.filter(m =>
          !currentMovieIds.includes(m.id) &&
          m.title.toLowerCase().includes(addSearch.toLowerCase())
        )
      : [];

    return (
      <div className="p-4 pb-24 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => setSelectedList(null)}
            className="text-app-text-muted hover:text-app-text transition-colors text-sm"
          >
            ← Zurück
          </button>
          <h2 className="text-lg font-semibold text-app-text flex-1 truncate">{currentList.name}</h2>
          <span className="text-xs text-app-text-muted flex-shrink-0">{currentMovies.length} Filme</span>
        </div>

        {/* Suchfeld zum Hinzufügen */}
        <div className="relative">
          <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl">
            <Search className="w-4 h-4 text-app-text-muted flex-shrink-0" />
            <input
              type="text"
              value={addSearch}
              onChange={e => setAddSearch(e.target.value)}
              placeholder="Film aus Bibliothek hinzufügen…"
              className="flex-1 bg-transparent text-sm text-app-text placeholder-app-text-muted outline-none"
            />
            {addSearch && (
              <button onClick={() => setAddSearch('')} className="text-app-text-muted hover:text-app-text">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {filteredLibrary.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-app-secondary border border-app-border rounded-xl shadow-lg max-h-56 overflow-y-auto">
              {filteredLibrary.map(movie => (
                <button
                  key={movie.id}
                  onClick={() => { handleAddToList(movie.id); setAddSearch(''); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
                >
                  {movie.posterPath ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w92${movie.posterPath}`}
                      alt={movie.title}
                      className="w-8 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-8 h-12 bg-white/10 rounded flex items-center justify-center">
                      <Film className="w-4 h-4 text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-app-text truncate">{movie.title}</p>
                    <p className="text-xs text-app-text-muted">{movie.releaseDate?.split('-')[0]}</p>
                  </div>
                  <Plus className="w-4 h-4 text-blue-400 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filmliste */}
        {currentMovies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Film className="w-12 h-12 text-app-text-muted opacity-30 mb-3" />
            <p className="text-app-text-muted text-sm">Noch keine Filme in dieser Liste</p>
            <p className="text-app-text-muted text-xs mt-1">Suche oben nach Filmen aus deiner Bibliothek</p>
          </div>
        ) : (
          <div className="space-y-2">
            {currentMovies.map(movie => (
              <motion.div
                key={movie.id}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-3 p-2 bg-white/5 border border-white/10 rounded-xl"
              >
                {movie.posterPath ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${movie.posterPath}`}
                    alt={movie.title}
                    className="w-10 h-14 object-cover rounded-lg flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-14 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Film className="w-5 h-5 text-gray-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-app-text truncate">{movie.title}</p>
                  <p className="text-xs text-app-text-muted">
                    {movie.mediaType === 'tv' ? 'Serie' : 'Film'} · {movie.releaseDate?.split('-')[0] || 'N/A'}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveFromList(movie.id)}
                  className="p-2 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  title="Aus Liste entfernen"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Leerer Zustand ─────────────────────────────────────────────────────────
  if (lists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-24 text-center px-6">
        <Film className="w-12 h-12 text-app-text-muted opacity-30 mb-4" />
        <h3 className="text-app-text font-semibold mb-1">{t('nav.lists')}</h3>
        <p className="text-app-text-muted text-sm mb-6">Erstelle deine erste Liste</p>
        <button
          onClick={() => setShowCreation(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-xl text-sm hover:bg-blue-500/30 transition-all"
        >
          <ListPlus className="w-4 h-4" />
          Neue Liste
        </button>
        {showCreation && (
          <ListCreationModal conductor={conductor} onClose={() => setShowCreation(false)} />
        )}
      </div>
    );
  }

  // ── Listen-Übersicht ───────────────────────────────────────────────────────
  return (
    <div className="p-4 pb-24 space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-semibold text-app-text">{t('nav.lists')} ({lists.length})</h2>
        <button
          onClick={() => setShowCreation(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-xl text-xs hover:bg-blue-500/30 transition-all"
        >
          <ListPlus className="w-3.5 h-3.5" />
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
              onClick={() => handleOpenList(list)}
              className="p-3 cursor-pointer"
            >
              <div className="flex items-center gap-3">
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
                          />
                        ) : (
                          <div className="w-full h-full bg-white/10 flex items-center justify-center">
                            <Film className="w-4 h-4 text-gray-500" />
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="w-10 h-14 rounded-lg bg-white/10 flex items-center justify-center">
                      <Film className="w-5 h-5 text-gray-600" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-app-text text-sm truncate">{list.name}</p>
                  {(list as any).description && (
                    <p className="text-xs text-app-text-muted truncate">{(list as any).description}</p>
                  )}
                  <p className="text-xs text-app-text-muted mt-0.5">
                    {(list as any).movieCount || previewMovies.length} Filme
                  </p>
                </div>

                {/* Aktionen */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); setSharingList(list); }}
                    className="p-2 text-app-text-muted hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                    title="Teilen"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, list.id)}
                    className="p-2 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    title="Löschen"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        );
      })}

      {sharingList && (
        <ListShareModal
          list={sharingList}
          onClose={() => setSharingList(null)}
        />
      )}
    </div>
  );
}