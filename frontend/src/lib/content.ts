/**
 * Chargement du contenu pédagogique.
 * L’API backend concentre désormais la source de vérité pour les données pédagogiques,
 * tandis que le système local reste en fallback pour garder l’application fonctionnelle.
 */
import { classCode, moduleCodes, moduleVisibleFor } from './cursus';
import type { ChapterMeta, Exam, Formation, ExamIndexItem, Flashcard, ModuleMeta, Question, Quest } from './types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api';

const metaFiles = import.meta.glob('/content/modules/*/module.json', { eager: true, import: 'default' }) as Record<string, ModuleMeta>;
const chapterLoaders = import.meta.glob('/content/modules/*/chapters/*.md', { query: '?raw', import: 'default' }) as Record<string, () => Promise<string>>;
const quizLoaders = import.meta.glob('/content/modules/*/quiz.json', { import: 'default' }) as Record<string, () => Promise<Question[]>>;
const cardLoaders = import.meta.glob('/content/modules/*/flashcards.json', { import: 'default' }) as Record<string, () => Promise<Flashcard[]>>;
const examIndexLoaders = import.meta.glob('/content/modules/*/exams-index.json', { import: 'default' }) as Record<string, () => Promise<ExamIndexItem[]>>;
const formationLoaders = import.meta.glob('/content/modules/*/formations/*.json', { import: 'default' }) as Record<string, () => Promise<Formation>>;
const examLoaders = import.meta.glob('/content/modules/*/exams/*.json', { import: 'default' }) as Record<string, () => Promise<Exam>>;
const questLoaders = import.meta.glob('/content/modules/*/quests/*.json', { import: 'default' }) as Record<string, () => Promise<Quest>>;

const OFFLINE_KEY = 'akademia-offline-build';
const idle = () => new Promise<void>((r) => ('requestIdleCallback' in window ? (window as unknown as { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(() => r()) : setTimeout(r, 120)));

/**
 * Télécharge discrètement chapitres et QCM pour le mode hors ligne : par petits lots, quand le navigateur est inactif,
 * une seule fois par version déployée, et jamais en mode économie de données ou sur connexion très lente.
 */
export async function prepareOfflineContent(): Promise<void> {
  if (!navigator.onLine) return;
  const conn = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (conn?.saveData || /(^|-)2g$/.test(conn?.effectiveType ?? '')) return;
  try { if (localStorage.getItem(OFFLINE_KEY) === __BUILD_ID__) return; } catch { /* stockage indisponible : on continue */ }
  // Tout ce que l'appli peut charger à la demande (pages, chapitres, QCM, flashcards, examens, formations).
  let files: string[] = [];
  try {
    const res = await fetch('/asset-manifest.json', { cache: 'no-store' });
    if (res.ok) files = (await res.json()) as string[];
  } catch { /* indisponible (mode dev) */ }
  if (!files.length) {
    const loaders = [...Object.values(chapterLoaders), ...Object.values(quizLoaders), ...Object.values(cardLoaders), ...Object.values(examIndexLoaders), ...Object.values(examLoaders), ...Object.values(formationLoaders), ...Object.values(questLoaders)];
    for (let i = 0; i < loaders.length; i += 4) {
      if (!navigator.onLine) return;
      await Promise.allSettled(loaders.slice(i, i + 4).map((load) => load()));
      await idle();
    }
  } else {
    let failed = 0;
    for (let i = 0; i < files.length; i += 6) {
      if (!navigator.onLine) return;
      const results = await Promise.allSettled(files.slice(i, i + 6).map((f) => fetch(f).then((r) => { if (!r.ok) throw new Error(f); })));
      failed += results.filter((r) => r.status === 'rejected').length;
      await idle();
    }
    if (failed > 0) return; // on réessaiera au prochain lancement
    await purgeOldAssets(files);
  }
  try { localStorage.setItem(OFFLINE_KEY, __BUILD_ID__); } catch { /* ignoré */ }
}

/** Supprime du cache les fichiers /assets/ des anciennes versions (ils ne sont plus référencés) pour libérer l'espace du téléphone. */
async function purgeOldAssets(current: string[]): Promise<void> {
  try {
    if (!('caches' in window)) return;
    const keep = new Set(current);
    const cache = await caches.open('akademia-assets-v1');
    for (const req of await cache.keys()) {
      const path = new URL(req.url).pathname;
      if (path.startsWith('/assets/') && !keep.has(path)) await cache.delete(req);
    }
  } catch { /* nettoyage facultatif */ }
}

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    throw new Error(`API introuvable: ${path}`);
  }
  return res.json() as Promise<T>;
}

async function apiGetText(path: string): Promise<string> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    throw new Error(`API introuvable: ${path}`);
  }
  return res.text();
}

export const modules: ModuleMeta[] = Object.values(metaFiles).sort((a, b) => a.title.localeCompare(b.title, 'fr'));

/** Classes visées par un module (voir cursus.ts). */
export const moduleClasses = (m: ModuleMeta): string[] => moduleCodes(m);

/** Modules ouverts à une classe : sa filière + année (et sa spécialité en IG3). */
export const modulesForClass = (programme: unknown, annee: unknown, specialite?: unknown): ModuleMeta[] =>
  modules.filter((m) => moduleVisibleFor(m, programme, annee, specialite));

/** Modules d'une classe donnée, toutes spécialités confondues (pour explorer une autre classe). */
export const modulesOfClass = (programme: unknown, annee: unknown): ModuleMeta[] => {
  const base = classCode(programme, annee);
  return modules.filter((m) => moduleCodes(m).some((c) => c === base || c.startsWith(`${base}-`)));
};

