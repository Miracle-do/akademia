/**
 * Session SQL « façon Oracle » pour les quêtes.
 *
 * Le moteur d'exécution est SQLite (sql.js, dans le navigateur) ; cette couche reproduit ce qui compte pour un
 * administrateur : transactions implicites (COMMIT / ROLLBACK, validation automatique après un DDL), séquences,
 * messages de SQL*Plus en français et codes d'erreur ORA-xxxxx pour les violations de contraintes.
 * Les blocs PL/SQL ne sont pas exécutés ici : ils sont relus par la quête (voir questChecks.ts).
 */
import type { Database, SqlJsStatic } from 'sql.js';

export type Cell = string | number | null;
export type StmtKind = 'select' | 'dml' | 'ddl' | 'tcl' | 'desc' | 'info' | 'error';

export interface StmtResult {
  sql: string;
  kind: StmtKind;
  ok: boolean;
  /** Message affiché sous la commande (confirmation SQL*Plus ou erreur ORA-xxxxx). */
  text: string;
  /** Code d'erreur Oracle, ex. « ORA-02292 ». */
  code?: string;
  columns?: string[];
  rows?: Cell[][];
}

interface ConstraintRec {
  table: string;
  name: string;
  type: 'P' | 'U' | 'R' | 'C';
  cols: string[];
  refTable?: string;
}

export interface TableInfo {
  exists: boolean;
  columns: { name: string; type: string; notNull: boolean; pk: boolean }[];
  pk: string[];
  unique: string[][];
  fks: { cols: string[]; ref: string; refCols: string[] }[];
  checks: number;
}

class OraError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

const SCHEMA = 'APP';
const up = (s: string) => s.toUpperCase();
const plural = (n: number, one: string, many: string) => (n > 1 ? many : one);

/** Applique `fn` aux seules parties hors littéraux 'texte'. */
function outsideStrings(sql: string, fn: (code: string) => string): string {
  return sql
    .split(/('(?:[^']|'')*')/g)
    .map((part, i) => (i % 2 ? part : fn(part)))
    .join('');
}

/** Retire commentaires et blocs vides, puis découpe sur « ; » hors littéraux. */
export function splitStatements(script: string): string[] {
  const out: string[] = [];
  let cur = '';
  let i = 0;
  while (i < script.length) {
    const c = script[i];
    const two = script.slice(i, i + 2);
    if (c === "'") {
      let j = i + 1;
      while (j < script.length && !(script[j] === "'" && script[j + 1] !== "'")) j += script[j] === "'" ? 2 : 1;
      cur += script.slice(i, j + 1);
      i = j + 1;
    } else if (two === '--') {
      while (i < script.length && script[i] !== '\n') i++;
    } else if (two === '/*') {
      const end = script.indexOf('*/', i + 2);
      i = end < 0 ? script.length : end + 2;
    } else if (c === ';') {
      if (cur.trim()) out.push(cur.trim());
      cur = '';
      i++;
    } else {
      cur += c;
      i++;
    }
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

/** Découpe aux virgules de premier niveau (hors parenthèses et littéraux). */
function splitTop(body: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let cur = '';
  let inStr = false;
  for (const ch of body) {
    if (ch === "'") inStr = !inStr;
    if (!inStr) {
      if (ch === '(') depth++;
      if (ch === ')') depth--;
      if (ch === ',' && depth === 0) {
        parts.push(cur.trim());
        cur = '';
        continue;
      }
    }
    cur += ch;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

const colList = (s: string) => s.split(',').map((x) => x.trim().toLowerCase()).filter(Boolean);
const firstParen = (s: string) => s.match(/\(([^()]*)\)/)?.[1] ?? '';

const pad = (n: number, w = 2) => String(n).padStart(w, '0');
const isoDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseIso = (s: unknown): Date | null => {
  const m = String(s ?? '').match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}):(\d{2}))?/);
  return m ? new Date(+m[1], +m[2] - 1, +m[3], +(m[4] ?? 0), +(m[5] ?? 0), +(m[6] ?? 0)) : null;
};

