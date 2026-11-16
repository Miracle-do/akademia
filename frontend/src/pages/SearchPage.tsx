import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Empty, PageTitle, Spinner } from '@/components/ui';
import { SearchIcon } from '@/components/SearchIcon';
import { modules } from '@/lib/content';
import { highlight, norm, searchCourses, SearchHit, tokenize } from '@/lib/search';

function Marked({ text, tokens }: { text: string; tokens: string[] }) {
  return (
    <>
      {highlight(text, tokens).map((p, i) =>
        p.hit ? (
          <mark key={i} className="rounded bg-brand/15 px-0.5 font-extrabold text-ink">
            {p.text}
          </mark>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </>
  );
}

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const initial = params.get('q') ?? '';
  const [input, setInput] = useState(initial);
  const [moduleId, setModuleId] = useState(params.get('m') ?? '');
  const [hits, setHits] = useState<SearchHit[] | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);
  const query = input.trim();
  const tokens = useMemo(() => tokenize(query), [query]);

  useEffect(() => inputRef.current?.focus(), []);

  useEffect(() => {
    if (!tokens.length) {
      setHits(null);
      setState('idle');
      return;
    }
    let alive = true;
    setState('loading');
    const t = window.setTimeout(() => {
      searchCourses(query, moduleId || undefined)
        .then((r) => alive && (setHits(r), setState('idle')))
        .catch(() => alive && setState('error'));
      const next = new URLSearchParams();
      next.set('q', query);
      if (moduleId) next.set('m', moduleId);
      setParams(next, { replace: true });
    }, 180);
    return () => {
      alive = false;
      window.clearTimeout(t);
    };
  }, [query, moduleId, tokens.length, setParams]);

  // Modules dont le titre correspond : accès direct.
  const moduleMatches = useMemo(
    () => (tokens.length ? modules.filter((m) => tokens.every((t) => norm(`${m.title} ${m.subtitle}`).includes(t))) : []),
    [tokens],
  );
  const moduleOf = (id: string) => modules.find((m) => m.id === id);

  return (
    <>
      <PageTitle title="Rechercher dans les cours" sub="Un mot, une notion, une formule : trouve le chapitre qui en parle." icon={<SearchIcon size={30} />} />

      <div className="card mb-5 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <label className="flex flex-1 items-center gap-3 rounded-2xl border border-line bg-bg px-4 py-2.5 focus-within:border-brand">
          <SearchIcon size={20} className="shrink-0 text-muted" />
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ex. : skolémisation, A*, matrice de confusion…"
            className="w-full bg-transparent text-base font-bold text-ink outline-none placeholder:font-semibold placeholder:text-muted"
            aria-label="Rechercher dans les cours"
            autoComplete="off"
            enterKeyHint="search"
          />
          {input && (
            <button type="button" onClick={() => { setInput(''); inputRef.current?.focus(); }} className="text-xs font-extrabold text-muted hover:text-ink" aria-label="Effacer la recherche">
              Effacer
            </button>
          )}
        </label>
        <select
          value={moduleId}
          onChange={(e) => setModuleId(e.target.value)}
          className="rounded-2xl border border-line bg-bg px-3 py-2.5 text-sm font-extrabold text-ink"
          aria-label="Limiter la recherche à un module"
        >
          <option value="">Tous les modules</option>
          {modules.map((m) => (
            <option key={m.id} value={m.id}>
              {m.emoji} {m.title}
            </option>
          ))}
        </select>
      </div>

      {state === 'error' && <Empty title="Recherche indisponible">L'index n'a pas pu être chargé. Vérifie ta connexion et réessaie.</Empty>}
      {state === 'loading' && !hits && <Spinner label="Recherche…" size="3rem" />}

      {!tokens.length && state !== 'error' && (
        <Empty title="Que cherches-tu ?">Tape au moins deux lettres. Plusieurs mots : tous doivent apparaître dans le chapitre. Les accents sont ignorés.</Empty>
      )}

      {moduleMatches.length > 0 && !moduleId && (
        <div className="mb-4 flex flex-wrap gap-2">
          {moduleMatches.map((m) => (
            <Link key={m.id} to={`/m/${m.id}`} className="rounded-2xl border border-line bg-card px-3 py-2 text-sm font-extrabold text-ink shadow-card hover:border-brand/40">
              {m.emoji} Module · {m.title}
            </Link>
          ))}
        </div>
      )}

      {hits && state !== 'error' && (
        <>
          <p className="mb-3 text-sm font-extrabold text-muted" aria-live="polite">
            {hits.length === 0 ? 'Aucun résultat.' : `${hits.length}${hits.length === 40 ? '+' : ''} chapitre${hits.length > 1 ? 's' : ''} trouvé${hits.length > 1 ? 's' : ''}`}
          </p>
          {hits.length === 0 && <Empty title="Rien trouvé">Essaie un mot plus court, sans pluriel, ou un seul mot-clé.</Empty>}
          <ul className="space-y-3">
            {hits.map(({ item, snippet, heading }) => {
              const mod = moduleOf(item.m);
              return (
                <li key={`${item.m}/${item.c}`}>
                  <Link to={`/m/${item.m}/lire/${item.c}`} className="card block p-4 transition hover:-translate-y-0.5 hover:shadow-pop">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-extrabold uppercase tracking-wide text-brand">
                      <span>{mod?.emoji} {mod?.title ?? item.m}</span>
                      {item.n && <span className="text-muted">· Chapitre {item.n}</span>}
                    </div>
                    <h2 className="mt-1 font-display text-lg font-extrabold text-ink">
                      <Marked text={item.t} tokens={tokens} />
                    </h2>
                    {heading && heading !== item.t && <p className="text-xs font-extrabold text-muted">§ {heading}</p>}
                    <p className="mt-1.5 text-sm font-semibold leading-relaxed text-muted">
                      <Marked text={snippet} tokens={tokens} />
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </>
  );
}
