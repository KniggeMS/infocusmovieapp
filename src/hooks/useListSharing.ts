import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface ShareableUser {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

export function useListSharing(listId: string) {
  const [sharedWith, setSharedWith] = useState<ShareableUser[]>([]);
  const [loading, setLoading] = useState(false);

  const searchUsers = useCallback(async (query: string): Promise<ShareableUser[]> => {
    if (query.length < 2) return [];
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data } = await supabase
      .from('profiles')
      .select('id, display_name, username, avatar_url')
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .neq('id', user?.id ?? '')
      .limit(10);

    return data ?? [];
  }, []);

  const shareWithUser = useCallback(
    async (userId: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setLoading(true);
      const { error } = await supabase.from('list_shares').insert({
        list_id: listId,
        owner_id: user.id,
        shared_with: userId,
      });
      setLoading(false);
      if (!error) await loadSharedWith();
    },
    [listId],
  );

  const unshareWithUser = useCallback(
    async (userId: string) => {
      setLoading(true);
      await supabase.from('list_shares').delete().eq('list_id', listId).eq('shared_with', userId);
      setLoading(false);
      await loadSharedWith();
    },
    [listId],
  );

  const loadSharedWith = useCallback(async () => {
    const { data } = await supabase
      .from('list_shares')
      .select(
        'shared_with, profiles!list_shares_shared_with_fkey(id, display_name, username, avatar_url)',
      )
      .eq('list_id', listId);

    if (data) {
      setSharedWith(data.map((d: any) => d.profiles).filter(Boolean));
    }
  }, [listId]);

  return { sharedWith, loading, searchUsers, shareWithUser, unshareWithUser, loadSharedWith };
}