/** TO_DATE : convertit '15/03/2026' + 'DD/MM/YYYY' vers le format interne ISO. */
function toDate(s: unknown, fmt: unknown): string | null {
  if (s === null || s === undefined) return null;
  const f = String(fmt ?? 'DD/MM/YYYY').toUpperCase();
  const tokens = [...f.matchAll(/YYYY|YY|MM|DD|HH24|MI|SS/g)];
  const str = String(s);
  let pattern = f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  for (const t of tokens) pattern = pattern.replace(t[0], `(\\d{${t[0] === 'YYYY' ? 4 : 2}})`);
  const m = str.match(new RegExp(`^${pattern}$`));
  if (!m) throw new Error('ORA-01861');
  const v: Record<string, number> = { YYYY: 1970, MM: 1, DD: 1, HH24: 0, MI: 0, SS: 0 };
  tokens.forEach((t, i) => { v[t[0] === 'YY' ? 'YYYY' : t[0]] = t[0] === 'YY' ? 2000 + +m[i + 1] : +m[i + 1]; });
  const date = `${v.YYYY}-${pad(v.MM)}-${pad(v.DD)}`;
  return f.includes('HH24') ? `${date} ${pad(v.HH24)}:${pad(v.MI)}:${pad(v.SS)}` : date;
}

function toChar(x: unknown, fmt: unknown): string | null {
  if (x === null || x === undefined) return null;
  const d = typeof x === 'string' ? parseIso(x) : null;
  if (!d || fmt === null || fmt === undefined) return String(x);
  const months = ['JANVIER', 'FÉVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN', 'JUILLET', 'AOÛT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DÉCEMBRE'];
  return String(fmt).toUpperCase().replace(/YYYY|YY|MONTH|MM|DD|HH24|MI|SS/g, (t) => {
    switch (t) {
      case 'YYYY': return String(d.getFullYear());
      case 'YY': return pad(d.getFullYear() % 100);
      case 'MONTH': return months[d.getMonth()];
      case 'MM': return pad(d.getMonth() + 1);
      case 'DD': return pad(d.getDate());
      case 'HH24': return pad(d.getHours());
      case 'MI': return pad(d.getMinutes());
      default: return pad(d.getSeconds());
    }
  });
}

function registerFunctions(db: Database) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const f = (name: string, fn: (...a: any[]) => unknown) => db.create_function(name, fn);
  f('NVL', (a: unknown, b: unknown) => (a === null || a === undefined ? b : a));
  f('TO_DATE', (s: unknown, fmt: unknown) => toDate(s, fmt));
  f('TO_CHAR', (x: unknown, fmt: unknown) => toChar(x, fmt));
  f('MOD', (a: number, b: number) => (b === 0 ? a : a % b));
  f('TRUNC', (x: unknown) => {
    const d = typeof x === 'string' ? parseIso(x) : null;
    return d ? isoDate(d) : Math.trunc(Number(x));
  });
  f('INITCAP', (s: unknown) =>
    s === null ? null : String(s).toLowerCase().replace(/(^|[^\p{L}\d])(\p{L})/gu, (_, a: string, b: string) => a + b.toUpperCase()),
  );
  f('ADD_MONTHS', (s: unknown, n: number) => {
    const d = parseIso(s);
    if (!d) return null;
    d.setMonth(d.getMonth() + Number(n));
    return isoDate(d);
  });
  f('MONTHS_BETWEEN', (a: unknown, b: unknown) => {
    const x = parseIso(a);
    const y = parseIso(b);
    if (!x || !y) return null;
    return (x.getFullYear() - y.getFullYear()) * 12 + (x.getMonth() - y.getMonth()) + (x.getDate() - y.getDate()) / 31;
  });
}

export class OracleSession {
  private db!: Database;
  private inTx = false;
  private changes = 0;
  private constraints: ConstraintRec[] = [];
  private sequences = new Map<string, { next: number; inc: number; cur: number | null }>();
  private sysC = 0;
  /** Commandes exécutées avec succès, pour pouvoir rejouer la session. */
  readonly history: string[] = [];

