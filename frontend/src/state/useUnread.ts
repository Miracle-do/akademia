import { useEffect, useState } from 'react';
import { MESSAGES_CHANGED_EVENT, getUnreadCount, subscribeToUnread } from '@/data/unread';
import { useAuth } from '@/state/AuthContext';

type BadgeNavigator = Navigator & {
  setAppBadge?: (count?: number) => Promise<void>;
  clearAppBadge?: () => Promise<void>;
};

function applyBadges(count: number) {
  // Pastille sur l'icône de l'application installée (Android, Windows, macOS, iOS PWA).
  const nav = navigator as BadgeNavigator;
  try {
    if (count > 0) void nav.setAppBadge?.(count)?.catch(() => undefined);
    else void nav.clearAppBadge?.()?.catch(() => undefined);
  } catch {
    /* API non disponible */
  }
  // Compteur dans le titre de l'onglet : « (3) Akademia ».
  const base = document.title.replace(/^\(\d+\+?\)\s*/, '');
  document.title = count > 0 ? `(${count > 99 ? '99+' : count}) ${base}` : base;
}

/** Nombre de messages non lus, mis à jour en temps réel (et à la réception d'une notification push). */
export function useUnreadMessages(): number {
  const { user, cloud } = useAuth();
  const userId = user && !user.guest && cloud ? user.id : null;
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!userId) {
      setCount(0);
      return;
    }
    let alive = true;
    let timer: number | undefined;
    const refresh = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        getUnreadCount(userId)
          .then((n) => {
            if (alive) setCount(n);
          })
          .catch(() => undefined);
      }, 150);
    };

    refresh();
    const unsubscribe = subscribeToUnread(userId, refresh);
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    const onServiceWorkerMessage = (event: MessageEvent) => {
      if ((event.data as { type?: string } | null)?.type === 'akademia-push') refresh();
    };
    window.addEventListener(MESSAGES_CHANGED_EVENT, refresh);
    window.addEventListener('online', refresh);
    document.addEventListener('visibilitychange', onVisible);
    navigator.serviceWorker?.addEventListener('message', onServiceWorkerMessage);
    const poll = window.setInterval(refresh, 60_000); // filet de sécurité si le temps réel est coupé

    return () => {
      alive = false;
      window.clearTimeout(timer);
      window.clearInterval(poll);
      unsubscribe();
      window.removeEventListener(MESSAGES_CHANGED_EVENT, refresh);
      window.removeEventListener('online', refresh);
      document.removeEventListener('visibilitychange', onVisible);
      navigator.serviceWorker?.removeEventListener('message', onServiceWorkerMessage);
    };
  }, [userId]);

  useEffect(() => {
    applyBadges(count);
  }, [count]);

  return count;
}
