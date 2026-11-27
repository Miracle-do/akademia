// ---------- Contenu (défini dans /content/modules/<id>) ----------
export interface ChapterMeta {
  id: string;
  number: string;
  title: string;
  summary: string;
  minutes: number;
  file: string;
}
export interface PartMeta {
  id: string;
  title: string;
  chapters: string[];
}
export interface ModuleMeta {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  emoji: string;
  color: string;
  level: string;
  estimatedHours: number;
  /** Classes destinataires, ex. ["IG3"], ["GRH1","GRH2"] ou ["IG3-ARI"] (spécialité). */
  cursus?: string[];
  /** Ancien format : année d'études d'IG (2 ou 3). Utilisé seulement si `cursus` est absent. */
  annee?: AnneeId;
  parts: PartMeta[];
  chapters: ChapterMeta[];
  features: { quiz?: boolean; blitz?: boolean; exams?: boolean; flashcards?: boolean };
}
export interface Question {
  id: string;
  chapter: string;
  difficulty: 1 | 2 | 3;
  q: string;
  options: string[];
  answer: number;
  explain: string;
}
export interface Flashcard {
  id: string;
  front: string;
  back: string;
  tag: string;
}
export interface ExamIndexItem {
  n: number;
  title: string;
  scenario: string;
  cas: string;
  durationMinutes: number;
  points: number;
}
export interface ExamQuestion {
  id: string;
  q: string;
  a: string;
  points: number;
}
export interface ExamPart {
  id: string;
  title: string;
  points: number;
  intro?: string;
  context?: string;
  questions: ExamQuestion[];
}
export interface Exam {
  n: number;
  title: string;
  durationMinutes: number;
  points: number;
  parts: ExamPart[];
}

// ---------- Formations (parcours coachés thématiques) ----------
/** Condition déclarative vérifiée après une commande, dans un atelier terminal (toutes doivent être vraies). */
export interface TerminalCheck {
  /** Expression régulière testée sur la dernière commande tapée (espaces normalisés). */
  commandPattern?: string;
  /** La dernière commande doit (ou ne doit pas) avoir produit une erreur. */
  mustError?: boolean;
  /** Répertoire courant attendu (chemin absolu). */
  cwd?: string;
  /** Un fichier/dossier doit exister à ce chemin. */
  filePresent?: string;
  /** Un fichier/dossier ne doit plus exister à ce chemin. */
  fileAbsent?: string;
  /** Contenu exact attendu (après trim) pour le fichier à ce chemin. */
  fileEquals?: { path: string; value: string };
  /** Le contenu du fichier à ce chemin doit contenir cette sous-chaîne. */
  fileContains?: { path: string; value: string };
  /** Mode (droits) exact attendu, en octal à 3 chiffres (ex. "600"). */
  fileMode?: { path: string; value: string };
}
export interface TerminalMission {
  /** Énoncé de la mission. */
  prompt: string;
  /** Indice optionnel, révélé après un échec. */
  hint?: string;
  /** Explication affichée une fois la mission réussie. */
  explain: string;
  check: TerminalCheck;
}
export type FormationStep =
  | { type: 'say'; text: string; mood?: string }
  | { type: 'code'; title?: string; lang?: string; sql: string; note?: string }
  | { type: 'choice'; q: string; options: string[]; answer: number; explain: string }
  | { type: 'prereq'; formation: string; moduleId?: string; why?: string }
  | { type: 'exercise'; q: string; table?: string; placeholder?: string; caseSensitive?: boolean; hints: string[]; accept: string[]; solution: string; explain: string }
  | { type: 'terminal'; intro?: string; missions: TerminalMission[] };
/** Renvoi vers une autre formation (par défaut du même module). */
export interface FormationRef {
  formation: string;
  moduleId?: string;
  /** Pourquoi elle est utile (une phrase) */
  why?: string;
}
export interface FormationLesson {
  id: string;
  title: string;
  emoji: string;
  minutes: number;
  steps: FormationStep[];
}
export interface Formation {
  id: string;
  /** Renseigné au chargement */
  moduleId: string;
  order?: number;
  title: string;
  tagline: string;
  emoji: string;
  color: string;
  level: string;
  minutes: number;
  /** Dialogue d'accueil (le nuage explique la formation) */
  pitch: string[];
  benefits: string[];
  /** Formations conseillées avant celle-ci */
  prerequisites?: FormationRef[];
  lessons: FormationLesson[];
}

// ---------- Progression de l'utilisateur ----------
export type AttemptKind = 'qcm' | 'blitz' | 'review' | 'exam' | 'cards';

export interface Attempt {
  id: string;
  at: string; // ISO
  moduleId: string;
  kind: AttemptKind;
  label: string;
  score: number;
  max: number;
  xp: number;
}
export interface ReviewItem {
  box: number; // 1..5 (Leitner)
  due: string; // YYYY-MM-DD
  seen: number;
  /** Intervalle actuel en jours (absent sur les anciens éléments : déduit de `box`). */
  ivl?: number;
  /** Facilité propre à l'élément (1.3 = difficile … 3 = facile). */
  ease?: number;
  /** Nombre d'oublis (réponses ratées après un rappel). */
  lapses?: number;
}
export type FiliereId = 'ARI' | 'AIP';
/** Année d'études : 1, 2 ou 3. Les comptes et modules sans année sont en 3ᵉ année. */
export type AnneeId = 1 | 2 | 3;
export type ThemeId = 'ciel' | 'violet' | 'corail' | 'cyan' | 'emeraude' | 'ambre' | 'rose' | 'ardoise' | 'bordeaux';
export type BackendThemeId = ThemeId;

export interface UserState {
  v: 1;
  filiere: FiliereId | null;
  theme: BackendThemeId;
  xp: number;
  streak: number;
  bestStreak: number;
  lastActive: string | null;
  daily: { date: string; xp: number };
  dailyGoal: number;
  chaptersRead: Record<string, string[]>;
  /** Leçons de formation terminées, clé « moduleId:formationId » */
  formations: Record<string, string[]>;
  attempts: Attempt[];
  badges: Record<string, string>;
  review: Record<string, ReviewItem>;
  chapterStats: Record<string, { answered: number; correct: number }>;
  examBest: Record<string, { score: number; max: number }>;
  counters: {
    quizzes: number;
    perfectQuizzes: number;
    blitzBest: number;
    maxCombo: number;
    cardsKnown: number;
    exams: number;
    formations: number;
  };
}

export interface XpLine {
  label: string;
  xp: number;
}
export interface Summary {
  xp: number;
  lines: XpLine[];
  levelUp: boolean;
  prevLevel: number;
  newLevel: number;
  newBadges: string[];
  score: number;
  max: number;
}