  constructor(private SQL: SqlJsStatic) {
    this.reset();
  }

  reset() {
    this.db?.close();
    this.db = new this.SQL.Database();
    this.db.run('PRAGMA foreign_keys = ON; PRAGMA case_sensitive_like = ON;');
    this.db.run("CREATE TABLE dual (dummy TEXT); INSERT INTO dual VALUES ('X');");
    registerFunctions(this.db);
    this.inTx = false;
    this.changes = 0;
    this.constraints = [];
    this.sequences.clear();
    this.sysC = 0;
    this.history.length = 0;
  }

  /** Libère la base en mémoire. */
  close() {
    this.db?.close();
  }

  /** Modifications non validées (la transaction est en cours). */
  get pendingChanges(): number {
    return this.inTx ? this.changes : 0;
  }

  // ---------- Exécution ----------

  run(script: string): StmtResult[] {
    const plsql = /^\s*(declare|begin|create\s+(or\s+replace\s+)?(procedure|function|trigger|package))\b/i.test(script);
    if (plsql) {
      return [{
        sql: script.trim(),
        kind: 'info',
        ok: false,
        text: 'Cette console exécute des ordres SQL. Les blocs PL/SQL (DECLARE, BEGIN, procédures, fonctions, triggers) se soumettent depuis l’éditeur de l’étape PL/SQL.',
      }];
    }
    return splitStatements(script).map((s) => this.runOne(s));
  }

  private runOne(stmt: string): StmtResult {
    const first = (stmt.match(/^\w+/)?.[0] ?? '').toLowerCase();
    try {
      let r: StmtResult;
      if (first === 'select' || first === 'with') r = this.select(stmt);
      else if (first === 'insert' || first === 'update' || first === 'delete') r = this.dml(stmt, first);
      else if (['create', 'alter', 'drop', 'truncate', 'rename'].includes(first)) r = this.ddl(stmt, first);
      else if (['commit', 'rollback', 'savepoint'].includes(first)) r = this.tcl(stmt, first);
      else if (first === 'desc' || first === 'describe') r = this.describe(stmt);
      else if (first === 'set') r = { sql: stmt, kind: 'info', ok: true, text: '' };
      else throw new OraError('ORA-00900', 'instruction SQL non valide');
      if (r.ok) this.history.push(stmt);
      return r;
    } catch (e) {
      const err = e instanceof OraError ? e : this.mapError(e as Error, stmt, first);
      return { sql: stmt, kind: 'error', ok: false, code: err.code, text: `ERREUR :\n${err.code}: ${err.message}` };
    }
  }

  /** Requête interne (vérifications des quêtes) : n'écrit rien dans l'historique. */
  query(sql: string): { columns: string[]; rows: Cell[][] } {
    const st = this.db.prepare(this.translate(this.useSequences(sql)));
    const columns = st.getColumnNames();
    const rows: Cell[][] = [];
    while (st.step()) rows.push(st.get() as Cell[]);
    st.free();
    return { columns, rows };
  }

  private select(stmt: string): StmtResult {
    const { columns, rows } = this.query(stmt);
    const n = rows.length;
    const text = n === 0 ? 'aucune ligne sélectionnée' : `${n} ${plural(n, 'ligne sélectionnée', 'lignes sélectionnées')}.`;
    return { sql: stmt, kind: 'select', ok: true, text, columns: columns.map(up), rows: rows.map((r) => r.map(cleanCell)) };
  }

  private dml(stmt: string, verb: string): StmtResult {
    this.begin();
    this.db.run(this.translate(this.useSequences(stmt)));
    const n = this.db.getRowsModified();
    this.changes += n;
    const text =
      verb === 'insert'
        ? `${n} ${plural(n, 'ligne créée', 'lignes créées')}.`
        : verb === 'update'
          ? `${n} ${plural(n, 'ligne mise à jour', 'lignes mises à jour')}.`
          : `${n} ${plural(n, 'ligne supprimée', 'lignes supprimées')}.`;
    return { sql: stmt, kind: 'dml', ok: true, text };
  }

