// Construit public/search-index.json : un index plein texte des chapitres de cours, chargé à la demande par la page « Recherche ».
// Lancé automatiquement avant « npm run dev » et « npm run build » (voir package.json).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const modulesDir = path.join(root, 'content', 'modules');
const out = path.join(root, 'public', 'search-index.json');

function plain(md) {
  return md
    .replace(/^```.*$/gm, '')
    .replace(/^:::\w*\s*(.*)$/gm, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/^\s*\|?[\s:|-]{3,}\|?\s*$/gm, ' ')
    .replace(/[|*`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const items = [];
for (const m of fs.readdirSync(modulesDir, { withFileTypes: true }).filter((e) => e.isDirectory())) {
  const metaFile = path.join(modulesDir, m.name, 'module.json');
  if (!fs.existsSync(metaFile)) continue;
  const meta = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
  for (const ch of meta.chapters ?? []) {
    const file = path.join(modulesDir, m.name, 'chapters', ch.file);
    if (!fs.existsSync(file)) continue;
    const md = fs.readFileSync(file, 'utf8');
    const headings = [...md.matchAll(/^#{1,4}\s+(.+)$/gm)].map((h) => plain(h[1]));
    items.push({ m: m.name, c: ch.id, t: ch.title, n: ch.number ?? '', s: ch.summary ?? '', h: headings, x: plain(md) });
  }
}
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify({ v: 1, items }));
console.log(`Index de recherche : ${items.length} chapitres, ${(fs.statSync(out).size / 1024).toFixed(0)} Ko`);
