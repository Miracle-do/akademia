// Filières, années et spécialités de l'ENEAM. Source unique : content/cursus.json (partagée avec le backend).
import raw from '../../content/cursus.json';
import type { AnneeId, FiliereId, ModuleMeta, ThemeId } from './types';

export type ProgrammeId = 'IG' | 'GRH' | 'GBA' | 'GFC' | 'GTL' | 'GC' | 'PLAN' | 'STAT';

export interface Programme {
  id: ProgrammeId;
  short: string;
  name: string;
  emoji: string;
  theme: ThemeId;
  annees: AnneeId[];
  /** Spécialités par année, ex. { '3': ['ARI','AIP'] } pour IG. */
  specialites?: Record<string, FiliereId[]>;
}
export interface Specialite {
  id: FiliereId;
  name: string;
  theme: ThemeId;
  color: string;
}

export const PROGRAMMES = raw.programmes as Programme[];
export const SPECIALITES = raw.specialites as Record<FiliereId, Specialite>;
export const ANNEES: AnneeId[] = [1, 2, 3];
export const DEFAULT_PROGRAMME: ProgrammeId = 'IG';
export const BATTLE_CLASS = 'IG3';

const byId = new Map(PROGRAMMES.map((p) => [p.id, p]));

export function normalizeProgramme(value: unknown): ProgrammeId {
  const id = typeof value === 'string' ? value.trim().toUpperCase() : '';
  return byId.has(id as ProgrammeId) ? (id as ProgrammeId) : DEFAULT_PROGRAMME;
}
export function normalizeAnneeValue(value: unknown): AnneeId {
  const n = Number.parseInt(String(value ?? '').replace(/\D/g, ''), 10);
  return n === 1 || n === 2 ? n : 3;
}
export const programmeMeta = (id: unknown): Programme => byId.get(normalizeProgramme(id))!;

export function specialitesFor(programme: unknown, annee: unknown): FiliereId[] {
  return programmeMeta(programme).specialites?.[String(normalizeAnneeValue(annee))] ?? [];
}
export function normalizeSpecialiteFor(programme: unknown, annee: unknown, value: unknown): FiliereId | null {
  const id = typeof value === 'string' ? (value.trim().toUpperCase() as FiliereId) : null;
  return id && specialitesFor(programme, annee).includes(id) ? id : null;
}

export interface Identity {
  programme: ProgrammeId;
  annee: AnneeId;
  /** Spécialité ARI/AIP : uniquement en IG3, sinon null. */
  filiere: FiliereId | null;
  theme: ThemeId;
}
export function identityOf(v: { programme?: unknown; annee?: unknown; filiere?: unknown } = {}): Identity {
  const programme = normalizeProgramme(v.programme);
  const annee = normalizeAnneeValue(v.annee);
  const filiere = normalizeSpecialiteFor(programme, annee, v.filiere);
  return { programme, annee, filiere, theme: themeFor(programme, annee, filiere) };
}

export function themeFor(programme: unknown, annee: unknown, specialite: unknown): ThemeId {
  const spec = normalizeSpecialiteFor(programme, annee, specialite);
  return spec ? SPECIALITES[spec].theme : programmeMeta(programme).theme;
}

/** « IG3 », « GRH2 »… */
export const classCode = (programme: unknown, annee: unknown): string => `${normalizeProgramme(programme)}${normalizeAnneeValue(annee)}`;
/** « IG3 · ARI » ou « GRH2 ». */
export function classLabel(programme: unknown, annee: unknown, specialite?: unknown): string {
  const spec = normalizeSpecialiteFor(programme, annee, specialite);
  return `${classCode(programme, annee)}${spec ? ` · ${spec}` : ''}`;
}
export const anneeLabel = (annee: unknown): string => {
  const a = normalizeAnneeValue(annee);
  return a === 1 ? '1ʳᵉ année' : `${a}ᵉ année`;
};
export const isBattleClass = (programme: unknown, annee: unknown): boolean => classCode(programme, annee) === BATTLE_CLASS;

export function parseClassCode(code: string | null | undefined): { programme: ProgrammeId; annee: AnneeId } | null {
  const m = /^([A-Za-z]+)([123])$/.exec(String(code ?? '').trim());
  if (!m || !byId.has(m[1].toUpperCase() as ProgrammeId)) return null;
  return { programme: m[1].toUpperCase() as ProgrammeId, annee: Number(m[2]) as AnneeId };
}

// ---------- Contenu : quels modules pour quelle classe ----------
/** Codes d'accès d'un étudiant : sa classe, et classe + spécialité (ex. IG3 et IG3-ARI). */
export function accessCodes(programme: unknown, annee: unknown, specialite?: unknown): string[] {
  const base = classCode(programme, annee);
  const spec = normalizeSpecialiteFor(programme, annee, specialite);
  return spec ? [base, `${base}-${spec}`] : [base];
}
/** Classes visées par un module (`cursus`). Ancien format : `annee: 2` = IG2 ; rien = IG3. */
export function moduleCodes(m: Pick<ModuleMeta, 'cursus' | 'annee'>): string[] {
  if (Array.isArray(m.cursus) && m.cursus.length) return m.cursus.map(String);
  return [`IG${normalizeAnneeValue(m.annee)}`];
}
export function moduleVisibleFor(m: Pick<ModuleMeta, 'cursus' | 'annee'>, programme: unknown, annee: unknown, specialite?: unknown): boolean {
  const mine = accessCodes(programme, annee, specialite);
  return moduleCodes(m).some((c) => mine.includes(c));
}

/**
 * Les modules d'une autre classe sont-ils ouverts à la lecture ? Non pour l'instant : on peut les parcourir
 * (aperçu : description et plan des chapitres) mais pas les ouvrir ; l'accès complet est prévu en option.
 * Passer à `true` pour tout ouvrir (la limite est côté interface : voir ModuleGate).
 */
export const OPEN_OTHER_CLASSES = false;