  private begin() {
    if (!this.inTx) {
      this.db.run('BEGIN');
      this.inTx = true;
      this.changes = 0;
    }
  }

  private endTx(commit: boolean) {
    if (this.inTx) this.db.run(commit ? 'COMMIT' : 'ROLLBACK');
    this.inTx = false;
    this.changes = 0;
  }

  private tcl(stmt: string, verb: string): StmtResult {
    if (verb === 'commit') {
      this.endTx(true);
      return { sql: stmt, kind: 'tcl', ok: true, text: 'Validation effectuée.' };
    }
    if (verb === 'savepoint') {
      const name = stmt.match(/^savepoint\s+(\w+)/i)?.[1];
      if (!name) throw new OraError('ORA-00900', 'instruction SQL non valide');
      this.begin();
      this.db.run(`SAVEPOINT ${name}`);
      return { sql: stmt, kind: 'tcl', ok: true, text: 'Point de sauvegarde créé.' };
    }
    const to = stmt.match(/^rollback\s+(?:work\s+)?to\s+(?:savepoint\s+)?(\w+)/i)?.[1];
    if (to) {
      try {
        this.db.run(`ROLLBACK TO ${to}`);
      } catch {
        throw new OraError('ORA-01086', `le point de sauvegarde '${up(to)}' n'a jamais été établi dans cette session ou n'est plus valide`);
      }
      return { sql: stmt, kind: 'tcl', ok: true, text: 'Annulation (rollback) effectuée.' };
    }
    this.endTx(false);
    return { sql: stmt, kind: 'tcl', ok: true, text: 'Annulation (rollback) effectuée.' };
  }

  private ddl(stmt: string, verb: string): StmtResult {
    const done = (text: string): StmtResult => ({ sql: stmt, kind: 'ddl', ok: true, text });
    // Oracle valide la transaction en cours avant et après tout ordre DDL.
    this.endTx(true);
    const m = stmt.match(/^(create|alter|drop|truncate|rename)\s+(?:or\s+replace\s+)?(?:unique\s+)?(table|sequence|view|index)?\s*(\w+)?/i);
    const object = (m?.[2] ?? '').toLowerCase();
    const name = (m?.[3] ?? '').toLowerCase();

    if (verb === 'create' && object === 'sequence') {
      this.createSequence(stmt, name);
      return done('Séquence créée.');
    }
    if (verb === 'drop' && object === 'sequence') {
      if (!this.sequences.delete(name)) throw new OraError('ORA-02289', "la séquence n'existe pas");
      return done('Séquence supprimée.');
    }
    if (verb === 'truncate') {
      const t = (stmt.match(/^truncate\s+table\s+(\w+)/i)?.[1] ?? '').toLowerCase();
      if (!this.tableExists(t)) throw new OraError('ORA-00942', 'Table ou vue inexistante');
      const parent = this.constraints.find((c) => c.type === 'R' && c.refTable === t && c.table !== t);
      if (parent) throw new OraError('ORA-02266', 'des clés primaires/uniques de la table sont référencées par des clés étrangères actives');
      this.db.run(`DELETE FROM ${t}`);
      return done('Table tronquée.');
    }
    if (verb === 'create' && object === 'table') this.registerTable(stmt, name);
    if (verb === 'drop' && object === 'table') {
      const referenced = this.constraints.find((c) => c.type === 'R' && c.refTable === name && c.table !== name);
      if (referenced && !/cascade\s+constraints/i.test(stmt))
        throw new OraError('ORA-02449', 'des clés uniques/primaires de la table sont référencées par des clés étrangères');
    }
    if (verb === 'create' && /^create\s+or\s+replace\s+view/i.test(stmt)) this.db.run(`DROP VIEW IF EXISTS ${name}`);

    for (const sql of this.translateDdl(stmt)) this.db.run(sql);

    if (verb === 'drop' && object === 'table') {
      this.constraints = this.constraints.filter((c) => c.table !== name && c.refTable !== name);
      return done('Table supprimée.');
    }
    if (verb === 'drop' && object === 'view') return done('Vue supprimée.');
    if (verb === 'drop' && object === 'index') return done('Index supprimé.');
    if (verb === 'create' && object === 'table') return done('Table créée.');
    if (verb === 'create' && object === 'view') return done('Vue créée.');
    if (verb === 'create' && object === 'index') return done('Index créé.');
    if (verb === 'rename') return done('Table renommée.');
    return done('Table modifiée.');
  }

