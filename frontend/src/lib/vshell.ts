/**
 * Mini-shell simulé (bac à sable) pour les missions de terminal des formations.
 * Système de fichiers virtuel en mémoire + interpréteur d'un sous-ensemble de commandes
 * Unix courantes. Entièrement pur (state -> state) pour rester facile à tester et à rejouer.
 */

export interface VFile {
  kind: 'file';
  content: string;
  mode: string; // ex. "644"
}
export interface VDir {
  kind: 'dir';
  mode: string; // ex. "755"
  children: Record<string, VEntry>;
}
export type VEntry = VFile | VDir;

export interface ShellState {
  root: VDir;
  cwd: string; // chemin absolu, ex. "/home/awa"
  user: string;
  host: string;
  lastCommand: string;
  lastError: boolean;
  env: Record<string, string>;
  users: Record<string, string[]>; // utilisateur -> liste de groupes (le premier est le groupe primaire)
  groups: string[];
  packages: string[]; // paquets installés
  cron: string; // contenu de la crontab de l'utilisateur courant (une ligne par tâche)
}

export const dir = (children: Record<string, VEntry> = {}, mode = '755'): VDir => ({ kind: 'dir', children, mode });
export const file = (content = '', mode = '644'): VFile => ({ kind: 'file', content, mode });

/** Arborescence de départ raisonnable pour un atelier « administration Linux ». */
export function defaultRoot(user: string): VDir {
  return dir({
    home: dir({ [user]: dir({ documents: dir({}), projets: dir({}) }) }),
    etc: dir({ 'hostname': file('serveur\n') }),
    var: dir({ log: dir({ 'syslog': file('') }) }),
    tmp: dir({}),
  });
}

function splitPath(p: string): string[] {
  return p.split('/').filter(Boolean);
}
function joinAbs(parts: string[]): string {
  return '/' + parts.join('/');
}

/** Résout un chemin (absolu, relatif, ~) en chemin absolu normalisé (sans . ni ..). */
export function resolvePath(state: ShellState, p: string): string {
  if (!p) return state.cwd;
  let base = p;
  if (base === '~' || base.startsWith('~/')) base = `/home/${state.user}` + base.slice(1);
  const abs = base.startsWith('/') ? splitPath(base) : [...splitPath(state.cwd), ...splitPath(base)];
  const out: string[] = [];
  for (const seg of abs) {
    if (seg === '.') continue;
    if (seg === '..') out.pop();
    else out.push(seg);
  }
  return joinAbs(out);
}

export function getEntry(state: ShellState, absPath: string): VEntry | null {
  if (absPath === '/') return state.root;
  const parts = splitPath(absPath);
  let cur: VEntry = state.root;
  for (const seg of parts) {
    if (cur.kind !== 'dir') return null;
    const next: VEntry | undefined = cur.children[seg];
    if (!next) return null;
    cur = next;
  }
  return cur;
}

function getParentDir(state: ShellState, absPath: string): { parent: VDir; name: string } | null {
  const parts = splitPath(absPath);
  const name = parts.pop();
  if (!name) return null;
  const parentPath = joinAbs(parts);
  const parent = getEntry(state, parentPath);
  if (!parent || parent.kind !== 'dir') return null;
  return { parent, name };
}

/** Clone superficiel le long d'un chemin pour une immutabilité correcte (copy-on-write). */
function cloneAlong(state: ShellState, absPath: string): ShellState {
  const parts = splitPath(absPath);
  const root = { ...state.root, children: { ...state.root.children } };
  let cur = root;
  for (const seg of parts) {
    const child = cur.children[seg];
    if (child && child.kind === 'dir') {
      const copy: VDir = { ...child, children: { ...child.children } };
      cur.children[seg] = copy;
      cur = copy;
    } else break;
  }
  return { ...state, root };
}

export type Output = { state: ShellState; output: string; error: boolean };
const ok = (state: ShellState, output = ''): Output => ({ state: { ...state, lastError: false }, output, error: false });
const err = (state: ShellState, output: string): Output => ({ state: { ...state, lastError: true }, output, error: true });

