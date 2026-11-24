// Notifications de l'application : boîte de réception (table `notifications`) + notification push.
// Événements gérés : nouveau module, nouvelle formation, dépassement au classement, rappels d'inactivité.
const crypto = require('crypto');
const pushService = require('./pushService');
const contentService = require('./contentService');
const cursus = require('./cursus');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function storageConfigured() {
  return Boolean(supabaseUrl && serviceRoleKey);
}

async function db(path, options = {}) {
  if (!storageConfigured()) {
    const error = new Error('Stockage des notifications non configuré.');
    error.status = 503;
    throw error;
  }
  const response = await fetch(`${supabaseUrl}${path}`, {
    ...options,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  if (!response.ok) {
    const error = new Error(`Notifications : requête refusée (${response.status}) ${text.slice(0, 160)}`);
    error.status = response.status >= 500 ? 502 : response.status;
    throw error;
  }
  if (!text.trim()) return null;
  try { return JSON.parse(text); } catch { return null; }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const cleanIds = (ids) => [...new Set(ids)].filter((id) => typeof id === 'string' && UUID.test(id));

/**
 * Crée une notification pour chacun des utilisateurs (boîte de réception) puis envoie le push à ceux qui l'ont activé.
 * `tag` : une seule notification non lue par tag et par utilisateur (la nouvelle remplace l'ancienne).
 */
async function notifyUsers(userIds, { kind, title, body, url = '/', tag = null }) {
  const ids = cleanIds(userIds);
  if (!ids.length || !storageConfigured()) return { inbox: 0, push: 0 };
  let inbox = 0;
  try {
    if (tag) {
      const q = new URLSearchParams({ user_id: `in.(${ids.join(',')})`, tag: `eq.${tag}`, read_at: 'is.null' });
      await db(`/rest/v1/notifications?${q}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
    }
    const rows = ids.map((user_id) => ({ user_id, kind, title, body, url, tag }));
    await db('/rest/v1/notifications', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(rows) });
    inbox = ids.length;
  } catch (error) {
    console.warn('[notifications] boîte de réception indisponible :', error.message);
  }
  let push = 0;
  if (pushService.isConfigured()) {
    try {
      push = await pushService.sendToUsers(ids, { title, body, url, tag: tag || kind });
    } catch (error) {
      console.warn('[notifications] push impossible :', error.message);
    }
  }
  return { inbox, push };
}

async function listForUser(userId, limit = 30) {
  if (!storageConfigured() || !UUID.test(userId)) return { items: [], unread: 0 };
  const safe = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 30));
  const q = new URLSearchParams({
    select: 'id,kind,title,body,url,created_at,read_at',
    user_id: `eq.${userId}`,
    order: 'created_at.desc',
    limit: String(safe),
  });
  const items = (await db(`/rest/v1/notifications?${q}`)) || [];
  const unreadQuery = new URLSearchParams({ select: 'id', user_id: `eq.${userId}`, read_at: 'is.null', limit: '100' });
  const unread = ((await db(`/rest/v1/notifications?${unreadQuery}`)) || []).length;
  return { items, unread };
}

async function markRead(userId, ids) {
  if (!storageConfigured() || !UUID.test(userId)) return;
  const q = new URLSearchParams({ user_id: `eq.${userId}`, read_at: 'is.null' });
  const wanted = Array.isArray(ids) ? cleanIds(ids) : [];
  if (wanted.length) q.set('id', `in.(${wanted.join(',')})`);
  await db(`/rest/v1/notifications?${q}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ read_at: new Date().toISOString() }),
  });
}

// ---------------------------------------------------------------- Classement

async function notifyOvertaken(userIds, username) {
  return notifyUsers(userIds, {
    kind: 'rank',
    title: 'Classement Akademia',
    body: `${username} vient de te dépasser au classement. À toi de reprendre ta place !`,
    url: '/classement',
    tag: `rank-${username}`,
  });
}

/** Le joueur vient d'entrer sur le podium (ou de prendre la 1re place). */
function climbMessage(oldRank, newRank) {
  if (newRank < 0 || oldRank < 0 || newRank >= oldRank) return null;
  const place = newRank + 1;
  if (place === 1) return { title: 'Tu es n°1 ! 👑', body: 'Tu prends la tête du classement de ton année. Garde ta place !' };
  if (place <= 3 && oldRank + 1 > 3) return { title: 'Tu montes sur le podium 🏆', body: `Tu es maintenant n°${place} au classement. Continue !` };
  return null;
}

async function notifyClimb(userId, oldRank, newRank) {
  const message = climbMessage(oldRank, newRank);
  if (!message) return null;
  return notifyUsers([userId], { kind: 'rank', ...message, url: '/classement', tag: 'rank-climb' });
}

// ---------------------------------------------------------------- Nouveautés de contenu

function snapshotContent() {
  const modules = {};
  const formations = {};
  for (const m of contentService.getModules()) {
    modules[m.id] = { title: m.title, cursus: cursus.moduleCodes(m) };
    for (const f of contentService.getFormations(m.id)) {
      formations[`${m.id}:${f.id}`] = { title: f.title, tagline: f.tagline || '', moduleId: m.id, id: f.id, cursus: modules[m.id].cursus };
    }
  }
  return { modules, formations };
}

function diffContent(previous, current) {
  const prevModules = previous?.modules || {};
  const prevFormations = previous?.formations || {};
  return {
    modules: Object.entries(current.modules).filter(([id]) => !prevModules[id]).map(([id, v]) => ({ id, ...v })),
    formations: Object.entries(current.formations).filter(([key]) => !prevFormations[key]).map(([, v]) => v),
  };
}

/**
 * Transforme les nouveautés en notifications : { cursus: [codes de classe visés], kind, title, body, url, tag }.
 * Une nouveauté ne notifie que les étudiants à qui le contenu est destiné (ex. un module IG2 ne notifie que IG2).
 */
function announcementsFor(diff) {
  const out = [];
  const total = diff.modules.length + diff.formations.length;
  if (total === 0) return out;
  const codesOf = cursus.moduleCodes;
  if (total > 3) {
    const classes = [...new Set([...diff.modules, ...diff.formations].flatMap(codesOf))].sort();
    for (const code of classes) {
      const mods = diff.modules.filter((m) => codesOf(m).includes(code)).length;
      const forms = diff.formations.filter((f) => codesOf(f).includes(code)).length;
      const parts = [];
      if (mods) parts.push(`${mods} module${mods > 1 ? 's' : ''}`);
      if (forms) parts.push(`${forms} formation${forms > 1 ? 's' : ''}`);
      out.push({ cursus: [code], kind: 'content', title: 'Du nouveau sur Akademia ✨', body: `${parts.join(' et ')} ajouté${mods + forms > 1 ? 's' : ''} pour ta classe.`, url: '/modules', tag: `content-${code}` });
    }
    return out;
  }
  for (const m of diff.modules) {
    out.push({ cursus: codesOf(m), kind: 'content', title: `Nouveau module : ${m.title}`, body: `Le cours est disponible. Viens le découvrir !`, url: `/m/${m.id}`, tag: `module-${m.id}` });
  }
  for (const f of diff.formations) {
    out.push({ cursus: codesOf(f), kind: 'content', title: `Nouvelle formation : ${f.title}`, body: f.tagline || 'Une nouvelle formation guidée avec Nimbo t’attend.', url: `/m/${f.moduleId}/formation/${f.id}`, tag: `formation-${f.moduleId}-${f.id}` });
  }
  return out;
}

async function loadKv(key) {
  const q = new URLSearchParams({ select: 'value', key: `eq.${key}` });
  const rows = await db(`/rest/v1/app_kv?${q}`);
  return rows && rows[0] ? rows[0].value : null;
}

async function saveKv(key, value) {
  await db('/rest/v1/app_kv?on_conflict=key', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ key, value, updated_at: new Date().toISOString() }),
  });
}

