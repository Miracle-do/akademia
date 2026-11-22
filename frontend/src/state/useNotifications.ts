import { useCallback, useEffect, useState } from 'react';
import { NOTIFICATIONS_CHANGED_EVENT, fetchNotifications, type NotificationList } from '@/data/notifications';
import { useAuth } from '@/state/AuthContext';

const EMPTY: NotificationList = { items: [], unread: 0 };

/** Boîte de notifications de l'utilisateur, actualisée toutes les 90 s, au retour dans l'onglet et à la réception d'un push. */
export function useNotifications() {
  const { user, cloud } = useAuth();
  const userId = user && !user.guest && cloud ? user.id : null;
  const [data, setData] = useState<NotificationList>(EMPTY);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) return;
    try {
      setData(await fetchNotifications());
    } catch {
      /* hors connexion : on garde l'affichage précédent */
    } finally {
      setLoaded(true);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setData(EMPTY);
      return;
    }
    void refresh();
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    const onSw = (event: MessageEvent) => {
      if ((event.data as { type?: string } | null)?.type === 'akademia-push') void refresh();
    };
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, refresh);
    window.addEventListener('online', refresh);
    document.addEventListener('visibilitychange', onVisible);
    navigator.serviceWorker?.addEventListener('message', onSw);
    const poll = window.setInterval(() => void refresh(), 90_000);
    return () => {
      window.clearInterval(poll);
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, refresh);
      window.removeEventListener('online', refresh);
      document.removeEventListener('visibilitychange', onVisible);
      navigator.serviceWorker?.removeEventListener('message', onSw);
    };
  }, [userId, refresh]);

  return { ...data, loaded, enabled: Boolean(userId), refresh };
}
