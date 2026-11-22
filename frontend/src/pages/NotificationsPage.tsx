import { Link, useNavigate } from 'react-router-dom';
import { Bell, Check, Crown, GraduationHat, Sparkles } from '@getpapillon/papicons';
import { PageTitle, Spinner } from '@/components/ui';
import { markNotificationsRead, type AppNotification } from '@/data/notifications';
import { useNotifications } from '@/state/useNotifications';
import PushToggle from '@/components/PushToggle';
import { Mascot } from '@/components/Mascot';
import { cn } from '@/lib/utils';

function ago(iso: string): string {
  const minutes = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60_000));
  if (minutes < 1) return 'à l’instant';
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.round(hours / 24);
  return days === 1 ? 'hier' : `il y a ${days} jours`;
}

function Icon({ kind }: { kind: string }) {
  if (kind === 'rank') return <Crown size={20} />;
  if (kind === 'content') return <GraduationHat size={20} />;
  return <Sparkles size={20} />;
}

export default function NotificationsPage() {
  const nav = useNavigate();
  const { items, unread, loaded, enabled } = useNotifications();

  const open = async (n: AppNotification) => {
    if (!n.read_at) void markNotificationsRead([n.id]).catch(() => undefined);
    nav(n.url || '/');
  };

  return (
    <div className="space-y-5">
      <PageTitle title="Notifications" sub="Nouveautés, classement et petits rappels de Nimbo." icon={<Bell size={28} />} />

      <PushToggle />

      {!enabled ? (
        <p className="card p-6 text-sm font-semibold text-muted">
          Connecte-toi avec ton compte pour recevoir et retrouver tes notifications.
        </p>
      ) : !loaded ? (
        <Spinner />
      ) : items.length === 0 ? (
        <div className="card flex flex-col items-center p-8 text-center">
          <Mascot mood="happy" size={110} animate={false} />
          <p className="mt-2 font-display text-lg font-extrabold">Rien pour l’instant</p>
          <p className="text-sm font-semibold text-muted">Tu seras prévenu des nouveaux cours, des formations et des changements au classement.</p>
          <Link to="/" className="btn btn-primary mt-4">Retour à l’accueil</Link>
        </div>
      ) : (
        <>
          {unread > 0 && (
            <div className="flex justify-end">
              <button type="button" className="btn btn-soft !px-3.5 !py-1.5 text-xs" onClick={() => void markNotificationsRead().catch(() => undefined)}>
                <Check size={14} /> Tout marquer comme lu ({unread})
              </button>
            </div>
          )}
          <ul className="space-y-2.5">
            {items.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => void open(n)}
                  className={cn(
                    'card flex w-full items-start gap-3.5 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-card',
                    !n.read_at && 'border-2 border-brand/30 bg-soft/50',
                  )}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-soft text-brand">
                    <Icon kind={n.kind} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="font-display text-sm font-extrabold text-ink">{n.title}</span>
                      {!n.read_at && <span className="h-2 w-2 rounded-full bg-brand" aria-label="Non lue" />}
                    </span>
                    <span className="mt-0.5 block text-sm font-semibold text-muted">{n.body}</span>
                    <span className="mt-1 block text-[11px] font-bold text-muted/80">{ago(n.created_at)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
