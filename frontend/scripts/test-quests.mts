/**
 * Vérifie que chaque quête est réalisable : on rejoue la solution de chaque étape dans une session neuve et on contrôle
 * que (1) les critères échouent avant d'agir, (2) ils réussissent avec la solution.
 * Usage : npm run test:quests -w frontend
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import initSqlJs from 'sql.js';
import { OracleSession } from '../src/lib/oracleSession.ts';
import type { StmtResult } from '../src/lib/oracleSession.ts';
import { checkPlsqlStep, checkShellStep, checkSqlStep } from '../src/lib/questChecks.ts';
import type { Quest } from '../src/lib/types.ts';
import { initialState, runLine } from '../src/lib/vshell.ts';
import type { ShellState } from '../src/lib/vshell.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../content/modules');
const SQL = await initSqlJs();
let failures = 0;
const fail = (m: string) => { failures++; console.error(`  ERREUR ${m}`); };

for (const mod of fs.readdirSync(root)) {
  const dir = path.join(root, mod, 'quests');
  if (!fs.existsSync(dir)) continue;
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
    const q = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')) as Quest;
    console.log(`${mod}/${q.id}`);
    if (q.id !== file.replace(/\.json$/, '')) fail(`id « ${q.id} » ≠ nom du fichier`);
    const s = new OracleSession(SQL);
    for (const stmt of q.setup ?? []) for (const r of s.run(stmt)) if (!r.ok) fail(`setup : ${stmt.slice(0, 60)} → ${r.text}`);
    for (const stmt of q.setupPending ?? []) for (const r of s.run(stmt)) if (!r.ok) fail(`setupPending : ${stmt} → ${r.text}`);
    let shell: ShellState | null = q.steps.some((st) => st.kind === 'shell') ? initialState('agent') : null;
    if (shell) for (const h of q.setupShell ?? []) {
      const r = runLine(shell, h);
      shell = r.state;
      if (r.error) fail(`setupShell : ${h} → échec`);
    }
    for (const step of q.steps) {
      const where = `${q.id}/${step.id}`;
      if (step.kind === 'choice') {
        if (step.answer < 0 || step.answer >= step.options.length) fail(`${where} : réponse hors limites`);
        continue;
      }
      if (step.kind === 'plsql') {
        const empty = checkPlsqlStep(step, step.template ?? '');
        if (empty.pass) fail(`${where} : le gabarit de départ passe déjà la revue`);
        const v = checkPlsqlStep(step, step.solution);
        for (const i of v.items.filter((x) => !x.ok)) fail(`${where} : la solution échoue au critère « ${i.label} »`);
        continue;
      }
      if (step.kind === 'shell' && shell) {
        const cmds: { cmd: string; error: boolean }[] = [];
        const before = checkShellStep(shell, step, { cmds });
        if (before.pass) fail(`${where} : les critères sont déjà satisfaits avant d'agir`);
        for (const line of step.solution.split('\n').map((l) => l.trim()).filter(Boolean)) {
          const r = runLine(shell, line);
          shell = r.state;
          cmds.push({ cmd: line, error: r.error });
          const expectsError = step.checks.some((c) => c.t === 'ran' && c.mustError);
          if (r.error && !expectsError) fail(`${where} : la solution provoque une erreur sur « ${line} »`);
        }
        const after = checkShellStep(shell, step, { cmds });
        for (const i of after.items.filter((x) => !x.ok)) fail(`${where} : la solution échoue au critère « ${i.label} »`);
        continue;
      }
      const before = checkSqlStep(s, step, { results: [] });
      if (before.pass) fail(`${where} : les critères sont déjà satisfaits avant d'agir`);
      const results: StmtResult[] = s.run(step.solution);
      const expectsError = step.checks.some((c) => c.t === 'error');
      if (!expectsError) for (const r of results.filter((x) => !x.ok)) fail(`${where} : la solution provoque ${r.text.replace(/\n/g, ' ')}`);
      const after = checkSqlStep(s, step, { results });
      for (const i of after.items.filter((x) => !x.ok)) fail(`${where} : la solution échoue au critère « ${i.label} »`);
    }
  }
}
if (failures) { console.error(`\n${failures} problème(s).`); process.exit(1); }
console.log('\nToutes les quêtes sont réalisables.');
