import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Notification {
  id: string;
  type: string;
  payload: any;
  read_at: string | null;
  created_at: string;
  user_id: string | null;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('admin_notifications')
        .select('id, type, payload, read_at, created_at, user_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (data) {
        const mapped: Notification[] = (data as unknown as Notification[]).map((n) => ({
          id: n.id,
          type: n.type,
          payload: n.payload,
          read_at: n.read_at,
          created_at: n.created_at,
          user_id: n.user_id,
        }));
        setNotifications(mapped);
        setUnreadCount(mapped.filter((n) => !n.read_at).length);
      }
    };
    load();
  }, []);

  const markAllRead = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('admin_notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .is('read_at', null);

    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })),
    );
    setUnreadCount(0);
  };

  return { notifications, unreadCount, markAllRead };
}
