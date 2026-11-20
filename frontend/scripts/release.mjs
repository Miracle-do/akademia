#!/usr/bin/env node
// Publie une version : monte le numéro, range « Non publié » du CHANGELOG sous la nouvelle version, committe et pose un tag Git.
// Usage : npm run release -- patch|minor|major [--dry-run] [--no-git]
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const kind = args.find((a) => ['patch', 'minor', 'major'].includes(a));
const dry = args.includes('--dry-run');
const noGit = args.includes('--no-git');
if (!kind) { console.error('Usage : npm run release -- patch|minor|major [--dry-run] [--no-git]'); process.exit(1); }

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const [maj, min, pat] = pkg.version.split('.').map(Number);
const next = kind === 'major' ? `${maj + 1}.0.0` : kind === 'minor' ? `${maj}.${min + 1}.0` : `${maj}.${min}.${pat + 1}`;
const today = new Date().toLocaleDateString('sv-SE');

const logPath = path.join(root, 'CHANGELOG.md');
const log = fs.readFileSync(logPath, 'utf8');
const m = log.match(/## \[Non publié\]\n([\s\S]*?)(?=\n## \[|$)/);
if (!m || !m[1].trim()) { console.error('Rien sous « Non publié » dans CHANGELOG.md : décris d\'abord les changements.'); process.exit(1); }
const body = m[1].trim();
const newLog = log.replace(m[0], `## [Non publié]\n\n## [${next}] — ${today}\n\n${body}\n`);

console.log(`Version ${pkg.version} → ${next} (${kind})\n\n${body}\n`);
if (dry) { console.log('(simulation : rien n\'a été modifié)'); process.exit(0); }

pkg.version = next;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
fs.writeFileSync(logPath, newLog.replace(/\n{3,}/g, '\n\n'));
const lockPath = path.join(root, '..', 'package-lock.json');
if (fs.existsSync(lockPath)) {
  const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
  if (lock.packages?.frontend?.version) { lock.packages.frontend.version = next; fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2) + '\n'); }
}
if (!noGit) {
  const run = (c) => execSync(c, { cwd: path.join(root, '..'), stdio: 'inherit' });
  run('git add frontend/package.json frontend/CHANGELOG.md package-lock.json');
  run(`git commit -m "release: v${next}"`);
  run(`git tag -a v${next} -m "Akademia v${next}"`);
  console.log(`\nÀ pousser : git push origin main, puis git push origin v${next} (le tag peut être refusé depuis l'environnement de Claude : le pousser alors depuis ton poste)`);
}
