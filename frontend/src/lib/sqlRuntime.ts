/** Chargement paresseux de sql.js (WebAssembly) : n'est téléchargé qu'à l'ouverture d'une mission. */
import initSqlJs from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import type { SqlJsStatic } from 'sql.js';
import { OracleSession } from './oracleSession';

let sqlPromise: Promise<SqlJsStatic> | null = null;

export function loadSql(): Promise<SqlJsStatic> {
  sqlPromise ??= initSqlJs({ locateFile: () => wasmUrl });
  return sqlPromise;
}

export async function newSession(): Promise<OracleSession> {
  return new OracleSession(await loadSql());
}
