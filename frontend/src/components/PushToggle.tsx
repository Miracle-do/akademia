import { useEffect, useState } from 'react';
import { TextBubble } from '@getpapillon/papicons';
import { disablePush, enablePush, getPushEnabled, getPushPermission } from '@/data/push';
import { isIos, isStandalone } from '@/components/InstallPwaModal';
import { cn } from '@/lib/utils';

/** Interrupteur « Notifications de messages » des paramètres du profil. */
export default function PushToggle() {
  const permission = getPushPermission();
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let alive = true;
    getPushEnabled().then((value) => {
      if (alive) setEnabled(value && getPushPermission() === 'granted');
    }).catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  const toggle = async () => {
    setBusy(true);
    setMessage('');
    try {
      if (enabled) {
        await disablePush();
        setEnabled(false);
        setMessage('Notifications désactivées sur cet appareil.');
      } else {
        await enablePush();
        setEnabled(true);
        setMessage('Notifications activées sur cet appareil.');
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Action impossible pour le moment.');
    } finally {
      setBusy(false);
    }
  };

  let hint = '';
  if (permission === 'unsupported') {
    hint = isIos() && !isStandalone()
      ? 'Sur iPhone/iPad, installe d’abord Akademia sur l’écran d’accueil (Partager → Sur l’écran d’accueil), puis ouvre-la depuis l’icône pour activer les notifications.'
      : 'Ce navigateur ne prend pas en charge les notifications push.';
  } else if (permission === 'denied') {
    hint = 'Les notifications sont bloquées dans les réglages du navigateur : autorise-les pour Akademia, puis reviens ici.';
  }

  const disabled = busy || permission === 'unsupported' || permission === 'denied';

  return (
    <div className="pt-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-soft text-brand">
            <TextBubble size={18} />
          </span>
          <div className="min-w-0">
            <p className="font-display text-sm font-extrabold text-ink">Notifications de messages</p>
            <p className="text-[11px] font-bold text-muted">Sois prévenu même quand l’application est fermée.</p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Notifications de messages"
          disabled={disabled}
          onClick={() => void toggle()}
          className={cn(
            'relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50',
            enabled ? 'bg-brand' : 'bg-line',
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all',
              enabled ? 'left-[22px]' : 'left-0.5',
            )}
          />
        </button>
      </div>
      {(hint || message) && (
        <p role="status" className={cn('mt-1.5 text-[11px] font-bold', hint ? 'text-muted' : 'text-good')}>
          {hint || message}
        </p>
      )}
    </div>
  );
}
