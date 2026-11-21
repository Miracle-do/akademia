// Recherche plein texte dans les cours : l'index (public/search-index.json) est téléchargé au premier usage.
export interface IndexItem {
  m: string; // module
  c: string; // chapitre
  t: string; // titre
  n: string; // numéro
  s: string; // résumé
  h: string[]; // intertitres
  x: string; // texte brut
}
interface Prepared extends IndexItem {
  nt: string;
  nh: string;
  nx: string;
}
export interface SearchHit {
  item: IndexItem;
  score: number;
  snippet: string;
  /** Intertitre le plus proche de l'extrait, utile pour situer le résultat. */
  heading?: string;
}

/** Minuscules sans accents ; la longueur est conservée pour pouvoir repérer les mots dans le texte d'origine. */
export function norm(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function tokenize(query: string): string[] {
  return [...new Set(norm(query).split(/[^a-z0-9+#*$]+/).filter((t) => t.length >= 2 || /\d/.test(t)))];
}

/** Position d'un mot dans un texte normalisé. Les mots courts (« ip », « dns ») doivent commencer un mot : « ip » ne doit pas matcher « philosophie ». */
function find(text: string, t: string, from = 0): number {
  for (let i = text.indexOf(t, from); i >= 0; i = text.indexOf(t, i + 1)) {
    if (t.length >= 4 || i === 0 || !/[a-z0-9]/.test(text[i - 1])) return i;
  }
  return -1;
}

let indexPromise: Promise<Prepared[]> | null = null;

export function loadSearchIndex(): Promise<Prepared[]> {
  if (!indexPromise) {
    indexPromise = fetch(`${import.meta.env.BASE_URL}search-index.json?v=${__BUILD_ID__}`)
      .then((r) => {
        if (!r.ok) throw new Error('Index de recherche indisponible');
        return r.json() as Promise<{ items: IndexItem[] }>;
      })
      .then(({ items }) => items.map((i) => ({ ...i, nt: norm(`${i.n} ${i.t} ${i.s}`), nh: norm(i.h.join(' \n ')), nx: norm(i.x) })))
      .catch((e) => {
        indexPromise = null; // nouvel essai possible à la prochaine recherche
        throw e;
      });
  }
  return indexPromise;
}

function makeSnippet(item: Prepared, tokens: string[]): { snippet: string; heading?: string } {
  let pos = -1;
  for (const t of tokens) {
    const i = find(item.nx, t);
    if (i >= 0 && (pos < 0 || i < pos)) pos = i;
  }
  if (pos < 0) return { snippet: item.s || item.x.slice(0, 160) };
  const start = Math.max(0, pos - 70);
  const end = Math.min(item.x.length, pos + 150);
  const snippet = `${start > 0 ? '… ' : ''}${item.x.slice(start, end).trim()}${end < item.x.length ? ' …' : ''}`;
  // Intertitre le plus proche : le dernier dont le texte apparaît avant la position de l'extrait.
  let heading: string | undefined;
  let hp = -1;
  for (const h of item.h) {
    const i = item.nx.indexOf(norm(h));
    if (i >= 0 && i <= pos && i > hp) {
      hp = i;
      heading = h;
    }
  }
  return { snippet, heading };
}

/** `allowed` : modules consultables (ceux de l'année de l'étudiant) ; filtré avant la limite de résultats. */
export async function searchCourses(query: string, moduleId?: string, limit = 40, allowed?: string[]): Promise<SearchHit[]> {
  const tokens = tokenize(query);
  if (!tokens.length) return [];
  const index = await loadSearchIndex();
  const hits: SearchHit[] = [];
  for (const item of index) {
    if (moduleId && item.m !== moduleId) continue;
    if (allowed && !allowed.includes(item.m)) continue;
    let score = 0;
    let all = true;
    for (const t of tokens) {
      const inTitle = find(item.nt, t) >= 0;
      const inHeads = find(item.nh, t) >= 0;
      let count = 0;
      for (let i = find(item.nx, t); i >= 0 && count < 8; i = find(item.nx, t, i + t.length)) count++;
      if (!inTitle && !inHeads && !count) {
        all = false;
        break;
      }
      score += (inTitle ? 12 : 0) + (inHeads ? 6 : 0) + count;
    }
    if (!all) continue;
    // Bonus si l'expression complète apparaît telle quelle.
    const phrase = norm(query).trim();
    if (tokens.length > 1 && item.nx.includes(phrase)) score += 10;
    hits.push({ item, score, ...makeSnippet(item, tokens) });
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

/** Découpe un extrait pour surligner les mots recherchés (sans passer par du HTML brut). */
export function highlight(text: string, tokens: string[]): { text: string; hit: boolean }[] {
  const n = norm(text);
  const marks = new Array<boolean>(text.length).fill(false);
  for (const t of tokens) {
    for (let i = find(n, t); i >= 0; i = find(n, t, i + t.length)) {
      for (let k = i; k < i + t.length && k < marks.length; k++) marks[k] = true;
    }
  }
  const out: { text: string; hit: boolean }[] = [];
  let buf = '';
  let cur = false;
  for (let i = 0; i < text.length; i++) {
    if (marks[i] !== cur && buf) {
      out.push({ text: buf, hit: cur });
      buf = '';
    }
    cur = marks[i];
    buf += text[i];
  }
  if (buf) out.push({ text: buf, hit: cur });
  return out;
}
