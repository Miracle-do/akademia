import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';

/** Événement window émis quand des messages sont lus ou supprimés (pour rafraîchir le compteur tout de suite). */
export const MESSAGES_CHANGED_EVENT = 'akademia:messages-changed';

export function notifyMessagesChanged(): void {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(MESSAGES_CHANGED_EVENT));
}

/** Nombre de messages reçus et non lus, hors messages masqués par l'utilisateur. */
export async function getUnreadCount(userId: string): Promise<number> {
  if (!supabase) return 0;
  const { data, error } = await supabase
    .from('messages')
    .select('id')
    .eq('recipient_id', userId)
    .is('read_at', null)
    .limit(1000);
  if (error) throw error;
  const ids = (data ?? []).map((row) => row.id as string);
  if (!ids.length) return 0;

  const { data: hiddenRows, error: hiddenError } = await supabase
    .from('message_deletions')
    .select('message_id')
    .eq('user_id', userId);
  if (hiddenError) throw hiddenError;
  const hidden = new Set((hiddenRows ?? []).map((row) => row.message_id as string));
  return ids.filter((id) => !hidden.has(id)).length;
}

/** Écoute en temps réel les messages reçus / lus / supprimés qui concernent l'utilisateur. */
export function subscribeToUnread(userId: string, onChange: () => void): () => void {
  if (!supabase) return () => undefined;
  const client = supabase;
  const channel: RealtimeChannel = client
    .channel(`unread:${userId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `recipient_id=eq.${userId}` }, onChange)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: `recipient_id=eq.${userId}` }, onChange)
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, (event) => {
      // Supabase ne filtre pas les DELETE : on ne réagit qu'à ceux qui nous concernent.
      const old = event.old as { recipient_id?: string };
      if (!old.recipient_id || old.recipient_id === userId) onChange();
    })
    .subscribe();
  return () => {
    void client.removeChannel(channel);
  };
}
