import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Folder, GraduationHat, Lock } from '@getpapillon/papicons';
import { Bar, PageTitle } from '@/components/ui';
import { modules as allModules } from '@/lib/content';
import { useAnnee, useMyModules } from '@/state/useAnnee';
import { moduleRatio, readCount } from '@/lib/stats';
import { useStore } from '@/state/Store';
import { Mascot } from '@/components/Mascot';
import { renderWithAnimatedEmojis } from '@/components/AnimatedEmoji';

export default function ModulesPage() {
  const { state } = useStore();
  const annee = useAnnee();
  const modules = useMyModules();
  const others = allModules.filter((m) => !modules.includes(m));
  return (
    <>
      <PageTitle
        title="Modules universitaires"
        sub={`Programme de ${annee}ᵉ année : lis le cours, lance un QCM, un défi éclair ou une épreuve.`}
        icon={<Folder size={30} />}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        {modules.map((m) => {
          const ratio = moduleRatio(state, m);
          return (
            <Link
              key={m.id}
              to={`/m/${m.id}`}
              className="card group flex flex-col justify-between p-6 transition hover:-translate-y-1 hover:shadow-pop"
            >
              <div>
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl shadow-sm transition-transform group-hover:scale-105"
                    style={{ background: m.color + '26' }}
                  >
                    <Mascot mood="happy" size={68} color={m.color} animate={false} />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1 rounded-full bg-soft px-3 py-0.5 text-xs font-extrabold text-brand">
                      <GraduationHat size={14} /> {m.level}
                    </div>
                    <h2 className="h-display mt-1 text-2xl leading-tight">{renderWithAnimatedEmojis(m.title)}</h2>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs font-bold text-muted">
                      <Clock size={13} /> ~{m.estimatedHours} h · {m.chapters.length} chapitres
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm font-semibold text-muted">{renderWithAnimatedEmojis(m.description)}</p>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-3">
                  <Bar value={ratio} color={m.color} h={10} />
                  <span className="font-display text-sm font-extrabold text-ink">
                    {readCount(state, m)}/{m.chapters.length}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-line/60 pt-3 text-xs font-extrabold text-brand">
                  <span>Ouvrir le parcours</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            </Link>
          );
        })}
        {modules.length === 0 && (
          <p className="card p-6 text-sm font-semibold text-muted sm:col-span-2">
            Les modules de {annee}ᵉ année arrivent bientôt. En attendant, tu peux suivre le classement de ton année.
          </p>
        )}
      </div>

      {others.length > 0 && (
        <section className="mt-10">
          <h2 className="h-display mb-1 flex items-center gap-2 text-xl">
            <Lock size={20} className="text-muted" />
            <span>Autres années</span>
          </h2>
          <p className="mb-4 text-xs font-bold text-muted">
            Réservés à l’autre année d’études. L’accès sera proposé en option payante.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {others.map((m) => (
              <div
                key={m.id}
                className="card flex items-center gap-3 p-4 opacity-70"
                aria-label={`${m.title}, module d’une autre année, verrouillé`}
              >
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl"
                  style={{ background: m.color + '26' }}
                  aria-hidden
                >
                  {m.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-base font-extrabold">{m.title}</div>
                  <div className="text-[11px] font-bold text-muted">
                    {m.annee === 2 ? '2ᵉ' : '3ᵉ'} année · {m.chapters.length} chapitres
                  </div>
                </div>
                <Lock size={18} className="shrink-0 text-muted" />
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