function listDir(d: VDir, opts: { all: boolean; long: boolean }): string {
  const names = Object.keys(d.children).filter((n) => opts.all || !n.startsWith('.')).sort();
  if (!opts.long) return names.join('  ');
  return names
    .map((n) => {
      const e = d.children[n];
      const t = e.kind === 'dir' ? 'd' : '-';
      const size = e.kind === 'file' ? e.content.length : 4096;
      return `${t}rw-r--r-- 1 user user ${String(size).padStart(5)} ${n}${e.kind === 'dir' ? '/' : ''}`;
    })
    .join('\n');
}

function parseArgs(argv: string[]): { opts: Set<string>; pos: string[] } {
  const opts = new Set<string>();
  const pos: string[] = [];
  for (const a of argv) {
    if (a.startsWith('-') && a !== '-') {
      for (const ch of a.slice(1)) opts.add(ch);
    } else pos.push(a);
  }
  return { opts, pos };
}

function expandOne(state: ShellState, name: string): string {
  if (name === 'USER') return state.user;
  if (name === 'HOME') return `/home/${state.user}`;
  return state.env[name] ?? '';
}

const VAR_RE = /^\$\{([A-Za-z_][A-Za-z0-9_]*)\}|^\$([A-Za-z_][A-Za-z0-9_]*)/;

/**
 * Tokenise une ligne en respectant les guillemets simples/doubles. Les guillemets simples bloquent
 * l'expansion des variables `$VAR` (comme en bash réel) ; les doubles et le texte nu l'autorisent.
 */
function tokenize(line: string, state?: ShellState): string[] {
  const out: string[] = [];
  let cur = '';
  let quote: '"' | "'" | null = null;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quote === "'") {
      if (c === "'") quote = null;
      else cur += c;
      continue;
    }
    if (quote === '"') {
      if (c === '"') { quote = null; continue; }
      if (c === '$' && state) {
        const m = VAR_RE.exec(line.slice(i));
        if (m) { cur += expandOne(state, m[1] || m[2]); i += m[0].length - 1; continue; }
      }
      cur += c;
      continue;
    }
    if (c === '"' || c === "'") { quote = c; continue; }
    if (/\s/.test(c)) { if (cur) { out.push(cur); cur = ''; } continue; }
    if (c === '$' && state) {
      const m = VAR_RE.exec(line.slice(i));
      if (m) { cur += expandOne(state, m[1] || m[2]); i += m[0].length - 1; continue; }
    }
    cur += c;
  }
  if (cur) out.push(cur);
  return out;
}

/** Expanse `$VAR` dans une valeur brute (ex. partie droite d'une affectation ou chemin de redirection), en respectant les guillemets. */
function expandValue(state: ShellState, raw: string): string {
  let out = '';
  let quote: '"' | "'" | null = null;
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (quote === "'") { if (c === "'") quote = null; else out += c; continue; }
    if (quote === '"') {
      if (c === '"') { quote = null; continue; }
      if (c === '$') {
        const m = VAR_RE.exec(raw.slice(i));
        if (m) { out += expandOne(state, m[1] || m[2]); i += m[0].length - 1; continue; }
      }
      out += c;
      continue;
    }
    if (c === '"' || c === "'") { quote = c; continue; }
    if (c === '$') {
      const m = VAR_RE.exec(raw.slice(i));
      if (m) { out += expandOne(state, m[1] || m[2]); i += m[0].length - 1; continue; }
    }
    out += c;
  }
  return out;
}

function octalToSymbolic(mode: string): string {
  const map = ['---', '--x', '-w-', '-wx', 'r--', 'r-x', 'rw-', 'rwx'];
  return mode.split('').map((d) => map[Number(d)] ?? '---').join('');
}

