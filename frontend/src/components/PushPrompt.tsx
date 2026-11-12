import { useEffect, useState } from 'react';
import { Check, Sparkles, TextBubble } from '@getpapillon/papicons';
import { enablePush, getPushPermission, syncPushSubscription } from '@/data/push';
import { useAuth } from '@/state/AuthContext';

const DISMISS_KEY = 'akademia:push_prompt_dismissed_at';
const COOLDOWN_DAYS = 7;
const SHOW_DELAY_MS = 6000;

function dismissedRecently(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    return raw ? (Date.now() - Number(raw)) / 86_400_000 < COOLDOWN_DAYS : false;
  } catch {
    return false;
  }
}

function markDismissed() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

/**
 * - Si les notifications sont déjà autorisées : ré-enregistre l'abonnement push en silence.
 * - Sinon, propose (une fois, avec délai de réserve) d'activer les notifications de messages.
 *   La permission du navigateur n'est demandée qu'au clic, comme l'exigent iOS et Chrome.
 */
export default function PushPrompt() {
  const { user, cloud } = useAuth();
  const userId = user && !user.guest && cloud ? user.id : null;
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) return;
    void syncPushSubscription();
    if (getPushPermission() !== 'default' || dismissedRecently()) return;
    const timer = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [userId]);

  if (!visible) return null;

  const close = () => {
    markDismissed();
    setVisible(false);
  };

  const activate = async () => {
    setBusy(true);
    setError('');
    try {
      await enablePush();
      setDone(true);
      window.setTimeout(() => setVisible(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible d’activer les notifications.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-label="Activer les notifications"
      className="fixed inset-x-3 bottom-24 z-30 mx-auto max-w-md animate-fadeIn rounded-3xl border-2 border-brand/25 bg-card p-4 shadow-pop lg:bottom-6 lg:left-auto lg:right-6 lg:mx-0"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-soft text-brand">
          {done ? <Check size={22} /> : <TextBubble size={22} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-extrabold text-ink">
            {done ? 'Notifications activées !' : 'Ne rate plus un message 🔔'}
          </p>
          <p className="mt-0.5 text-xs font-semibold text-muted">
            {done
              ? 'Tu seras prévenu sur ce téléphone, même quand Akademia est fermé.'
              : 'Reçois une notification quand un étudiant t’écrit, même quand l’application est fermée.'}
          </p>
          {error && <p role="alert" className="mt-1.5 text-xs font-bold text-bad">{error}</p>}
          {!done && (
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => void activate()} disabled={busy} className="btn btn-primary !px-4 !py-2 text-xs">
                <Sparkles size={14} /> {busy ? 'Activation…' : 'Activer'}
              </button>
              <button type="button" onClick={close} className="btn btn-ghost !px-3 !py-2 text-xs">
                Plus tard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