/** Profils avec leurs codes d'accès (classe, et classe-spécialité pour IG3). */
async function userAudiences() {
  const rows = (await db('/rest/v1/profiles?select=id,programme,annee,filiere&limit=5000').catch(() =>
    db('/rest/v1/profiles?select=id,annee,filiere&limit=5000'),
  )) || [];
  return rows.map((r) => ({ id: r.id, codes: cursus.accessCodes(r.programme, r.annee, r.filiere) }));
}

/** Identifiants des étudiants concernés par une annonce visant ces codes de classe. */
function audienceIds(audiences, codes) {
  return audiences.filter((u) => u.codes.some((c) => codes.includes(c))).map((u) => u.id);
}

/** Compare le contenu actuel à celui déjà connu ; notifie les nouveautés. La toute première exécution mémorise sans notifier. */
async function announceNewContent() {
  if (!storageConfigured()) return { skipped: 'stockage' };
  let previous;
  try {
    previous = await loadKv('content_snapshot');
  } catch (error) {
    console.warn('[notifications] table app_kv indisponible (migration à exécuter) :', error.message);
    return { skipped: 'migration' };
  }
  const current = snapshotContent();
  if (!previous) {
    await saveKv('content_snapshot', current);
    return { initialised: true };
  }
  const diff = diffContent(previous, current);
  if (!diff.modules.length && !diff.formations.length) return { added: 0 };
  await saveKv('content_snapshot', current); // enregistré avant l'envoi : jamais deux fois la même annonce
  const audiences = await userAudiences();
  let sent = 0;
  for (const a of announcementsFor(diff)) {
    const result = await notifyUsers(audienceIds(audiences, a.cursus), a);
    sent += result.inbox;
  }
  return { added: diff.modules.length + diff.formations.length, sent };
}

