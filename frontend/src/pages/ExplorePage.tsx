import { ModuleMark } from '@/components/ModuleMark';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Clock, Grades, Lock } from '@getpapillon/papicons';
import ClassPicker from '@/components/ClassPicker';
import { Empty, PageTitle } from '@/components/ui';
import { modulesOfClass } from '@/lib/content';
import { anneeLabel, classCode, classLabel, moduleCodes, parseClassCode, programmeMeta, specialitesFor } from '@/lib/cursus';
import { useIdentity } from '@/state/useAnnee';

/** Explorer les modules et le classement d'une autre filière ou année, sans quitter son espace. */
export default function ExplorePage() {
  const mine = useIdentity();
  const [params, setParams] = useSearchParams();
  const picked = parseClassCode(params.get('classe')) ?? { programme: mine.programme, annee: mine.annee };
  const isMine = picked.programme === mine.programme && picked.annee === mine.annee;
  const modules = modulesOfClass(picked.programme, picked.annee);
  const meta = programmeMeta(picked.programme);
  const hasSpec = specialitesFor(picked.programme, picked.annee).length > 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageTitle title="Explorer" sub="Parcours les autres filières et années : programmes, modules et classements." />

      <section className="card space-y-4 p-5">
        <ClassPicker
          programme={picked.programme}
          annee={picked.annee}
          mine={{ programme: mine.programme, annee: mine.annee }}
          onChange={(n) => setParams({ classe: classCode(n.programme, n.annee) }, { replace: true })}
        />
        <div className="flex flex-wrap items-center gap-3 border-t border-line/60 pt-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand font-display text-xs font-black text-white" aria-hidden="true">{meta.short}</span>
          <div className="min-w-0 flex-1">
            <div className="font-display text-lg font-extrabold">{classLabel(picked.programme, picked.annee)}</div>
            <div className="text-xs font-bold text-muted">
              {meta.name} · {anneeLabel(picked.annee)}
              {hasSpec ? ' · deux spécialités : ARI et AIP' : ''}
            </div>
          </div>
          <Link to={`/classement?classe=${classCode(picked.programme, picked.annee)}`} className="btn !px-3 !py-1.5 text-xs">
            <Grades size={14} /> Classement
          </Link>
          {isMine && (
            <Link to="/modules" className="btn btn-primary !px-3 !py-1.5 text-xs">
              Mon espace <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </section>

      {modules.length === 0 ? (
        <Empty mood="sleepy" title="Les cours arrivent bientôt">
          <p>Aucun module n’est encore publié pour {classLabel(picked.programme, picked.annee)}. Tu seras prévenu dès qu’il y en aura.</p>
        </Empty>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {modules.map((m) => {
            const spec = moduleCodes(m).filter((c) => c.includes('-')).map((c) => c.split('-')[1]);
            return (
              <Link
                key={m.id}
                to={`/m/${m.id}`}
                className="card flex items-center gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-pop"
              >
                <ModuleMark title={m.title} color={m.color} size={48} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-base font-extrabold">{m.title}</div>
                  <div className="flex flex-wrap items-center gap-x-2 text-[11px] font-bold text-muted">
                    <span className="inline-flex items-center gap-1"><Clock size={12} /> ~{m.estimatedHours} h · {m.chapters.length} chapitres</span>
                    {spec.length > 0 && <span className="rounded bg-soft px-1.5 text-brand">{spec.join(' · ')}</span>}
                  </div>
                </div>
                {!isMine && <Lock size={16} className="shrink-0 text-muted" />}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
