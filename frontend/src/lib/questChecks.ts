/**
 * Validation des étapes d'une quête.
 * - étape SQL : critères évalués sur l'état de la base et sur ce qui a été exécuté pendant l'étape ;
 * - étape PL/SQL : revue de code (le simulateur n'exécute pas PL/SQL), chaque critère est un motif cherché dans le source.
 */
import type { QuestCell, QuestCheck, QuestPlsqlStep, QuestSqlStep } from './types';
import type { OracleSession, StmtResult } from './oracleSession';

export interface CheckItem {
  ok: boolean;
  label: string;
}
export interface StepVerdict {
  pass: boolean;
  items: CheckItem[];
}

/** Ce qui s'est passé depuis le début de l'étape. */
export interface StepContext {
  results: StmtResult[];
}

const norm = (v: QuestCell): QuestCell => (typeof v === 'number' ? Math.round(v * 100) / 100 : typeof v === 'string' ? v.trim() : v);
const key = (row: QuestCell[]) => JSON.stringify(row.map(norm));

/** Compare deux jeux de lignes, dans l'ordre si `ordered`, sinon comme des ensembles de lignes. */
export function sameRows(actual: QuestCell[][], expected: QuestCell[][], ordered = false): boolean {
  if (actual.length !== expected.length) return false;
  const a = actual.map(key);
  const e = expected.map(key);
  if (ordered) return a.every((x, i) => x === e[i]);
  return [...a].sort().every((x, i) => x === [...e].sort()[i]);
}

function evalCheck(session: OracleSession, c: QuestCheck, ctx: StepContext): boolean {
  try {
    switch (c.t) {
      case 'table': {
        const info = session.tableInfo(c.name);
        if (!info.exists) return false;
        for (const col of c.columns ?? []) {
          const found = info.columns.find((x) => x.name === col.name.toLowerCase());
          if (!found) return false;
          if (col.type && !found.type.toLowerCase().startsWith(col.type.toLowerCase())) return false;
          if (col.notNull && !(found.notNull || found.pk)) return false;
        }
        if (c.pk && JSON.stringify(info.pk) !== JSON.stringify(c.pk.map((x) => x.toLowerCase()))) return false;
        for (const fk of c.fks ?? []) {
          const hit = info.fks.find((x) => x.ref === fk.ref.toLowerCase() && fk.cols.every((col) => x.cols.includes(col.toLowerCase())));
          if (!hit) return false;
        }
        for (const u of c.unique ?? []) {
          if (!info.unique.some((x) => u.length === x.length && u.every((col) => x.includes(col.toLowerCase())))) return false;
        }
        if (c.checks !== undefined && info.checks < c.checks) return false;
        return true;
      }
      case 'query': {
        if (c.committed && session.pendingChanges > 0) return false;
        const { rows } = session.query(c.sql);
        if (c.rows) return sameRows(rows, c.rows, c.ordered);
        return rows.length > 0 && norm(rows[0][0]) === norm(c.scalar ?? null);
      }
      case 'result': {
        const last = [...ctx.results].reverse().find((r) => r.kind === 'select' && r.ok);
        return !!last?.rows && sameRows(last.rows, c.rows, c.ordered);
      }
      case 'error':
        return ctx.results.some((r) => !r.ok && r.code === c.code);
      case 'ran': {
        const re = new RegExp(c.pattern, 'i');
        return ctx.results.some((r) => r.ok && re.test(r.sql.replace(/\s+/g, ' ')));
      }
      case 'committed':
        return session.pendingChanges === 0 && ctx.results.some((r) => r.ok && r.kind !== 'select');
    }
  } catch {
    return false;
  }
}

export function checkSqlStep(session: OracleSession, step: QuestSqlStep, ctx: StepContext): StepVerdict {
  const items = step.checks.map((c) => ({ ok: evalCheck(session, c, ctx), label: c.label }));
  return { pass: items.every((i) => i.ok), items };
}

/** Source PL/SQL normalisé : sans commentaires, minuscules (hors littéraux), espaces réduits. */
export function normalizePlsql(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/--.*$/gm, ' ')
    .split(/('(?:[^']|'')*')/g)
    .map((part, i) => (i % 2 ? part : part.toLowerCase()))
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
}

export function checkPlsqlStep(step: QuestPlsqlStep, source: string): StepVerdict {
  const code = normalizePlsql(source);
  const items = step.review.map((r) => ({ ok: new RegExp(r.pattern, 'i').test(code), label: r.label }));
  return { pass: code.length > 0 && items.every((i) => i.ok), items };
}