  private describe(stmt: string): StmtResult {
    const name = (stmt.match(/^desc(?:ribe)?\s+(\w+)/i)?.[1] ?? '').toLowerCase();
    const info = this.tableInfo(name);
    if (!info.exists) throw new OraError('ORA-04043', `l'objet ${up(name)} n'existe pas`);
    const w = Math.max(4, ...info.columns.map((c) => c.name.length));
    const lines = [` ${'Nom'.padEnd(w)}  ${'NULL ?'.padEnd(8)}  Type`, ` ${'-'.repeat(w)}  ${'-'.repeat(8)}  ${'-'.repeat(16)}`];
    for (const c of info.columns) lines.push(` ${up(c.name).padEnd(w)}  ${(c.notNull || c.pk ? 'NOT NULL' : '').padEnd(8)}  ${up(c.type || 'VARCHAR2')}`);
    return { sql: stmt, kind: 'desc', ok: true, text: lines.join('\n') };
  }

  // ---------- Séquences ----------

  private createSequence(stmt: string, name: string) {
    if (this.sequences.has(name)) throw new OraError('ORA-00955', 'Ce nom est déjà utilisé par un objet existant');
    const start = +(stmt.match(/start\s+with\s+(-?\d+)/i)?.[1] ?? 1);
    const inc = +(stmt.match(/increment\s+by\s+(-?\d+)/i)?.[1] ?? 1);
    this.sequences.set(name, { next: start, inc, cur: null });
  }

  /** Remplace seq.NEXTVAL / seq.CURRVAL par leur valeur (la séquence avance même si la transaction est annulée). */
  private useSequences(sql: string): string {
    return outsideStrings(sql, (code) =>
      code.replace(/\b(\w+)\.(nextval|currval)\b/gi, (_, n: string, which: string) => {
        const seq = this.sequences.get(n.toLowerCase());
        if (!seq) throw new OraError('ORA-02289', "la séquence n'existe pas");
        if (which.toLowerCase() === 'currval') {
          if (seq.cur === null) throw new OraError('ORA-08002', `la séquence ${up(n)}.CURRVAL n'est pas encore définie dans cette session`);
          return String(seq.cur);
        }
        seq.cur = seq.next;
        seq.next += seq.inc;
        return String(seq.cur);
      }),
    );
  }

  // ---------- Traduction Oracle -> SQLite ----------

  private translate(sql: string): string {
    return outsideStrings(sql.replace(/;\s*$/, ''), (code) =>
      code
        .replace(/\bFETCH\s+FIRST\s+(\d+)\s+ROWS?\s+ONLY\b/gi, 'LIMIT $1')
        .replace(/\bMINUS\b/gi, 'EXCEPT')
        .replace(/\bSYSDATE\s*([-+])\s*(\d+)/gi, (_, op: string, n: string) => `strftime('%Y-%m-%d %H:%M:%S','now','${op}${n} days')`)
        .replace(/\bDEFAULT\s+SYSDATE\b/gi, 'DEFAULT CURRENT_TIMESTAMP')
        .replace(/\bSYSDATE\b/gi, 'CURRENT_TIMESTAMP')
        .replace(/\buser_tables\b/gi, "(SELECT upper(name) AS table_name FROM sqlite_master WHERE type='table' AND name<>'dual' AND name NOT LIKE 'sqlite_%')"),
    );
  }

