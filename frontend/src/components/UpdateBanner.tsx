import { useEffect, useState } from 'react';

const CHECK_EVERY_MS = 10 * 60 * 1000;

/**
 * Prévient l'utilisateur qu'une nouvelle version est en ligne (utile quand l'appli installée reste ouverte longtemps).
 * Compare l'identifiant de version de ce bundle à /version.json, relu sans cache.
 */
export default function UpdateBanner() {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    if (import.meta.env.DEV) return;
    let stopped = false;
    const check = async () => {
      if (stopped || !navigator.onLine) return;
      try {
        const res = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as { id?: string };
        if (data.id && data.id !== __BUILD_ID__) {
          setAvailable(true);
          void navigator.serviceWorker?.getRegistration().then((r) => r?.update());
        }
      } catch { /* réseau indisponible : on réessaiera */ }
    };
    const onVisible = () => { if (document.visibilityState === 'visible') void check(); };
    void check();
    const timer = window.setInterval(check, CHECK_EVERY_MS);
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('online', check);
    return () => {
      stopped = true;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('online', check);
    };
  }, []);

  if (!available) return null;
  return (
    <div role="status" className="fixed inset-x-3 bottom-20 z-[60] mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white shadow-lg md:bottom-4">
      <span className="flex-1">Une nouvelle version d'Akademia est disponible.</span>
      <button type="button" onClick={() => window.location.reload()} className="rounded-xl bg-white px-3 py-1.5 font-semibold text-slate-900">Actualiser</button>
      <button type="button" aria-label="Plus tard" onClick={() => setAvailable(false)} className="px-1 text-white/70">✕</button>
    </div>
  );
}
