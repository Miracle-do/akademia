import { ModuleMark } from '@/components/ModuleMark';
import { Link, Outlet, useParams } from 'react-router-dom';
import { getModule } from '@/lib/content';
import { moduleCodes, OPEN_OTHER_CLASSES, moduleVisibleFor } from '@/lib/cursus';
import { useIdentity } from '@/state/useAnnee';

/**
 * Protège les routes /m/:moduleId/* : un module d'une autre classe (filière ou année) que celle de l'étudiant
 * se consulte en aperçu (description et plan) mais ne s'ouvre pas : accès complet à venir en option.
 * Un module inconnu laisse la page gérer sa redirection.
 */
export default function ModuleGate() {
  const { moduleId } = useParams();
  const { programme, annee, filiere } = useIdentity();
  const m = getModule(moduleId);
  if (!m || OPEN_OTHER_CLASSES || moduleVisibleFor(m, programme, annee, filiere)) return <Outlet />;

  const codes = moduleCodes(m).map((c) => c.replace('-', ' · '));
  const parts = m.parts?.length
    ? m.parts.map((p) => ({ title: p.title, chapters: m.chapters.filter((c) => p.chapters.includes(c.id)) }))
    : [{ title: 'Chapitres', chapters: m.chapters }];
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <section className="card space-y-3 p-6">
        <div className="flex items-start gap-3">
          <ModuleMark title={m.title} color={m.color} size={48} />
          <div className="min-w-0">
            <h1 className="h-display text-2xl">{m.title}</h1>
            <p className="text-sm font-semibold text-muted">{m.subtitle}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {codes.map((c) => (
                <span key={c} className="rounded-full bg-soft px-2.5 py-0.5 text-[11px] font-extrabold text-brand">{c}</span>
              ))}
            </div>
          </div>
        </div>
        <p className="text-sm text-ink/80">{m.description}</p>
        <div className="rounded-2xl border border-line/70 bg-soft/60 p-4 text-sm font-semibold">
          Ce module n’est pas dans ta classe. Tu peux le parcourir ici ; l’accès complet aux autres classes sera
          proposé en option.
        </div>
      </section>

      <section className="card space-y-3 p-6">
        <h2 className="font-display text-lg font-extrabold">Au programme · {m.chapters.length} chapitres</h2>
        {parts.map((p) => (
          <div key={p.title}>
            <div className="text-xs font-extrabold uppercase tracking-wider text-muted">{p.title}</div>
            <ul className="mt-1 space-y-1">
              {p.chapters.map((c) => (
                <li key={c.id} className="text-sm font-semibold text-ink/85">• {c.title}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <div className="flex flex-wrap gap-3">
        <Link to="/modules" className="btn btn-primary !py-2 text-xs">Mes modules</Link>
        <Link to="/explorer" className="btn !py-2 text-xs">Explorer les autres classes</Link>
      </div>
    </div>
  );
}
