// Filières, années et spécialités : source unique = frontend/content/cursus.json (partagée avec le frontend).
const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../frontend/content/cursus.json'), 'utf8'));
const PROGRAMMES = Object.fromEntries(data.programmes.map((p) => [p.id, p]));
const DEFAULT_PROGRAMME = 'IG';
const BATTLE_CLASS = 'IG3';

function normalizeProgramme(value) {
  const id = typeof value === 'string' ? value.trim().toUpperCase() : '';
  return PROGRAMMES[id] ? id : DEFAULT_PROGRAMME;
}

// 1, 2 ou 3 ; toute autre valeur (ou absence) = 3 (comptes existants, tous en 2e/3e année d'IG).
function normalizeAnnee(value) {
  const n = Number.parseInt(String(value ?? '').replace(/\D/g, ''), 10);
  return n === 1 || n === 2 ? n : 3;
}

function isValidAnnee(value) {
  return /^[123]$/.test(String(value ?? ''));
}

// Spécialité (ARI/AIP) : n'existe que si la filière en propose une pour cette année (aujourd'hui IG3 uniquement).
function specialitesFor(programme, annee) {
  return PROGRAMMES[normalizeProgramme(programme)].specialites?.[String(normalizeAnnee(annee))] ?? [];
}

function normalizeSpecialite(programme, annee, value) {
  const list = specialitesFor(programme, annee);
  const id = typeof value === 'string' ? value.trim().toUpperCase() : '';
  return list.includes(id) ? id : null;
}

const classCode = (programme, annee) => `${normalizeProgramme(programme)}${normalizeAnnee(annee)}`;

// Codes qui donnent accès à un module pour un étudiant : sa classe, et sa classe + spécialité (ex. IG3 et IG3-ARI).
function accessCodes(programme, annee, specialite) {
  const base = classCode(programme, annee);
  const spec = normalizeSpecialite(programme, annee, specialite);
  return spec ? [base, `${base}-${spec}`] : [base];
}

// Classes visées par un module : `cursus: ["IG3"]`. Ancien format : `annee: 2` = IG2 ; rien = IG3.
function moduleCodes(meta) {
  if (Array.isArray(meta?.cursus) && meta.cursus.length) return meta.cursus.map(String);
  return [`IG${normalizeAnnee(meta?.annee)}`];
}

function moduleVisibleFor(meta, programme, annee, specialite) {
  const mine = accessCodes(programme, annee, specialite);
  return moduleCodes(meta).some((c) => mine.includes(c));
}

function themeFor(programme, annee, specialite) {
  const spec = normalizeSpecialite(programme, annee, specialite);
  if (spec) return data.specialites[spec].theme;
  return PROGRAMMES[normalizeProgramme(programme)].theme;
}

const isBattleClass = (programme, annee) => classCode(programme, annee) === BATTLE_CLASS;

module.exports = {
  data, PROGRAMMES, DEFAULT_PROGRAMME, BATTLE_CLASS,
  normalizeProgramme, normalizeAnnee, isValidAnnee, specialitesFor, normalizeSpecialite,
  classCode, accessCodes, moduleCodes, moduleVisibleFor, themeFor, isBattleClass,
};
