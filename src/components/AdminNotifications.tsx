import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types/auth';

interface AdminNotification {
  id: string;
  type: string;
  payload: {
    email?: string;
    username?: string;
    registered_at?: string;
    user_id?: string;
  };
  is_read: boolean;
  created_at: string;
}

interface AdminNotificationsProps {
  user: UserProfile;
}

/**
 * In-app notification bell for admins.
 * Shows new user registrations. No e-mail, no push — purely internal.
 * Robust: silently hides itself if the admin_notifications table does not exist yet.
 */
export function AdminNotifications({ user }: AdminNotificationsProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [available, setAvailable] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Only render for admins
  if (user.role !== 'admin') return null;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_notifications' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        // Table doesn't exist yet — hide component silently
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          setAvailable(false);
          return;
        }
        console.warn('AdminNotifications fetch error:', error.message);
        return;
      }

      setNotifications((data as any[]) || []);
    } catch (e) {
      console.warn('AdminNotifications unexpected error:', e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 60 seconds — no realtime subscription needed for MVP
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const markAsRead = async (id: string) => {
    try {
      await supabase
        .from('admin_notifications' as any)
        .update({ is_read: true } as any)
        .eq('id', id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch (e) {
      console.warn('markAsRead error:', e);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter((n) => !n.is_read).map((n) => n.id);
      if (unread.length === 0) return;
      await supabase
        .from('admin_notifications' as any)
        .update({ is_read: true } as any)
        .in('id', unread);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (e) {
      console.warn('markAllAsRead error:', e);
    }
  };

  if (!available) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Admin-Benachrichtigungen"
        className="relative p-2 rounded-full hover:bg-app-secondary/50 text-app-text-muted hover:text-app-text transition"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-app-bg border border-app-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in">
          <div className="p-4 border-b border-app-border flex items-center justify-between">
            <h3 className="text-sm font-bold text-app-text">Neue Registrierungen</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  title="Alle als gelesen markieren"
                  className="p-1 rounded-full hover:bg-app-secondary/50 text-app-text-muted hover:text-app-text transition"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-full hover:bg-app-secondary/50 text-app-text-muted hover:text-app-text transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-app-text-muted text-sm">
                Keine Benachrichtigungen
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 border-b border-app-border last:border-0 flex items-start gap-3 transition ${
                    n.is_read ? 'opacity-60' : 'bg-blue-500/5'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-app-text truncate">
                      {n.payload.username ? `@${n.payload.username}` : 'Neuer Benutzer'}
                    </p>
                    <p className="text-xs text-app-text-muted truncate">{n.payload.email || '—'}</p>
                    <p className="text-xs text-app-text-muted mt-0.5">
                      {n.payload.registered_at
                        ? new Date(n.payload.registered_at).toLocaleString('de-DE')
                        : new Date(n.created_at).toLocaleString('de-DE')}
                    </p>
                  </div>
                  {!n.is_read && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      title="Als gelesen markieren"
                      className="p-1 rounded-full hover:bg-app-secondary/50 text-blue-400 hover:text-blue-300 transition flex-shrink-0"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