// ---------------------------------------------------------------- Rappels d'inactivité

const REMINDER_AFTER_HOURS = [24, 72, 168, 336]; // 1 j, 3 j, 7 j, 14 j, puis plus rien
const QUIET_FROM_UTC = 20; // 21 h au Bénin : pas de notification la nuit
const QUIET_TO_UTC = 6; // 7 h au Bénin

const REMINDERS = [
  [
    { title: 'Salut, c’est Nimbo ☁️', body: 'Tu m’as oublié ? Reviens faire un petit QCM : 5 minutes suffisent pour garder le rythme.' },
    { title: 'C’est toujours bien de réviser chaque jour 💪', body: 'Même 10 minutes aujourd’hui valent mieux qu’une nuit blanche avant l’examen.' },
    { title: 'Nimbo t’attend 📚', body: 'Une petite révision aujourd’hui ? Ta progression t’attend là où tu l’as laissée.' },
  ],
  [
    { title: 'Ça fait 3 jours… 🥺', body: 'Les notions oubliées reviennent vite avec un petit rappel. Une courte révision pour relancer la machine ?' },
    { title: 'Nimbo s’inquiète ☁️', body: 'Un QCM de 5 minutes suffit pour reprendre. Tu veux bien ?' },
  ],
  [
    { title: 'Une semaine déjà !', body: 'Tes camarades avancent. Reviens faire un tour : un chapitre ou un QCM, et c’est reparti.' },
    { title: 'Tu nous manques sur Akademia', body: 'Reprends doucement : il y a de nouveaux exercices qui t’attendent.' },
  ],
  [
    { title: 'Dernier petit coucou de Nimbo 👋', body: 'Quand tu seras prêt à réviser, on sera là. Ton compte et ta progression sont toujours au chaud.' },
  ],
];

function pickReminder(stage, userId, username) {
  const pool = REMINDERS[Math.min(Math.max(stage, 0), REMINDERS.length - 1)];
  const hash = crypto.createHash('sha1').update(`${userId}:${stage}`).digest().readUInt32BE(0);
  const message = pool[hash % pool.length];
  const name = typeof username === 'string' && username.trim() ? username.trim().slice(0, 24) : null;
  return { title: message.title, body: name ? `${name}, ${message.body.charAt(0).toLowerCase()}${message.body.slice(1)}` : message.body };
}

function inQuietHours(nowMs) {
  const hour = new Date(nowMs).getUTCHours();
  return hour >= QUIET_FROM_UTC || hour < QUIET_TO_UTC;
}

/**
 * Décide si un rappel doit partir. `state` = { stage, lastReminderMs } ; `lastActiveMs` = dernière activité connue.
 * Retourne { send, stage } : stage = étape à enregistrer (remise à 0 si l'utilisateur est revenu).
 */
