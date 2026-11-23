import type { ModuleMeta, UserState } from './types';
import { todayKey } from './utils';
import { dueCardIds, dueQuestionIds } from './progress';

/**
 * Maîtrise d'un chapitre (0..1), estimée à partir des réponses de l'étudiant.
 * Lissage de Laplace : avec peu de réponses on reste proche de 50 %, on ne conclut pas sur 1 seule question.
 */
export function chapterMastery(s: UserState, moduleId: string, chapterId: string) {
  const st = s.chapterStats[`${moduleId}:${chapterId}`];
  const answered = st?.answered ?? 0;
  const correct = st?.correct ?? 0;
  return { answered, mastery: (correct + 1) / (answered + 2) };
}

export interface WeakChapter {
  moduleId: string;
  moduleTitle: string;
  chapterId: string;
  chapterTitle: string;
  mastery: number;
  answered: number;
}

/** Chapitres où l'étudiant a au moins `minAnswers` réponses et une maîtrise sous `threshold`, du plus faible au moins faible. */
export function weakChapters(s: UserState, modules: ModuleMeta[], limit = 3, minAnswers = 3, threshold = 0.7): WeakChapter[] {
  const out: WeakChapter[] = [];
  for (const m of modules) {
    for (const c of m.chapters) {
      const { answered, mastery } = chapterMastery(s, m.id, c.id);
      if (answered >= minAnswers && mastery < threshold) {
        out.push({ moduleId: m.id, moduleTitle: m.title, chapterId: c.id, chapterTitle: c.title, mastery, answered });
      }
    }
  }
  return out.sort((a, b) => a.mastery - b.mastery || b.answered - a.answered).slice(0, limit);
}

export interface DueModule {
  moduleId: string;
  title: string;
  questions: number;
  cards: number;
}

/** Éléments à réviser aujourd'hui, regroupés par module (du plus chargé au moins chargé). */
export function dueByModule(s: UserState, modules: ModuleMeta[]): DueModule[] {
  return modules
    .map((m) => ({ moduleId: m.id, title: m.title, questions: dueQuestionIds(s, m.id).length, cards: dueCardIds(s, m.id).length }))
    .filter((d) => d.questions + d.cards > 0)
    .sort((a, b) => b.questions + b.cards - (a.questions + a.cards));
}

/** Nombre d'éléments en retard de plus de 3 jours (pour doser le ton du message). */
export function overdueCount(s: UserState): number {
  const today = todayKey();
  const limit = new Date(today).getTime() - 3 * 86400000;
  return Object.values(s.review).filter((r) => new Date(r.due).getTime() <= limit).length;
}