export function getModule(id: string | undefined): ModuleMeta | undefined {
  return modules.find((m) => m.id === id);
}
export function getChapter(mod: ModuleMeta, chapterId: string | undefined): ChapterMeta | undefined {
  return mod.chapters.find((c) => c.id === chapterId);
}
export function chapterNeighbors(mod: ModuleMeta, chapterId: string) {
  const i = mod.chapters.findIndex((c) => c.id === chapterId);
  return { prev: i > 0 ? mod.chapters[i - 1] : undefined, next: i >= 0 && i < mod.chapters.length - 1 ? mod.chapters[i + 1] : undefined };
}

const cache = new Map<string, Promise<unknown>>();
function memo<T>(key: string, fn: () => Promise<T>): Promise<T> {
  if (!cache.has(key)) cache.set(key, fn());
  return cache.get(key) as Promise<T>;
}
function pick<T>(map: Record<string, () => Promise<T>>, path: string): () => Promise<T> {
  const f = map[path];
  if (!f) return () => Promise.reject(new Error(`Contenu introuvable : ${path}`));
  return f;
}

export const loadChapter = (moduleId: string, file: string) =>
  memo(`ch:${moduleId}:${file}`, async () => {
    try {
      return await apiGetText(`/modules/${encodeURIComponent(moduleId)}/chapters/${encodeURIComponent(file)}`);
    } catch {
      return pick(chapterLoaders, `/content/modules/${moduleId}/chapters/${file}`)();
    }
  });

export const loadQuiz = (moduleId: string) =>
  memo(`quiz:${moduleId}`, async () => {
    try {
      return await apiGet<Question[]>(`/modules/${encodeURIComponent(moduleId)}/quiz`);
    } catch {
      return quizLoaders[`/content/modules/${moduleId}/quiz.json`] ? quizLoaders[`/content/modules/${moduleId}/quiz.json`]() : Promise.resolve([] as Question[]);
    }
  });

export const loadCards = (moduleId: string) =>
  memo(`cards:${moduleId}`, async () => {
    try {
      return await apiGet<Flashcard[]>(`/modules/${encodeURIComponent(moduleId)}/cards`);
    } catch {
      return cardLoaders[`/content/modules/${moduleId}/flashcards.json`] ? cardLoaders[`/content/modules/${moduleId}/flashcards.json`]() : Promise.resolve([] as Flashcard[]);
    }
  });

export const loadExamIndex = (moduleId: string) =>
  memo(`exidx:${moduleId}`, async () => {
    try {
      return await apiGet<ExamIndexItem[]>(`/modules/${encodeURIComponent(moduleId)}/exams-index`);
    } catch {
      return examIndexLoaders[`/content/modules/${moduleId}/exams-index.json`] ? examIndexLoaders[`/content/modules/${moduleId}/exams-index.json`]() : Promise.resolve([] as ExamIndexItem[]);
    }
  });

export const loadExam = (moduleId: string, n: number) =>
  memo(`exam:${moduleId}:${n}`, async () => {
    try {
      return await apiGet<Exam>(`/modules/${encodeURIComponent(moduleId)}/exams/${encodeURIComponent(String(n).padStart(2, '0'))}`);
    } catch {
      return pick(examLoaders, `/content/modules/${moduleId}/exams/e${String(n).padStart(2, '0')}.json`)();
    }
  });

/** Formations d'un module lues depuis les fichiers embarqués (chargées à la demande, hors du bundle principal). */
async function readLocalFormations(moduleId: string): Promise<Formation[]> {
  const prefix = `/content/modules/${moduleId}/formations/`;
  const list = await Promise.all(
    Object.entries(formationLoaders)
      .filter(([p]) => p.startsWith(prefix))
      .map(([, load]) => load()),
  );
  return list.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

/** Formations d'un module (API puis repli local). */
export const loadFormations = (moduleId: string) =>
  memo(`formations:${moduleId}`, async () => {
    let list: Formation[];
    try {
      list = await apiGet<Formation[]>(`/modules/${encodeURIComponent(moduleId)}/formations`);
    } catch {
      list = await readLocalFormations(moduleId);
    }
    return list.map((f) => ({ ...f, moduleId }));
  });

/** Quêtes d'un module lues depuis les fichiers embarqués. */
async function readLocalQuests(moduleId: string): Promise<Quest[]> {
  const prefix = `/content/modules/${moduleId}/quests/`;
  const list = await Promise.all(
    Object.entries(questLoaders)
      .filter(([p]) => p.startsWith(prefix))
      .map(([, load]) => load()),
  );
  return list.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

/** Quêtes d'un module (API puis repli local). */
export const loadQuests = (moduleId: string) =>
  memo(`quests:${moduleId}`, async () => {
    let list: Quest[];
    try {
      list = await apiGet<Quest[]>(`/modules/${encodeURIComponent(moduleId)}/quests`);
    } catch {
      list = await readLocalQuests(moduleId);
    }
    return list.map((q) => ({ ...q, moduleId }));
  });

export interface FormationWithModule extends Formation {
  moduleTitle: string;
  moduleEmoji: string;
  moduleColor: string;
}

/** Chargement asynchrone de toutes les formations tous modules confondus. */
export const loadAllFormations = async (): Promise<FormationWithModule[]> => {
  const allModules = modules;
  const lists = await Promise.all(
    allModules.map(async (m) => {
      try {
        const forms = await loadFormations(m.id);
        return forms.map((f) => ({
          ...f,
          moduleTitle: m.title,
          moduleEmoji: m.emoji,
          moduleColor: m.color,
        }));
      } catch {
        return (await readLocalFormations(m.id)).map((f) => ({
          ...f,
          moduleTitle: m.title,
          moduleEmoji: m.emoji,
          moduleColor: m.color,
        }));
      }
    }),
  );
  return lists.flat().sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
};