function reminderDecision({ lastActiveMs, nowMs, state }) {
  let stage = state?.stage ?? 0;
  const lastReminderMs = state?.lastReminderMs ?? 0;
  if (lastActiveMs > lastReminderMs) stage = 0; // il est revenu depuis le dernier rappel : on repart de zéro
  if (stage >= REMINDER_AFTER_HOURS.length) return { send: false, stage };
  const inactiveHours = (nowMs - lastActiveMs) / 3_600_000;
  if (inactiveHours < REMINDER_AFTER_HOURS[stage]) return { send: false, stage };
  if (lastReminderMs && nowMs - lastReminderMs < 20 * 3_600_000) return { send: false, stage };
  return { send: true, stage };
}

async function runInactivityReminders(nowMs = Date.now()) {
  if (!storageConfigured() || !pushService.isConfigured()) return { skipped: 'push' };
  if (inQuietHours(nowMs)) return { skipped: 'nuit' };
  let subs;
  let states;
  let remindState;
  let profiles;
  try {
    [subs, states, remindState, profiles] = await Promise.all([
      db('/rest/v1/push_subscriptions?select=user_id,updated_at&limit=5000'),
      db('/rest/v1/user_state?select=user_id,updated_at&limit=5000'),
      db('/rest/v1/reminder_state?select=user_id,stage,last_reminder_at&limit=5000'),
      db('/rest/v1/profiles?select=id,username&limit=5000'),
    ]);
  } catch (error) {
    console.warn('[notifications] rappels impossibles (migration à exécuter ?) :', error.message);
    return { skipped: 'migration' };
  }
  const lastActive = new Map();
  const bump = (id, at) => {
    const ms = Date.parse(at);
    if (Number.isFinite(ms) && ms > (lastActive.get(id) || 0)) lastActive.set(id, ms);
  };
  (subs || []).forEach((s) => bump(s.user_id, s.updated_at));
  (states || []).forEach((s) => lastActive.has(s.user_id) && bump(s.user_id, s.updated_at));
  const stateById = new Map((remindState || []).map((r) => [r.user_id, { stage: r.stage, lastReminderMs: Date.parse(r.last_reminder_at) || 0 }]));
  const nameById = new Map((profiles || []).map((p) => [p.id, p.username]));
  const subscribed = new Set((subs || []).map((s) => s.user_id));

  const due = [];
  for (const userId of subscribed) {
    const decision = reminderDecision({ lastActiveMs: lastActive.get(userId) || 0, nowMs, state: stateById.get(userId) });
    if (decision.send) due.push({ userId, stage: decision.stage });
  }
  let sent = 0;
  for (let i = 0; i < due.length; i += 20) {
    const chunk = due.slice(i, i + 20);
    await Promise.all(chunk.map(async ({ userId, stage }) => {
      try {
        const message = pickReminder(stage, userId, nameById.get(userId));
        await notifyUsers([userId], { kind: 'reminder', ...message, url: '/', tag: 'reminder' });
        await db('/rest/v1/reminder_state?on_conflict=user_id', {
          method: 'POST',
          headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
          body: JSON.stringify({ user_id: userId, stage: stage + 1, last_reminder_at: new Date(nowMs).toISOString() }),
        });
        sent += 1;
      } catch (error) {
        console.warn('[notifications] rappel échoué :', error.message);
      }
    }));
  }
  return { checked: subscribed.size, sent };
}

async function runScheduledJobs(nowMs = Date.now()) {
  const content = await announceNewContent().catch((e) => ({ error: e.message }));
  const reminders = await runInactivityReminders(nowMs).catch((e) => ({ error: e.message }));
  return { content, reminders };
}

module.exports = {
  announceNewContent,
  announcementsFor,
  audienceIds,
  climbMessage,
  diffContent,
  inQuietHours,
  listForUser,
  markRead,
  notifyClimb,
  notifyOvertaken,
  notifyUsers,
  pickReminder,
  reminderDecision,
  runInactivityReminders,
  runScheduledJobs,
  snapshotContent,
  storageConfigured,
};