/** Applique une commande chmod symbolique (ex. u+x, go-w, a=r) à un mode octal 3 chiffres. */
function applySymbolicChmod(mode: string, spec: string): string | null {
  const m = /^([ugoa]*)([+\-=])([rwx]*)$/.exec(spec);
  if (!m) return null;
  const who = m[1] || 'a';
  const op = m[2];
  const bits = m[3];
  const digits = mode.split('').map(Number);
  const targets = who.includes('a') ? [0, 1, 2] : [...new Set([...who].map((c) => ({ u: 0, g: 1, o: 2 }[c as 'u' | 'g' | 'o'])))];
  const val = (bits.includes('r') ? 4 : 0) | (bits.includes('w') ? 2 : 0) | (bits.includes('x') ? 1 : 0);
  for (const t of targets) {
    if (t === undefined) continue;
    if (op === '+') digits[t] |= val;
    else if (op === '-') digits[t] &= ~val;
    else digits[t] = val;
  }
  return digits.join('');
}

function scriptLines(content: string): string[] {
  return content
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));
}

/** Exécute un script ligne à ligne en réutilisant runLine (gère donc redirections, pipes, variables...). */
function runScript(state: ShellState, lines: string[]): Output {
  let s = state;
  const out: string[] = [];
  let anyError = false;
  for (const l of lines) {
    const r = runLine(s, l);
    s = r.state;
    if (r.output) out.push(r.output);
    if (r.error) anyError = true;
  }
  return { state: s, output: out.join('\n'), error: anyError };
}

function isExecutable(mode: string): boolean {
  const d = Number(mode[0] ?? '0');
  return !Number.isNaN(d) && (d & 1) === 1;
}

const PACKAGE_CATALOG = ['htop', 'curl', 'wget', 'git', 'vim', 'net-tools', 'telnet', 'rsync', 'unzip', 'tree', 'fail2ban'];

