import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock } from '@getpapillon/papicons';
import { GraduationHat, Play, Check } from '@getpapillon/papicons';
import { Bar, PageTitle, Spinner } from '@/components/ui';
import { loadAllFormations, type FormationWithModule } from '@/lib/content';
import { useMyModules } from '@/state/useAnnee';
import { useStore } from '@/state/Store';
import { AnimatedEmoji, renderWithAnimatedEmojis } from '@/components/AnimatedEmoji';
import { FormationShareAction } from '@/components/FormationShareModal';

export default function FormationsListPage() {
  const { state } = useStore();
  const modules = useMyModules();
  const [allFormations, setFormations] = useState<FormationWithModule[]>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let alive = true;
    loadAllFormations()
      .then((x) => alive && setFormations(x))
      .catch(() => undefined)
      .finally(() => alive && setLoaded(true));
    return () => { alive = false; };
  }, []);
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [status, setStatus] = useState<'all' | 'doing' | 'todo' | 'done'>('all');
  const [query, setQuery] = useState('');
  const doneOf = (f: FormationWithModule) => state.formations?.[`${f.moduleId}:${f.id}`] ?? [];
  const statusOf = (f: FormationWithModule): 'doing' | 'todo' | 'done' => {
    const n = doneOf(f).length;
    return n === 0 ? 'todo' : n >= f.lessons.length ? 'done' : 'doing';
  };
  // Seules les formations des modules de son année sont proposées.
  const formations = useMemo(
    () => allFormations.filter((f) => modules.some((m) => m.id === f.moduleId)),
    [allFormations, modules],
  );

  // Modules distincts
  const availableModules = useMemo(() => {
    const ids = Array.from(new Set(formations.map((f) => f.moduleId)));
    return modules.filter((m) => ids.includes(m.id));
  }, [formations]);

  // Filtrage simple par module
  const filteredFormations = useMemo(() => {
    const q = query.trim().toLowerCase();
    return formations.filter(
      (f) =>
        (selectedModule === 'all' || f.moduleId === selectedModule) &&
        (status === 'all' || statusOf(f) === status) &&
        (!q || `${f.title} ${f.tagline ?? ''}`.toLowerCase().includes(q)),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formations, selectedModule, status, query, state.formations]);
  const inProgress = formations.filter((f) => statusOf(f) === 'doing');

  if (!loaded) return <Spinner />;

  return (
    <div className="space-y-6">
      <PageTitle
        title="Formations"
        sub="Des parcours guidés avec Nimbo : une leçon à la fois, avec exercices."
        icon={<GraduationHat size={28} />}
      />

      {inProgress.length > 0 && status === 'all' && selectedModule === 'all' && !query && (
        <section className="card border-2 border-brand/25 bg-soft/50 p-4">
          <h2 className="mb-2 font-display text-base font-extrabold">Reprendre où tu t'es arrêté</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {inProgress.slice(0, 4).map((f) => (
              <Link
                key={`${f.moduleId}:${f.id}`}
                to={`/m/${f.moduleId}/formation/${f.id}`}
                className="flex items-center gap-3 rounded-2xl bg-card p-3 transition hover:shadow-card"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-extrabold">{f.title}</span>
                  <span className="text-[11px] font-bold text-muted">
                    {doneOf(f).length}/{f.lessons.length} leçons
                  </span>
                </span>
                <Play size={16} className="text-brand" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Chercher une formation…"
          aria-label="Chercher une formation"
          className="min-w-0 flex-1 rounded-2xl border border-line/80 bg-card px-4 py-2 text-sm font-semibold outline-none focus:border-brand sm:max-w-xs"
        />
        <div className="flex gap-1.5 text-xs">
          {([['all', 'Toutes'], ['doing', 'En cours'], ['todo', 'À commencer'], ['done', 'Terminées']] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setStatus(id)}
              className={`whitespace-nowrap rounded-2xl px-3 py-2 font-extrabold transition ${
                status === id ? 'bg-ink text-white' : 'border border-line/80 bg-card text-muted hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Filtres épurés par module */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          type="button"
          onClick={() => setSelectedModule('all')}
          className={`rounded-2xl px-4 py-2 font-extrabold transition whitespace-nowrap ${
            selectedModule === 'all'
              ? 'bg-brand text-white shadow-btn-brand'
              : 'border border-line/80 bg-card text-muted hover:text-ink hover:border-brand/40'
          }`}
        >
          Tous les modules ({formations.length})
        </button>
        {availableModules.map((m) => {
          const count = formations.filter((f) => f.moduleId === m.id).length;
          const isSelected = selectedModule === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelectedModule(m.id)}
              className={`flex items-center gap-1.5 rounded-2xl px-4 py-2 font-extrabold transition whitespace-nowrap ${
                isSelected
                  ? 'text-white shadow-sm'
                  : 'border border-line/80 bg-card text-muted hover:text-ink hover:border-brand/40'
              }`}
              style={isSelected ? { background: m.color } : undefined}
            >
              <span>{m.title}</span>
              <span
                className={`text-[10px] rounded-full px-1.5 py-0.2 ${
                  isSelected ? 'bg-white/25 text-white' : 'bg-soft text-muted'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grille de cartes épurées : Juste l'essentiel */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredFormations.map((f) => {
          const done = state.formations?.[`${f.moduleId}:${f.id}`] ?? [];
          const isCompleted = done.length === f.lessons.length && f.lessons.length > 0;
          const hasStarted = done.length > 0;
          const cardAccent = f.color || f.moduleColor;

          return (
            <div
              key={`${f.moduleId}:${f.id}`}
              className="card group flex flex-col justify-between p-5 border border-line/70 transition-all hover:-translate-y-0.5 hover:shadow-card hover:border-brand/40"
            >
              <div>
                {/* Module discret */}
                <div className="flex items-center gap-1.5 text-xs font-bold text-muted mb-3">
                  <span className="truncate">{f.moduleTitle}</span>
                </div>

                {/* Titre de la formation */}
                <Link to={`/m/${f.moduleId}/formation/${f.id}`} className="block">
                  <h3 className="h-display text-xl leading-snug text-ink group-hover:text-brand transition flex items-center gap-2.5">
                    <span>{f.title}</span>
                  </h3>
                </Link>
                {f.tagline && <p className="mt-2 line-clamp-2 text-xs font-semibold text-muted">{f.tagline}</p>}
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold text-muted">
                  <span className="flex items-center gap-1"><Clock size={12} /> ~{f.minutes} min</span>
                  <span>{f.lessons.length} leçons</span>
                  {f.level && <span className="rounded-full bg-soft px-2 text-brand">{f.level}</span>}
                </div>
                {hasStarted && (
                  <div className="mt-3 flex items-center gap-2">
                    <Bar value={done.length / Math.max(1, f.lessons.length)} color={cardAccent} h={8} />
                    <span className="text-[11px] font-extrabold text-muted">{done.length}/{f.lessons.length}</span>
                  </div>
                )}
              </div>

              {/* Actions en bas : Commencer & Partager (copie directe) */}
              <div className="mt-5 flex items-center justify-between gap-2 pt-3 border-t border-line/60">
                <Link
                  to={`/m/${f.moduleId}/formation/${f.id}`}
                  className="btn btn-primary !px-4 !py-2 text-xs font-extrabold gap-1.5"
                >
                  {isCompleted ? <Check size={14} /> : <Play size={14} />}
                  <span>{isCompleted ? 'Revoir' : hasStarted ? 'Continuer' : 'Commencer'}</span>
                </Link>

                <FormationShareAction formation={f} />
              </div>
            </div>
          );
        })}
        {filteredFormations.length === 0 && (
          <p className="card p-6 text-sm font-semibold text-muted sm:col-span-2 lg:col-span-3">
            Aucune formation ne correspond à ces filtres.
          </p>
        )}
      </div>
    </div>
  );
}
