import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from '@getpapillon/papicons';
import { AnimatedEmoji } from '@/components/AnimatedEmoji';
import { loadFormations } from '@/lib/content';
import type { Formation, FormationRef } from '@/lib/types';
import { useStore } from '@/state/Store';

/**
 * Carte « formation prérequise » : indique l'avancement de l'élève et lui permet d'aller la suivre.
 * `returnTo` (chemin interne) permet de proposer « Reprendre ma formation » une fois sur place.
 */
export function PrereqCard({ r, moduleId, returnTo, hideWhenDone, className = '' }: {
  r: FormationRef; moduleId: string; returnTo?: string; hideWhenDone?: boolean; className?: string;
}) {
  const mid = r.moduleId ?? moduleId;
  const { state } = useStore();
  const [target, setTarget] = useState<Formation | null | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    loadFormations(mid)
      .then((list) => alive && setTarget(list.find((x) => x.id === r.formation) ?? null))
      .catch(() => alive && setTarget(null));
    return () => { alive = false; };
  }, [mid, r.formation]);

  if (!target) return null;
  const done = state.formations?.[`${mid}:${target.id}`] ?? [];
  const doneCount = target.lessons.filter((l) => done.includes(l.id)).length;
  const finished = doneCount >= target.lessons.length;
  if (finished && hideWhenDone) return null;

  const first = target.lessons.find((l) => !done.includes(l.id)) ?? target.lessons[0];
  const safeReturn = returnTo && returnTo.startsWith('/m/') ? `?from=${encodeURIComponent(returnTo)}` : '';
  const to = `/m/${mid}/formation/${target.id}${doneCount > 0 && !finished ? `/${first.id}` : ''}${safeReturn}`;

  return (
    <div className={`card flex flex-wrap items-center gap-3 p-3.5 ${className}`} style={{ borderLeft: `5px solid ${target.color}` }}>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-muted">Formation prérequise</p>
        <p className="font-display text-base font-extrabold leading-tight">{target.title}</p>
        {r.why && <p className="mt-0.5 text-xs font-semibold text-muted">{r.why}</p>}
        <p className={`mt-1 text-xs font-extrabold ${finished ? 'text-good' : 'text-muted'}`}>
          {finished ? <><Check size={13} className="inline" /> Validée : tu peux continuer</> : `${doneCount}/${target.lessons.length} leçons suivies`}
        </p>
      </div>
      <Link to={to} className={`btn ${finished ? 'btn-soft' : 'btn-primary'} !px-4 !py-2 text-sm`}>
        {finished ? 'Revoir' : doneCount > 0 ? 'Reprendre' : 'Suivre cette formation'} <ArrowRight size={16} />
      </Link>
    </div>
  );
}
