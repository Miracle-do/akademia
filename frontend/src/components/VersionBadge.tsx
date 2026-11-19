import { useMemo, useState } from 'react';
import changelogRaw from '../../CHANGELOG.md?raw';

interface Release { version: string; date: string; intro: string[]; groups: { title: string; items: string[] }[] }

/** Lit CHANGELOG.md : « ## [x.y.z] — date », puis « ### Rubrique » et des puces « - … ». La section « Non publié » est ignorée. */
function parseChangelog(raw: string): Release[] {
  const out: Release[] = [];
  for (const block of raw.split(/^## /m).slice(1)) {
    const lines = block.split('\n');
    const head = lines[0].match(/^\[(\d+\.\d+\.\d+)\]\s*—\s*(.+)$/);
    if (!head) continue;
    const rel: Release = { version: head[1], date: head[2].trim(), intro: [], groups: [] };
    for (const line of lines.slice(1)) {
      const t = line.trim();
      if (!t) continue;
      if (t.startsWith('### ')) rel.groups.push({ title: t.slice(4), items: [] });
      else if (t.startsWith('- ') && rel.groups.length) rel.groups[rel.groups.length - 1].items.push(t.slice(2).replace(/`/g, ''));
      else if (!rel.groups.length) rel.intro.push(t);
    }
    out.push(rel);
  }
  return out;
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Affiche « Akademia v1.0.0 » ; un clic ouvre « Quoi de neuf ? » avec les dernières versions. */
export default function VersionBadge({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const releases = useMemo(() => parseChangelog(changelogRaw).slice(0, 3), []);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={`text-[11px] font-bold text-muted underline-offset-2 hover:underline ${className}`}>
        Akademia v{__APP_VERSION__} · Quoi de neuf ?
      </button>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-3 sm:items-center" role="dialog" aria-modal="true" aria-label="Quoi de neuf ?" onClick={() => setOpen(false)}>
          <div className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-3xl bg-card p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-extrabold">Quoi de neuf ?</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Fermer" className="px-2 text-muted">✕</button>
            </div>
            {releases.length === 0 && <p className="text-sm text-muted">Aucune note de version pour le moment.</p>}
            {releases.map((r) => (
              <section key={r.version} className="mb-4">
                <h3 className="font-display text-base font-extrabold">v{r.version} <span className="text-xs font-semibold text-muted">· {fmtDate(r.date)}</span></h3>
                {r.intro.map((t) => <p key={t} className="text-sm text-muted">{t}</p>)}
                {r.groups.map((g) => (
                  <div key={g.title} className="mt-2">
                    <div className="text-xs font-extrabold uppercase tracking-wide text-muted">{g.title}</div>
                    <ul className="ml-4 list-disc space-y-1 text-sm">
                      {g.items.map((it) => <li key={it}>{it}</li>)}
                    </ul>
                  </div>
                ))}
              </section>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