function runSingle(state: ShellState, argv: string[], stdin: string | null): Output {
  const [cmd, ...rest] = argv;
  if (!cmd) return ok(state, '');
  switch (cmd) {
    case 'pwd':
      return ok(state, state.cwd);
    case 'whoami':
      return ok(state, state.user);
    case 'echo':
      return ok(state, rest.join(' '));
    case 'cd': {
      const target = resolvePath(state, rest[0] || `/home/${state.user}`);
      const e = getEntry(state, target);
      if (!e) return err(state, `cd: ${rest[0]}: Aucun fichier ou dossier de ce type`);
      if (e.kind !== 'dir') return err(state, `cd: ${rest[0]}: N'est pas un dossier`);
      return ok({ ...state, cwd: target }, '');
    }
    case 'ls': {
      const { opts, pos } = parseArgs(rest);
      const target = resolvePath(state, pos[0] || '.');
      const e = getEntry(state, target);
      if (!e) return err(state, `ls: ${pos[0]}: Aucun fichier ou dossier de ce type`);
      if (e.kind === 'file') return ok(state, pos[0] || '.');
      return ok(state, listDir(e, { all: opts.has('a'), long: opts.has('l') }));
    }
    case 'mkdir': {
      const { opts, pos } = parseArgs(rest);
      if (!pos[0]) return err(state, 'mkdir: opérande manquant');
      const target = resolvePath(state, pos[0]);
      let s = state;
      if (opts.has('p')) {
        const parts = splitPath(target);
        let acc = '';
        for (const seg of parts) {
          acc += '/' + seg;
          if (!getEntry(s, acc)) {
            const pd = getParentDir(s, acc);
            if (!pd) return err(state, `mkdir: impossible de créer ${pos[0]}`);
            s = cloneAlong(s, acc);
            const pd2 = getParentDir(s, acc)!;
            pd2.parent.children[pd2.name] = dir();
          }
        }
        return ok(s, '');
      }
      if (getEntry(s, target)) return err(state, `mkdir: ${pos[0]}: Le fichier existe déjà`);
      const pd = getParentDir(s, target);
      if (!pd) return err(state, `mkdir: ${pos[0]}: dossier parent introuvable`);
      s = cloneAlong(s, target);
      const pd2 = getParentDir(s, target)!;
      pd2.parent.children[pd2.name] = dir();
      return ok(s, '');
    }
    case 'touch': {
      const { pos } = parseArgs(rest);
      let s = state;
      for (const p of pos) {
        const target = resolvePath(s, p);
        if (getEntry(s, target)) continue;
        const pd = getParentDir(s, target);
        if (!pd) return err(state, `touch: ${p}: dossier parent introuvable`);
        s = cloneAlong(s, target);
        const pd2 = getParentDir(s, target)!;
        pd2.parent.children[pd2.name] = file('');
      }
      return ok(s, '');
    }
    case 'cat': {
      const { pos } = parseArgs(rest);
      if (!pos.length) return ok(state, stdin ?? '');
      const parts: string[] = [];
      for (const p of pos) {
        const target = resolvePath(state, p);
        const e = getEntry(state, target);
        if (!e) return err(state, `cat: ${p}: Aucun fichier ou dossier de ce type`);
        if (e.kind !== 'file') return err(state, `cat: ${p}: est un dossier`);
        parts.push(e.content);
      }
      return ok(state, parts.join(''));
    }
    case 'rm': {
      const { opts, pos } = parseArgs(rest);
      let s = state;
      for (const p of pos) {
        const target = resolvePath(s, p);
        const e = getEntry(s, target);
        if (!e) return err(state, `rm: ${p}: Aucun fichier ou dossier de ce type`);
        if (e.kind === 'dir' && !opts.has('r')) return err(state, `rm: ${p}: est un dossier (utilise -r)`);
        const pd = getParentDir(s, target);
        if (!pd) return err(state, `rm: ${p}: impossible`);
        s = cloneAlong(s, target);
        const pd2 = getParentDir(s, target)!;
        delete pd2.parent.children[pd2.name];
      }
      return ok(s, '');
    }
    case 'cp':
    case 'mv': {
      const { pos } = parseArgs(rest);
      if (pos.length < 2) return err(state, `${cmd}: deux chemins attendus`);
      const srcPath = resolvePath(state, pos[0]);
      const src = getEntry(state, srcPath);
      if (!src) return err(state, `${cmd}: ${pos[0]}: Aucun fichier ou dossier de ce type`);
      let destPath = resolvePath(state, pos[1]);
      const destEntry = getEntry(state, destPath);
      if (destEntry && destEntry.kind === 'dir') destPath = resolvePath(state, destPath + '/' + pos[0].split('/').pop());
      let s = cloneAlong(state, srcPath);
      s = cloneAlong(s, destPath);
      const pdDest = getParentDir(s, destPath);
      if (!pdDest) return err(state, `${cmd}: destination invalide`);
      pdDest.parent.children[pdDest.name] = JSON.parse(JSON.stringify(src));
      if (cmd === 'mv') {
        const pdSrc = getParentDir(s, srcPath)!;
        delete pdSrc.parent.children[pdSrc.name];
      }
      return ok(s, '');
    }
    case 'chmod': {
      const { pos } = parseArgs(rest);
      if (pos.length < 2) return err(state, 'chmod: deux arguments attendus (mode, fichier)');
      const [spec, p] = pos;
      const target = resolvePath(state, p);
      const e = getEntry(state, target);
      if (!e) return err(state, `chmod: ${p}: Aucun fichier ou dossier de ce type`);
      const newMode = /^[0-7]{3}$/.test(spec) ? spec : applySymbolicChmod(e.mode, spec);
      if (!newMode) return err(state, `chmod: mode invalide : ${spec}`);
      let s = cloneAlong(state, target);
      const pd = getParentDir(s, target)!;
      pd.parent.children[pd.name] = { ...e, mode: newMode } as VEntry;
      return ok(s, '');
    }
    case 'grep': {
      const { opts, pos } = parseArgs(rest);
      const pattern = pos[0];
      let text = stdin ?? '';
      if (pos[1]) {
        const target = resolvePath(state, pos[1]);
        const e = getEntry(state, target);
        if (!e || e.kind !== 'file') return err(state, `grep: ${pos[1]}: Aucun fichier ou dossier de ce type`);
        text = e.content;
      }
      const flags = opts.has('i') ? 'i' : '';
      let re: RegExp;
      try { re = new RegExp(pattern, flags); } catch { return err(state, 'grep: motif invalide'); }
      const lines = text.split('\n').filter((l) => l.length || text.includes('\n'));
      const matched = lines.filter((l) => re.test(l));
      const kept = opts.has('v') ? lines.filter((l) => !re.test(l)) : matched;
      if (opts.has('c')) return ok(state, String(kept.length));
      return ok(state, kept.join('\n'));
    }
    case 'wc': {
      const { opts, pos } = parseArgs(rest);
      let text = stdin ?? '';
      if (pos[0]) {
        const target = resolvePath(state, pos[0]);
        const e = getEntry(state, target);
        if (!e || e.kind !== 'file') return err(state, `wc: ${pos[0]}: Aucun fichier ou dossier de ce type`);
        text = e.content;
      }
      const lines = text ? text.split('\n').length - (text.endsWith('\n') ? 1 : 0) : 0;
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const chars = text.length;
      if (opts.has('l')) return ok(state, String(lines));
      if (opts.has('w')) return ok(state, String(words));
      if (opts.has('c')) return ok(state, String(chars));
      return ok(state, `${lines} ${words} ${chars}`);
    }
    case 'head':
    case 'tail': {
      const { opts, pos } = parseArgs(rest);
      const nIdx = rest.indexOf('-n');
      const n = nIdx >= 0 ? Number(rest[nIdx + 1]) : 10;
      let text = stdin ?? '';
      const fileArg = pos.find((p) => p !== String(n));
      if (fileArg) {
        const target = resolvePath(state, fileArg);
        const e = getEntry(state, target);
        if (!e || e.kind !== 'file') return err(state, `${cmd}: ${fileArg}: Aucun fichier ou dossier de ce type`);
        text = e.content;
      }
      const lines = text.split('\n');
      const picked = cmd === 'head' ? lines.slice(0, n) : lines.slice(Math.max(0, lines.length - n));
      return ok(state, picked.join('\n'));
    }
    case 'clear':
      return ok(state, '\u0000CLEAR\u0000');
    case 'export': {
      let s = state;
      for (const a of rest) {
        const m = /^([A-Za-z_][A-Za-z0-9_]*)(=(.*))?$/.exec(a);
        if (m && m[2] !== undefined) s = { ...s, env: { ...s.env, [m[1]]: expandValue(s, m[3]) } };
      }
      return ok(s, '');
    }
    case 'sudo': {
      if (!rest.length) return err(state, 'sudo: une commande est attendue');
      return runSingle(state, rest, stdin);
    }
    case 'find': {
      const { pos } = parseArgs(rest);
      const nameIdx = rest.indexOf('-name');
      const typeIdx = rest.indexOf('-type');
      const namePattern = nameIdx >= 0 ? rest[nameIdx + 1] : null;
      const typeFilter = typeIdx >= 0 ? rest[typeIdx + 1] : null;
      const startArg = pos.find((p) => p !== namePattern && p !== typeFilter) || '.';
      const startAbs = resolvePath(state, startArg);
      const startEntry = getEntry(state, startAbs);
      if (!startEntry) return err(state, `find: ${startArg}: Aucun fichier ou dossier de ce type`);
      const reGlob = namePattern
        ? new RegExp('^' + namePattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$')
        : null;
      const results: string[] = [];
      const walk = (e: VEntry, absPath: string, label: string) => {
        const matchesType = !typeFilter || (typeFilter === 'f' && e.kind === 'file') || (typeFilter === 'd' && e.kind === 'dir');
        const name = absPath.split('/').pop() || absPath;
        const matchesName = !reGlob || reGlob.test(name);
        if (matchesType && matchesName) results.push(label);
        if (e.kind === 'dir') {
          for (const [childName, child] of Object.entries(e.children).sort((a, b) => a[0].localeCompare(b[0]))) {
            walk(child, absPath === '/' ? `/${childName}` : `${absPath}/${childName}`, label === '.' ? `./${childName}` : `${label}/${childName}`);
          }
        }
      };
      walk(startEntry, startAbs, startArg);
      return ok(state, results.join('\n'));
    }
    case 'useradd': {
      const gIdx = rest.indexOf('-G');
      const extraGroups = gIdx >= 0 && rest[gIdx + 1] ? rest[gIdx + 1].split(',').filter(Boolean) : [];
      const skip = new Set(gIdx >= 0 ? [gIdx, gIdx + 1] : []);
      const name = rest.find((a, i) => !skip.has(i) && !a.startsWith('-'));
      if (!name) return err(state, 'useradd: nom d\'utilisateur attendu');
      if (state.users[name]) return err(state, `useradd: l'utilisateur « ${name} » existe déjà`);
      let s: ShellState = { ...state, users: { ...state.users, [name]: [name, ...extraGroups] }, groups: Array.from(new Set([...state.groups, name, ...extraGroups])) };
      if (rest.includes('-m')) {
        const home = `/home/${name}`;
        if (!getEntry(s, home)) {
          s = cloneAlong(s, home);
          const pd = getParentDir(s, home)!;
          pd.parent.children[pd.name] = dir({}, '755');
        }
      }
      return ok(s, '');
    }
    case 'groupadd': {
      const name = rest.find((a) => !a.startsWith('-'));
      if (!name) return err(state, 'groupadd: nom de groupe attendu');
      if (state.groups.includes(name)) return err(state, `groupadd: le groupe « ${name} » existe déjà`);
      return ok({ ...state, groups: [...state.groups, name] }, '');
    }
    case 'usermod': {
      const { pos } = parseArgs(rest.filter((a) => a !== '-aG'));
      const gIdx = rest.indexOf('-aG');
      if (gIdx < 0) return err(state, 'usermod: option -aG attendue');
      const group = rest[gIdx + 1];
      const name = pos[pos.length - 1];
      if (!name || !state.users[name]) return err(state, `usermod: l'utilisateur « ${name} » n'existe pas`);
      if (!state.groups.includes(group)) return err(state, `usermod: le groupe « ${group} » n'existe pas`);
      const groups = Array.from(new Set([...state.users[name], group]));
      return ok({ ...state, users: { ...state.users, [name]: groups } }, '');
    }
    case 'id': {
      const name = rest.find((a) => !a.startsWith('-')) || state.user;
      const groups = state.users[name];
      if (!groups) return err(state, `id: « ${name} » : utilisateur inconnu`);
      return ok(state, `uid=1000(${name}) gid=1000(${groups[0]}) groupes=${groups.map((g) => g).join(',')}`);
    }
    case 'groups': {
      const name = rest.find((a) => !a.startsWith('-')) || state.user;
      const groups = state.users[name];
      if (!groups) return err(state, `groups: « ${name} » : utilisateur inconnu`);
      return ok(state, `${name} : ${groups.join(' ')}`);
    }
    case 'passwd': {
      const name = rest.find((a) => !a.startsWith('-')) || state.user;
      if (!state.users[name]) return err(state, `passwd: « ${name} » : utilisateur inconnu`);
      return ok(state, `passwd : mot de passe de ${name} mis à jour avec succès`);
    }
    case 'ps': {
      const header = '  PID TTY          TIME CMD';
      const rows = [
        '    1 ?        00:00:02 systemd',
        '  842 ?        00:00:00 sshd',
        ' 1203 ?        00:00:01 cron',
        ' 4821 ?        00:14:57 backup_old.sh',
      ];
      return ok(state, [header, ...rows].join('\n'));
    }
    case 'kill': {
      const pid = rest.find((a) => /^\d+$/.test(a));
      if (!pid) return err(state, 'kill: PID attendu');
      return ok(state, '');
    }
    case 'crontab': {
      if (rest.includes('-l')) return ok(state, state.cron || `pas de tâches planifiées pour ${state.user}`);
      if (rest.includes('-r')) return ok({ ...state, cron: '' }, '');
      const arg = rest.find((a) => !a.startsWith('-'));
      let content: string;
      if (!arg || arg === '-') {
        content = stdin ?? '';
      } else {
        const target = resolvePath(state, arg);
        const e = getEntry(state, target);
        if (!e || e.kind !== 'file') return err(state, `crontab: ${arg}: Aucun fichier ou dossier de ce type`);
        content = e.content;
      }
      return ok({ ...state, cron: content.trim() }, '');
    }
    case 'apt':
    case 'apt-get':
    case 'dpkg': {
      const sub = rest[0];
      if (cmd === 'dpkg' && sub === '-l') return ok(state, state.packages.sort().join('\n'));
      if (sub === 'list' && rest.includes('--installed')) return ok(state, state.packages.sort().map((p) => `${p}/stable`).join('\n'));
      if (sub === 'install') {
        const pkg = rest[1];
        if (!pkg) return err(state, 'apt: nom de paquet attendu');
        if (!PACKAGE_CATALOG.includes(pkg) && !BASE_PACKAGES.includes(pkg)) return err(state, `E: Impossible de trouver le paquet ${pkg}`);
        if (state.packages.includes(pkg)) return ok(state, `${pkg} est déjà la version la plus récente.`);
        return ok({ ...state, packages: [...state.packages, pkg] }, `Installation de ${pkg} terminée avec succès.`);
      }
      if (sub === 'remove' || sub === 'purge') {
        const pkg = rest[1];
        if (!pkg || !state.packages.includes(pkg)) return err(state, `E: Le paquet ${pkg} n'est pas installé`);
        return ok({ ...state, packages: state.packages.filter((p) => p !== pkg) }, `${pkg} supprimé avec succès.`);
      }
      if (sub === 'update') return ok(state, 'Listes de paquets à jour.');
      return err(state, `${cmd}: sous-commande inconnue`);
    }
    case 'bash':
    case 'sh': {
      const { pos } = parseArgs(rest);
      if (!pos[0]) return err(state, `${cmd}: nom de script attendu`);
      const target = resolvePath(state, pos[0]);
      const e = getEntry(state, target);
      if (!e) return err(state, `${cmd}: ${pos[0]}: Aucun fichier ou dossier de ce type`);
      if (e.kind !== 'file') return err(state, `${cmd}: ${pos[0]} : est un dossier`);
      const r = runScript(state, scriptLines(e.content));
      return { state: r.state, output: r.output, error: r.error };
    }
    default: {
      if (/^(\.\/|\/)\S+$/.test(cmd)) {
        const target = resolvePath(state, cmd);
        const e = getEntry(state, target);
        if (!e) return err(state, `${cmd}: Aucun fichier ou dossier de ce type`);
        if (e.kind !== 'file') return err(state, `${cmd} : est un dossier`);
        if (!isExecutable(e.mode)) return err(state, `${cmd}: Permission refusée`);
        const r = runScript(state, scriptLines(e.content));
        return { state: r.state, output: r.output, error: r.error };
      }
      return err(state, `${cmd}: commande introuvable`);
    }
  }
}

/** Exécute une ligne complète (gère > >> et | ) et renvoie le nouvel état + la sortie affichée. */
export function runLine(state: ShellState, rawLine: string): Output {
  const line = rawLine.trim();
  if (!line) return ok(state, '');

  // Affectation de variable : « NOM=valeur », seule sur la ligne (pas de pipe ni redirection).
  const assignMatch = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(line);
  if (assignMatch && !line.includes('|') && !/[<>]/.test(line)) {
    const [, name, rawVal] = assignMatch;
    const val = expandValue(state, rawVal);
    return ok({ ...state, env: { ...state.env, [name]: val }, lastCommand: line }, '');
  }

  let redirectAppend = false;
  let redirectPath: string | null = null;
  let body = line;
  const appendMatch = /^(.*)>>\s*(\S+)\s*$/.exec(body);
  const writeMatch = !appendMatch && /^(.*[^>])>\s*(\S+)\s*$/.exec(body);
  if (appendMatch) { body = appendMatch[1]; redirectAppend = true; redirectPath = appendMatch[2]; }
  else if (writeMatch) { body = writeMatch[1]; redirectPath = writeMatch[2]; }
  if (redirectPath) redirectPath = expandValue(state, redirectPath);

  const stages = body.split('|').map((s) => s.trim()).filter(Boolean);
  let s = state;
  let pipeData: string | null = null;
  let anyError = false;
  for (const stage of stages) {
    const argv = tokenize(stage, s);
    const res = runSingle(s, argv, pipeData);
    s = res.state;
    pipeData = res.output;
    if (res.error) anyError = true;
  }
  let finalOutput = pipeData ?? '';

  if (redirectPath) {
    const target = resolvePath(s, redirectPath);
    const existing = getEntry(s, target);
    const prev = existing && existing.kind === 'file' ? existing.content : '';
    const content = redirectAppend ? prev + finalOutput + '\n' : finalOutput + '\n';
    s = cloneAlong(s, target);
    const pd = getParentDir(s, target);
    if (pd) pd.parent.children[pd.name] = file(content);
    finalOutput = '';
  }

  return { state: { ...s, lastCommand: line, lastError: anyError }, output: finalOutput, error: anyError };
}

const BASE_PACKAGES = ['bash', 'coreutils', 'openssh-server', 'cron', 'telnet'];

export function initialState(user = 'awa', host = 'serveur'): ShellState {
  return {
    root: defaultRoot(user),
    cwd: `/home/${user}`,
    user,
    host,
    lastCommand: '',
    lastError: false,
    env: {},
    users: { [user]: [user] },
    groups: [user],
    packages: [...BASE_PACKAGES],
    cron: '',
  };
}

export function promptOf(state: ShellState): string {
  const home = `/home/${state.user}`;
  const shown = state.cwd === home ? '~' : state.cwd.startsWith(home + '/') ? '~' + state.cwd.slice(home.length) : state.cwd;
  return `${state.user}@${state.host}:${shown}$`;
}

export { octalToSymbolic };

export interface TerminalCheckLike {
  commandPattern?: string;
  mustError?: boolean;
  cwd?: string;
  filePresent?: string;
  fileAbsent?: string;
  fileEquals?: { path: string; value: string };
  fileContains?: { path: string; value: string };
  fileMode?: { path: string; value: string };
}

/** Vérifie une mission déclarative contre l'état courant du shell virtuel. Toutes les conditions présentes doivent être vraies (ET). */
export function evaluateCheck(check: TerminalCheckLike, state: ShellState): boolean {
  if (check.commandPattern) {
    let re: RegExp;
    try { re = new RegExp(check.commandPattern); } catch { return false; }
    if (!re.test(state.lastCommand)) return false;
  }
  if (check.mustError !== undefined && state.lastError !== check.mustError) return false;
  if (check.cwd !== undefined && resolvePath(state, check.cwd) !== state.cwd) return false;
  if (check.filePresent !== undefined && !getEntry(state, resolvePath(state, check.filePresent))) return false;
  if (check.fileAbsent !== undefined && getEntry(state, resolvePath(state, check.fileAbsent))) return false;
  if (check.fileEquals) {
    const e = getEntry(state, resolvePath(state, check.fileEquals.path));
    if (!e || e.kind !== 'file' || e.content.trim() !== check.fileEquals.value.trim()) return false;
  }
  if (check.fileContains) {
    const e = getEntry(state, resolvePath(state, check.fileContains.path));
    if (!e || e.kind !== 'file' || !e.content.includes(check.fileContains.value)) return false;
  }
  if (check.fileMode) {
    const e = getEntry(state, resolvePath(state, check.fileMode.path));
    if (!e || e.mode !== check.fileMode.value) return false;
  }
  return true;
}
