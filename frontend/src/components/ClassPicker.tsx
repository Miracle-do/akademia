import { ANNEES, PROGRAMMES, anneeLabel, programmeMeta, type ProgrammeId } from '@/lib/cursus';
import { cn } from '@/lib/utils';
import type { AnneeId } from '@/lib/types';

interface Props {
  programme: ProgrammeId;
  annee: AnneeId;
  onChange(next: { programme: ProgrammeId; annee: AnneeId }): void;
  /** Classe de l'étudiant : repérée par un point, pour s'y retrouver vite. */
  mine?: { programme: ProgrammeId; annee: AnneeId };
}

/** Sélecteur de classe (filière + année), compact : une rangée de filières et trois années. */
export default function ClassPicker({ programme, annee, onChange, mine }: Props) {
  const meta = programmeMeta(programme);
  const isMine = (p: ProgrammeId, a: AnneeId) => !!mine && mine.programme === p && mine.annee === a;
  return (
    <div className="space-y-3">
      <div role="radiogroup" aria-label="Filière" className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {PROGRAMMES.map((p) => {
          const active = p.id === programme;
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange({ programme: p.id, annee })}
              className={cn(
                'shrink-0 rounded-2xl border-2 px-3 py-1.5 text-xs font-extrabold transition',
                active ? 'border-brand bg-brand text-white shadow-card' : 'border-line/70 bg-card text-ink hover:border-brand/40',
              )}
            >
              {p.short}
              {mine?.programme === p.id && <span className="ml-1 text-[9px] opacity-80">●</span>}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div role="radiogroup" aria-label="Année" className="inline-flex rounded-2xl border border-line/70 bg-card p-1">
          {ANNEES.map((a) => {
            const active = a === annee;
            return (
              <button
                key={a}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onChange({ programme, annee: a })}
                className={cn(
                  'rounded-xl px-4 py-1 text-xs font-extrabold transition',
                  active ? 'bg-soft text-brand' : 'text-muted hover:text-ink',
                )}
              >
                {a === 1 ? '1ʳᵉ' : `${a}ᵉ`}
                {isMine(programme, a) && <span className="ml-1 text-[9px]">●</span>}
              </button>
            );
          })}
        </div>
        <span className="text-xs font-bold text-muted">
          {meta.name} · {anneeLabel(annee)}
        </span>
      </div>
    </div>
  );
}
