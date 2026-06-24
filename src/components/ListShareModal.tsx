import { useState, useEffect, useRef } from 'react';
import { X, Search, UserPlus, UserMinus, Share2, Loader2 } from 'lucide-react';
import { useListSharing, ShareableUser } from '../hooks/useListSharing';
import { CustomList } from '../types/domain';

interface ListShareModalProps {
  list: CustomList;
  onClose: () => void;
}

export function ListShareModal({ list, onClose }: ListShareModalProps) {
  const { sharedWith, loading, searchUsers, shareWithUser, unshareWithUser, loadSharedWith } =
    useListSharing(list.id);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ShareableUser[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    void loadSharedWith();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const found = await searchUsers(query);
      setResults(found);
      setSearching(false);
    }, 350);
  }, [query, searchUsers]);

  const shareUrl = `${window.location.origin}/lists/${list.id}`;
  const waLink = `https://wa.me/?text=${encodeURIComponent(`🎬 Schau dir meine Film-Liste "${list.name}" an: ${shareUrl}`)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md glass-card rounded-2xl p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-app-text text-base">„{list.name}" teilen</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-app-secondary transition-all"
          >
            <X size={18} className="text-app-text-muted" />
          </button>
        </div>

        {/* User-Suche */}
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted"
          />
          <input
            type="text"
            placeholder="Nutzer suchen..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-app-secondary border border-app-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-app-text placeholder:text-app-text-muted focus:outline-none focus:border-accent-color/50"
          />
        </div>

        {/* Suchergebnisse */}
        {(searching || results.length > 0) && (
          <div className="space-y-2">
            {searching && <p className="text-xs text-app-text-muted text-center">Suche...</p>}
            {results.map((u: ShareableUser) => {
              const alreadyShared = sharedWith.some((s: ShareableUser) => s.id === u.id);
              return (
                <div
                  key={u.id}
                  className="flex items-center justify-between gap-2 p-2 rounded-xl bg-app-secondary"
                >
                  <div>
                    <p className="text-sm font-medium text-app-text">
                      {u.display_name ?? u.username}
                    </p>
                    {u.username && <p className="text-xs text-app-text-muted">@{u.username}</p>}
                  </div>
                  <button
                    onClick={() => (alreadyShared ? unshareWithUser(u.id) : shareWithUser(u.id))}
                    disabled={loading}
                    className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-all ${
                      alreadyShared
                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                        : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                    }`}
                  >
                    {loading ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : alreadyShared ? (
                      <>
                        <UserMinus size={12} /> Entfernen
                      </>
                    ) : (
                      <>
                        <UserPlus size={12} /> Teilen
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Bereits geteilt mit */}
        {sharedWith.length > 0 && (
          <div>
            <p className="text-xs text-app-text-muted mb-2">Geteilt mit:</p>
            <div className="space-y-1">
              {sharedWith.map((u: ShareableUser) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-app-secondary"
                >
                  <p className="text-sm text-app-text">
                    {u.display_name ?? u.username ?? 'Unbekannt'}
                  </p>
                  <button
                    onClick={() => unshareWithUser(u.id)}
                    className="text-xs text-red-400/70 hover:text-red-400"
                  >
                    <UserMinus size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WhatsApp */}
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl text-sm hover:bg-green-500/30 transition-all"
        >
          <Share2 size={14} />
          Via WhatsApp teilen
        </a>
      </div>
    </div>
  );
}