  private translateDdl(stmt: string): string[] {
    if (/^\s*alter\s+table\s+\w+\s+(add\s+constraint|modify)\b/i.test(stmt))
      throw new OraError('ORA-00900', 'cette variante de ALTER TABLE n’est pas prise en charge par le simulateur de quête');
    let s = this.translate(stmt);
    s = s.replace(/\(\s*(\d+)\s+(?:CHAR|BYTE)\s*\)/gi, '($1)');
    s = s.replace(/NUMBER(?:\s*\(\s*\d+\s*(?:,\s*\d+\s*)?\))?\s+GENERATED\s+(?:ALWAYS|BY\s+DEFAULT)\s+AS\s+IDENTITY\s+PRIMARY\s+KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT');
    s = s.replace(/\bpurge\b/gi, '').replace(/\bcascade\s+constraints\b/gi, '').replace(/\bwith\s+read\s+only\b/gi, '');
    s = s.replace(/^(\s*create\s+)or\s+replace\s+(view\b)/i, '$1$2');
    const add = s.match(/^\s*(alter\s+table\s+\w+)\s+add\s*\(([\s\S]+)\)\s*$/i);
    if (add) return splitTop(add[2]).map((col) => `${add[1]} ADD COLUMN ${col}`);
    return [s.replace(/^(\s*alter\s+table\s+\w+\s+add)\s+(?!column|constraint)/i, '$1 COLUMN ')];
  }

  // ---------- Contraintes (noms et introspection) ----------

  private tableExists(name: string): boolean {
    return this.query(`SELECT 1 FROM sqlite_master WHERE type='table' AND name='${name.replace(/'/g, '')}' AND name<>'dual'`).rows.length > 0;
  }

  private registerTable(stmt: string, table: string) {
    if (this.tableExists(table)) throw new OraError('ORA-00955', 'Ce nom est déjà utilisé par un objet existant');
    const open = stmt.indexOf('(');
    const close = stmt.lastIndexOf(')');
    if (open < 0 || close < open) return;
    const recs: ConstraintRec[] = [];
    const auto = () => `SYS_C00${12000 + this.sysC++}`;
    for (const part of splitTop(stmt.slice(open + 1, close))) {
      const named = part.match(/^constraint\s+(\w+)\s+([\s\S]*)$/i);
      const body = named ? named[2] : part;
      const t = body.match(/^(primary\s+key|unique|foreign\s+key|check)\s*\(/i);
      if (t) {
        const kind = t[1].toLowerCase().replace(/\s+/g, ' ');
        const type = kind === 'primary key' ? 'P' : kind === 'unique' ? 'U' : kind === 'foreign key' ? 'R' : 'C';
        const ref = type === 'R' ? body.match(/references\s+(\w+)/i)?.[1]?.toLowerCase() : undefined;
        recs.push({ table, name: up(named?.[1] ?? auto()), type, cols: type === 'C' ? [] : colList(firstParen(body)), refTable: ref });
        continue;
      }
      const col = part.match(/^(\w+)\s/)?.[1]?.toLowerCase();
      if (!col) continue;
      const re = /(?:constraint\s+(\w+)\s+)?(primary\s+key|unique|references\s+(\w+)|check\s*\()/gi;
      for (const m of part.matchAll(re)) {
        const k = m[2].toLowerCase();
        const type = k.startsWith('primary') ? 'P' : k.startsWith('unique') ? 'U' : k.startsWith('ref') ? 'R' : 'C';
        recs.push({ table, name: up(m[1] ?? auto()), type, cols: type === 'C' ? [] : [col], refTable: m[3]?.toLowerCase() });
      }
    }
    for (const r of recs) {
      if (r.type === 'R' && r.refTable && r.refTable !== table && !this.tableExists(r.refTable))
        throw new OraError('ORA-00942', 'Table ou vue inexistante');
    }
    this.constraints.push(...recs);
  }

  tableInfo(name: string): TableInfo {
    const t = name.toLowerCase().replace(/[^\w]/g, '');
    if (!this.tableExists(t)) return { exists: false, columns: [], pk: [], unique: [], fks: [], checks: 0 };
    const cols = this.query(`PRAGMA table_info(${t})`).rows;
    const columns = cols.map((r) => ({ name: String(r[1]).toLowerCase(), type: String(r[2]), notNull: r[3] === 1, pk: Number(r[5]) > 0 }));
    const pk = cols.filter((r) => Number(r[5]) > 0).sort((a, b) => Number(a[5]) - Number(b[5])).map((r) => String(r[1]).toLowerCase());
    const unique: string[][] = [];
    for (const ix of this.query(`PRAGMA index_list(${t})`).rows) {
      if (ix[2] === 1 && ix[3] !== 'pk') unique.push(this.query(`PRAGMA index_info(${String(ix[1])})`).rows.map((r) => String(r[2]).toLowerCase()));
    }
    const groups = new Map<number, { ref: string; cols: string[]; refCols: string[] }>();
    for (const r of this.query(`PRAGMA foreign_key_list(${t})`).rows) {
      const g = groups.get(Number(r[0])) ?? { ref: String(r[2]).toLowerCase(), cols: [], refCols: [] };
      g.cols.push(String(r[3]).toLowerCase());
      if (r[4] !== null) g.refCols.push(String(r[4]).toLowerCase());
      groups.set(Number(r[0]), g);
    }
    const sql = String(this.query(`SELECT sql FROM sqlite_master WHERE name='${t}'`).rows[0]?.[0] ?? '');
    return { exists: true, columns, pk, unique, fks: [...groups.values()], checks: (sql.match(/\bcheck\s*\(/gi) ?? []).length };
  }

  // ---------- Erreurs ----------

  private constraintName(table: string, type: ConstraintRec['type'], cols?: string[]): string {
    const list = this.constraints.filter((c) => c.table === table && c.type === type);
    const hit = cols ? list.find((c) => c.cols.length === cols.length && c.cols.every((x) => cols.includes(x))) : list[0];
    return `${SCHEMA}.${(hit ?? list[0])?.name ?? `SYS_C00${12000 + this.sysC}`}`;
  }

  private mapError(e: Error, stmt: string, verb: string): OraError {
    const m = e.message;
    let g: RegExpMatchArray | null;
    if ((g = m.match(/UNIQUE constraint failed: (.+)/))) {
      const parts = g[1].split(',').map((x) => x.trim().split('.'));
      const table = parts[0][0].toLowerCase();
      const cols = parts.map((p) => p[1].toLowerCase());
      const pk = this.constraints.find((c) => c.table === table && c.type === 'P' && c.cols.length === cols.length && c.cols.every((x) => cols.includes(x)));
      const name = pk ? this.constraintName(table, 'P', cols) : this.constraintName(table, 'U', cols);
      return new OraError('ORA-00001', `violation de contrainte unique (${name})`);
    }
    if ((g = m.match(/NOT NULL constraint failed: (\w+)\.(\w+)/))) return new OraError('ORA-01400', `impossible d'insérer NULL dans ("${SCHEMA}"."${up(g[1])}"."${up(g[2])}")`);
    if ((g = m.match(/CHECK constraint failed: (.*)/))) {
      const table = (stmt.match(/^(?:insert\s+into|update|delete\s+from)\s+(\w+)/i)?.[1] ?? '').toLowerCase();
      const named = this.constraints.find((c) => c.table === table && c.type === 'C' && c.name === up(g![1].trim()));
      return new OraError('ORA-02290', `violation de contraintes (${named ? `${SCHEMA}.${named.name}` : this.constraintName(table, 'C')}) de vérification`);
    }
    if (/FOREIGN KEY constraint failed/.test(m)) return this.foreignKeyError(stmt, verb);
    if ((g = m.match(/no such table: (\S+)/))) return new OraError('ORA-00942', 'Table ou vue inexistante');
    if ((g = m.match(/no such column: (?:\w+\.)?(\S+)/))) return new OraError('ORA-00904', `"${up(g[1])}" : identificateur non valide`);
    if ((g = m.match(/ambiguous column name: (?:\w+\.)?(\S+)/))) return new OraError('ORA-00918', `"${up(g[1])}" : définition de colonne ambiguë`);
    if (/table \S+ already exists|already exists/.test(m)) return new OraError('ORA-00955', 'Ce nom est déjà utilisé par un objet existant');
    if (/Cannot add a NOT NULL column/i.test(m)) return new OraError('ORA-01758', 'la table doit être vide pour ajouter une colonne obligatoire (NOT NULL)');
    if (/no such savepoint/.test(m)) return new OraError('ORA-01086', "le point de sauvegarde n'a jamais été établi");
    if (/ORA-01861/.test(m)) return new OraError('ORA-01861', 'le littéral ne concorde pas avec la chaîne de format');
    if ((g = m.match(/near "([^"]+)": syntax error/))) return new OraError('ORA-00900', `instruction SQL non valide (près de « ${g[1]} »)`);
    if (/incomplete input/.test(m)) return new OraError('ORA-00933', 'la commande SQL ne se termine pas correctement');
    return new OraError('ORA-00900', 'instruction SQL non valide');
  }

  private foreignKeyError(stmt: string, verb: string): OraError {
    const target = (stmt.match(/^(?:insert\s+into|update|delete\s+from)\s+(\w+)/i)?.[1] ?? '').toLowerCase();
    const own = this.constraints.filter((c) => c.type === 'R' && c.table === target);
    const setsFk = verb === 'update' && own.some((c) => c.cols.some((col) => new RegExp(`\\b${col}\\s*=`, 'i').test(stmt.split(/\bwhere\b/i)[0])));
    if (verb === 'insert' || setsFk) {
      let fk = own[0];
      const vals = stmt.match(/^insert\s+into\s+\w+\s*(?:\(([^)]*)\))?\s*values\s*\((.*)\)\s*$/is);
      if (vals && own.length > 1) {
        const cols = vals[1] ? colList(vals[1]) : this.tableInfo(target).columns.map((c) => c.name);
        const values = splitTop(vals[2]);
        fk = own.find((c) => {
          const i = cols.indexOf(c.cols[0]);
          const v = i >= 0 ? values[i]?.trim() : undefined;
          if (!v || /^null$/i.test(v) || !c.refTable) return false;
          const refCol = this.tableInfo(target).fks.find((f) => f.cols[0] === c.cols[0])?.refCols[0] ?? this.tableInfo(c.refTable).pk[0];
          try {
            return this.query(`SELECT 1 FROM ${c.refTable} WHERE ${refCol} = ${v}`).rows.length === 0;
          } catch {
            return false;
          }
        }) ?? own[0];
      }
      return new OraError('ORA-02291', `violation de contrainte (${SCHEMA}.${fk?.name ?? `SYS_C00${12000 + this.sysC}`}) d'intégrité - clé parent introuvable`);
    }
    const children = this.constraints.filter((c) => c.type === 'R' && c.refTable === target);
    const where = stmt.match(/\bwhere\b([\s\S]*)$/i)?.[1] ?? '1=1';
    const blocking = children.find((c) => {
      try {
        const refCol = this.tableInfo(c.table).fks.find((f) => f.cols[0] === c.cols[0])?.refCols[0] ?? this.tableInfo(target).pk[0];
        return Number(this.query(`SELECT COUNT(*) FROM ${c.table} WHERE ${c.cols[0]} IN (SELECT ${refCol} FROM ${target} WHERE ${where})`).rows[0][0]) > 0;
      } catch {
        return false;
      }
    }) ?? children[0];
    return new OraError('ORA-02292', `violation de contrainte (${SCHEMA}.${blocking?.name ?? `SYS_C00${12000 + this.sysC}`}) d'intégrité - enregistrement fils existant`);
  }
}

function cleanCell(v: Cell): Cell {
  return typeof v === 'number' && !Number.isInteger(v) ? Number(v.toFixed(6)) : v;
}
