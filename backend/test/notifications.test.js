const test = require('node:test');
const assert = require('node:assert/strict');
const n = require('../services/notificationService');

const H = 3_600_000;
const T0 = Date.UTC(2026, 10, 20, 12, 0, 0); // 20 nov. 2026, 12 h UTC

test('aucun rappel avant 24 h d’inactivité', () => {
  assert.equal(n.reminderDecision({ lastActiveMs: T0 - 23 * H, nowMs: T0, state: undefined }).send, false);
  assert.equal(n.reminderDecision({ lastActiveMs: T0 - 24 * H, nowMs: T0, state: undefined }).send, true);
});

test('rappels espacés : 1 j, 3 j, 7 j, 14 j puis silence', () => {
  let state = { stage: 1, lastReminderMs: T0 - 48 * H };
  assert.equal(n.reminderDecision({ lastActiveMs: T0 - 72 * H - 1, nowMs: T0, state }).send, true);
  assert.equal(n.reminderDecision({ lastActiveMs: T0 - 50 * H, nowMs: T0, state }).send, false);
  state = { stage: 4, lastReminderMs: T0 - 100 * H };
  assert.equal(n.reminderDecision({ lastActiveMs: T0 - 900 * H, nowMs: T0, state }).send, false);
});

test('jamais deux rappels à moins de 20 h d’intervalle', () => {
  const state = { stage: 0, lastReminderMs: T0 - 5 * H };
  assert.equal(n.reminderDecision({ lastActiveMs: T0 - 60 * H, nowMs: T0, state }).send, false);
});

test('l’utilisateur qui revient repart de l’étape 0', () => {
  const state = { stage: 3, lastReminderMs: T0 - 200 * H };
  const d = n.reminderDecision({ lastActiveMs: T0 - 30 * H, nowMs: T0, state });
  assert.equal(d.stage, 0);
  assert.equal(d.send, true);
});

test('pas de notification la nuit (21 h – 7 h au Bénin)', () => {
  assert.equal(n.inQuietHours(Date.UTC(2026, 10, 20, 20, 30)), true);
  assert.equal(n.inQuietHours(Date.UTC(2026, 10, 20, 3, 0)), true);
  assert.equal(n.inQuietHours(Date.UTC(2026, 10, 20, 6, 0)), false);
  assert.equal(n.inQuietHours(Date.UTC(2026, 10, 20, 19, 59)), false);
});

test('le message de rappel est stable pour un utilisateur et une étape, et prénommé', () => {
  const a = n.pickReminder(0, 'u1', 'Awa');
  assert.deepEqual(a, n.pickReminder(0, 'u1', 'Awa'));
  assert.match(a.body, /^Awa, /);
  assert.ok(a.title.length > 3);
  assert.ok(n.pickReminder(9, 'u1', '').body.length > 10); // étape hors bornes : dernier message
});

test('diffContent détecte les nouveaux modules et formations seulement', () => {
  const prev = { modules: { a: { title: 'A', annee: 3 } }, formations: { 'a:f1': { title: 'F1' } } };
  const cur = {
    modules: { a: { title: 'A', annee: 3 }, b: { title: 'B', annee: 2 } },
    formations: { 'a:f1': { title: 'F1' }, 'a:f2': { title: 'F2', tagline: 't', moduleId: 'a', id: 'f2', annee: 3 } },
  };
  const d = n.diffContent(prev, cur);
  assert.deepEqual(d.modules.map((m) => m.id), ['b']);
  assert.deepEqual(d.formations.map((f) => f.id), ['f2']);
});

test('annonces : détail jusqu’à 3 nouveautés, résumé au-delà, ciblées par classe', () => {
  const few = n.announcementsFor({
    modules: [{ id: 'web', title: 'Programmation web', annee: 2 }],
    formations: [{ moduleId: 'bdd', id: 'ddl', title: 'DDL', tagline: 'Créer sa base', annee: 3 }],
  });
  assert.equal(few.length, 2);
  assert.deepEqual(few[0].cursus, ['IG2']);
  assert.equal(few[0].url, '/m/web');
  assert.equal(few[1].url, '/m/bdd/formation/ddl');
  const forms = Array.from({ length: 5 }, (_, i) => ({ moduleId: 'm', id: `f${i}`, title: `F${i}`, annee: 3 }));
  const many = n.announcementsFor({ modules: [], formations: forms });
  assert.equal(many.length, 1);
  assert.match(many[0].body, /5 formations/);
  assert.deepEqual(n.announcementsFor({ modules: [], formations: [] }), []);
});

test('montée au classement : seulement n°1 ou entrée sur le podium', () => {
  assert.match(n.climbMessage(1, 0).title, /n°1/);
  assert.match(n.climbMessage(5, 2).title, /podium/);
  assert.equal(n.climbMessage(2, 1), null); // déjà sur le podium, pas n°1
  assert.equal(n.climbMessage(9, 6), null);
  assert.equal(n.climbMessage(3, 3), null);
  assert.equal(n.climbMessage(-1, 0), null);
});

test('le contenu réel du dépôt produit un instantané cohérent', () => {
  const s = n.snapshotContent();
  assert.ok(Object.keys(s.modules).length > 0);
  for (const f of Object.values(s.formations)) assert.ok(Array.isArray(f.cursus) && f.cursus.length > 0);
});

test('une annonce ne vise que les classes concernées (spécialité IG3 comprise)', () => {
  const cursus = require('../services/cursus');
  const audiences = [
    { id: 'ig2', codes: cursus.accessCodes('IG', 2, null) },
    { id: 'ari', codes: cursus.accessCodes('IG', 3, 'ARI') },
    { id: 'aip', codes: cursus.accessCodes('IG', 3, 'AIP') },
    { id: 'grh2', codes: cursus.accessCodes('GRH', 2, null) },
  ];
  assert.deepEqual(n.audienceIds(audiences, ['IG3']).sort(), ['aip', 'ari']);
  assert.deepEqual(n.audienceIds(audiences, ['IG3-ARI']), ['ari']);
  assert.deepEqual(n.audienceIds(audiences, ['GRH2']), ['grh2']);
  assert.deepEqual(n.audienceIds(audiences, ['STAT1']), []);
});
