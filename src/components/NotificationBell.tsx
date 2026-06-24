import { useState, useRef, useEffect } from 'react';
import { Bell, X, Film, List, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../hooks/useNotifications';

export function NotificationBell() {
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    setOpen((prev) => !prev);
    if (!open && unreadCount > 0) markAllRead();
  };

  const getIcon = (type: string) => {
    if (type === 'list_shared') return <List size={14} className="text-blue-400" />;
    return <Film size={14} className="text-green-400" />;
  };

  const getMessage = (n: { type: string; payload: any }) => {
    if (n.type === 'list_shared')
      return (
        <>
          <span className="text-app-text font-medium">{n.payload.owner_name}</span> hat die Liste{' '}
          <span className="text-blue-400 font-medium">„{n.payload.list_name}"</span> mit dir geteilt
        </>
      );
    if (n.type === 'list_item_added')
      return (
        <>
          <span className="text-app-text font-medium">{n.payload.owner_name}</span> hat{' '}
          <span className="text-green-400 font-medium">{n.payload.movie_title}</span> zur Liste „
          {n.payload.list_name}" hinzugefügt
        </>
      );
    return 'Neue Benachrichtigung';
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-xl text-app-text-muted hover:text-app-text hover:bg-white/5 transition-all"
        aria-label="Benachrichtigungen"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-80 bg-app-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <h3 className="text-sm font-semibold text-app-text">Benachrichtigungen</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-app-text-muted hover:text-app-text"
              >
                <X size={16} />
              </button>
            </div>

            {/* Liste */}
            <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-app-text-muted gap-2">
                  <Bell size={28} className="opacity-30" />
                  <p className="text-sm">Keine Benachrichtigungen</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`flex gap-3 px-4 py-3 transition-colors ${!n.read_at ? 'bg-blue-500/5' : ''}`}
                  >
                    <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-app-text-muted leading-relaxed">{getMessage(n)}</p>
                      <p className="text-[10px] text-app-text-faint mt-1">
                        {new Date(n.created_at).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    {!n.read_at && (
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                    )}
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="px-4 py-2.5 border-t border-white/5">
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1.5 text-xs text-app-text-muted hover:text-app-text transition-colors"
                >
                  <Check size={12} /> Alle als gelesen markieren
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
