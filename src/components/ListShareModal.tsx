import { useState, useEffect, useRef } from 'react';
import { X, Search, UserPlus, UserMinus, Share2, Loader2 } from 'lucide-react';
import { useListSharing, ShareableUser } from '../hooks/useListSharing';
import { CustomList } from '../types/domain';

interface ListShareModalProps {
  list: CustomList;
  onClose: () => void;
}

export function ListShareModal({ list, onClose }: ListShareModalProps) {
  const { sharedWith, loading, searchUsers, shareWithUser, unshareWithUser, loadSharedWith } = useListSharing(list.id);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ShareableUser[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => { loadSharedWith(); }, [loadSharedWith]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.length < 2) { setResults([]); return; }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-app-surface border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-app-text">„{list.name}" teilen</h2>
          <button onClick={onClose} className="text-app-text-muted hover:text-app-text">
            <X size={20} />
          </button>
        </div>

        {/* User-Suche */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted" />
          <input
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-app-text placeholder:text-app-text-muted focus:outline-none focus:border-app-primary"
            placeholder="Username oder Name suchen..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        {/* Suchergebnisse */}
        {(searching || results.length > 0) && (
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {searching && <p className="text-xs text-app-text-muted px-1">Suche...</p>}
            {results.map(u => {
              const alreadyShared = sharedWith.some(s => s.id === u.id);
              return (
                <div key={u.id} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5">
                  <div>
                    <p className="text-sm text-app-text">{u.display_name ?? u.username}</p>
                    {u.username && <p className="text-xs text-app-text-muted">@{u.username}</p>}
                  </div>
                  <button
                    onClick={() => alreadyShared ? unshareWithUser(u.id) : shareWithUser(u.id)}
                    disabled={loading}
                    className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-all ${
                      alreadyShared
                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                        : 'bg-app-primary/10 text-app-primary hover:bg-app-primary/20'
                    }`}
                  >
                    {loading ? <Loader2 size={12} className="animate-spin" /> :
                      alreadyShared ? <><UserMinus size={12} /> Entfernen</> : <><UserPlus size={12} /> Teilen</>}
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
              {sharedWith.map(u => (
                <div key={u.id} className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg">
                  <p className="text-sm text-app-text">{u.display_name ?? u.username ?? 'Unbekannt'}</p>
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
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 rounded-xl text-sm font-medium hover:bg-[#25D366]/20 transition-all"
        >
          <Share2 size={16} />
          Via WhatsApp teilen
        </a>
      </div>
    </div>
  );
}