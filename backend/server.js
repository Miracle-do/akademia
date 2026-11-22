const path = require('path');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, './.env') });
dotenv.config({ path: path.resolve(__dirname, '../frontend/.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const contentService = require('./services/contentService');
const progressService = require('./services/progressService');
const progressionService = require('./services/progressionService');
const pushService = require('./services/pushService');
const notificationService = require('./services/notificationService');
const adminService = require('./services/adminService');

const app = express();
const PORT = process.env.PORT || 4000;

// Render place l'application derrière un proxy : sans cela toutes les requêtes auraient la même IP (limites de débit inutiles).
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS : liste blanche via CORS_ORIGINS (domaines séparés par des virgules). Sans variable, l'API reste ouverte (jeton Bearer, pas de cookies).
const allowedOrigins = (process.env.CORS_ORIGINS || '').split(',').map((o) => o.trim().replace(/\/$/, '')).filter(Boolean);
if (!allowedOrigins.length && process.env.NODE_ENV === 'production') {
  console.warn('[securite] CORS_ORIGINS non défini : toutes les origines sont acceptées.');
}
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || !allowedOrigins.length || allowedOrigins.includes(origin.replace(/\/$/, ''))) return callback(null, true);
      return callback(null, false);
    },
  }),
);
app.use(express.json({ limit: '2mb' }));

// Limites de débit (par IP). Réponse 429 en JSON avec l'en-tête Retry-After.
const limiter = (windowMs, limit, message, extra = {}) =>
  rateLimit({ windowMs, limit, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: message }, ...extra });
app.use('/api', limiter(60 * 1000, 300, 'Trop de requêtes, réessayez dans une minute.', { skip: (req) => req.path === '/health' }));
const authLimiter = limiter(15 * 60 * 1000, 20, 'Trop de tentatives, réessayez dans quelques minutes.');
const writeLimiter = limiter(60 * 1000, 60, 'Vous publiez trop vite, patientez un instant.');
app.use((req, _res, next) => {
  progressService.runWithRequestContext(req.headers, next);
});

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'akademia-backend',
    persistenceConfigured: progressService.isConfigured(),
    supabaseConfigured: progressService.isSupabaseConfigured(),
    pushConfigured: pushService.isConfigured(),
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/theme', (req, res) => {
  const filiere = progressionService.normalizeFiliere(req.query.filiere);
  const theme = progressionService.themeForFiliere(filiere);
  res.json({
    filiere,
    theme,
    defaultTheme: progressionService.DEFAULT_THEME,
    filieres: Object.values(progressionService.FILIERES),
  });
});

// ==================== ADMINISTRATION & MONITORING FRONTEND ====================
// Accès réservé : mot de passe ADMIN_PASSWORD (Basic dans le navigateur, ou « Authorization: Bearer <mot de passe> »).
// Sans variable définie, l'administration est désactivée (refus par défaut).
const sha = (v) => crypto.createHash('sha256').update(String(v)).digest();
function requireAdmin(req, res, next) {
  res.set('Cache-Control', 'no-store');
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return res.status(503).json({ error: 'Administration désactivée : définissez ADMIN_PASSWORD sur le serveur.' });
  const header = req.headers.authorization || '';
  let provided = '';
  const basic = header.match(/^Basic\s+(.+)$/i);
  const bearer = header.match(/^Bearer\s+(.+)$/i);
  if (basic) {
    const decoded = Buffer.from(basic[1], 'base64').toString('utf8');
    provided = decoded.slice(decoded.indexOf(':') + 1);
  } else if (bearer) {
    provided = bearer[1];
  }
  if (provided && crypto.timingSafeEqual(sha(provided), sha(secret))) return next();
  return res
    .set('WWW-Authenticate', 'Basic realm="Akademia administration", charset="UTF-8"')
    .status(401)
    .json({ error: 'Accès administrateur requis' });
}
const adminLimiter = limiter(15 * 60 * 1000, 30, 'Trop de tentatives, réessayez plus tard.', { skipSuccessfulRequests: true });

app.get('/api/admin/stats', adminLimiter, requireAdmin, async (_req, res, next) => {
  try {
    const stats = await adminService.getAdminStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

app.get('/admin', adminLimiter, requireAdmin, async (_req, res, next) => {
  try {
    const stats = await adminService.getAdminStats();
    const html = adminService.renderAdminHtml(stats);
    res.type('text/html; charset=utf-8').send(html);
  } catch (error) {
    next(error);
  }
});

// ==================== AUTHENTIFICATION EMAIL / MOT DE PASSE ====================
app.post('/api/auth/signup', authLimiter, async (req, res, next) => {
  try {
    const result = await progressService.signUpUser({
      email: req.body?.email,
      password: req.body?.password,
      username: req.body?.username,
      filiere: req.body?.filiere,
      annee: req.body?.annee,
    });
    res.status(201).json(result);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    return next(error);
  }
});

app.post('/api/auth/signin', authLimiter, async (req, res, next) => {
  try {
    const result = await progressService.signInUser({
      email: req.body?.email,
      password: req.body?.password,
    });
    res.json(result);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    return next(error);
  }
});

app.post('/api/auth/refresh', async (req, res, next) => {
  try {
    const result = await progressService.refreshUserSession(req.body?.refreshToken);
    res.json(result);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    return next(error);
  }
});

app.post('/api/auth/signout', async (req, res, next) => {
  try {
    const match = req.headers.authorization?.match(/^Bearer\s+(.+)$/i);
    if (match) await progressService.signOutUser(match[1]);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/reset-password', authLimiter, async (req, res, next) => {
  try {
    await progressService.resetUserPassword({
      email: req.body?.email,
      newPassword: req.body?.newPassword,
    });
    res.json({ ok: true });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    return next(error);
  }
});

async function requireUser(req, res, next) {
  const match = req.headers.authorization?.match(/^Bearer\s+(.+)$/i);
  if (!match) return res.status(401).json({ error: 'Authentification requise' });
  try {
    const user = await progressService.verifyAccessToken(match[1]);
    if (!user) return res.status(401).json({ error: 'Session invalide ou expirée' });
    req.auth = { user, accessToken: match[1] };
    return next();
  } catch (error) {
    return next(error);
  }
}

// ==================== CONTENU DES MODULES ====================
app.get('/api/modules', (_req, res) => {
  res.json(contentService.getModules());
});

app.get('/api/modules/:moduleId', (req, res) => {
  const module = contentService.getModule(req.params.moduleId);
  if (!module) {
    return res.status(404).json({ error: 'Module introuvable' });
  }
  return res.json(module);
});

app.get('/api/modules/:moduleId/chapters/:chapterFile', (req, res) => {
  const content = contentService.getChapter(req.params.moduleId, req.params.chapterFile);
  if (content === null) {
    return res.status(404).json({ error: 'Chapitre introuvable' });
  }
  return res.type('text/markdown').send(content);
});

app.get('/api/modules/:moduleId/quiz', (req, res) => {
  res.json(contentService.getQuiz(req.params.moduleId));
});

app.get('/api/modules/:moduleId/cards', (req, res) => {
  res.json(contentService.getCards(req.params.moduleId));
});

app.get('/api/modules/:moduleId/formations', (req, res) => {
  res.json(contentService.getFormations(req.params.moduleId));
});

app.get('/api/modules/:moduleId/exams-index', (req, res) => {
  res.json(contentService.getExamIndex(req.params.moduleId));
});

app.get('/api/modules/:moduleId/exams/:examNumber', (req, res) => {
  const exam = contentService.getExam(req.params.moduleId, req.params.examNumber);
  if (!exam) {
    return res.status(404).json({ error: 'Épreuve introuvable' });
  }
  return res.json(exam);
});

// ==================== PROFIL, CLASSEMENT, ACTUALITÉS & PROGRESSION ====================
app.get('/api/me', requireUser, async (req, res, next) => {
  try {
    const [profile, state] = await Promise.all([
      progressService.getProfile(req.auth.accessToken, req.auth.user.id).catch(() => null),
      progressService.loadProgress(req.auth.accessToken, req.auth.user.id).catch(() => null),
    ]);
    const filiere =
      progressionService.normalizeFiliere(
        state?.filiere ?? profile?.filiere ?? req.auth.user.filiere,
      ) || 'ARI';
    const theme = progressionService.themeForFiliere(filiere);
    const username =
      profile?.username ||
      req.auth.user.username ||
      req.auth.user.user_metadata?.username ||
      (req.auth.user.email ? req.auth.user.email.split('@')[0] : 'Étudiant');

    if (!state) {
      const initialState = {
        ...progressionService.defaultState(),
        filiere,
        theme,
      };
      await progressService
        .saveProgress(req.auth.accessToken, req.auth.user.id, initialState)
        .catch(() => {});
    }

    res.json({
      id: req.auth.user.id,
      email: profile?.email || req.auth.user.email,
      username,
      filiere,
      annee: progressionService.normalizeAnnee(profile?.annee ?? req.auth.user.annee),
      theme,
    });
  } catch (error) {
    next(error);
  }
});

app.patch('/api/me', requireUser, async (req, res, next) => {
  try {
    const updated = await progressService.updateProfile(req.auth.accessToken, req.auth.user.id, {
      username: req.body?.username,
      filiere: req.body?.filiere,
      annee: req.body?.annee,
    });
    res.json(updated);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    return next(error);
  }
});

app.get('/api/leaderboard', requireUser, async (req, res, next) => {
  try {
    res.json(
      await progressService.getLeaderboard(req.auth.accessToken, req.query.limit, req.query.annee),
    );
  } catch (error) {
    next(error);
  }
});

app.get('/api/battle', async (req, res, next) => {
  try {
    res.json(await progressService.getBattleData(new Date(), req.query.annee));
  } catch (error) {
    next(error);
  }
});

app.get('/api/push/config', (_req, res) => {
  res.json({
    enabled: pushService.isConfigured(),
    publicKey: pushService.isConfigured() ? pushService.vapidPublicKey : null,
  });
});

app.post('/api/push/subscriptions', requireUser, async (req, res, next) => {
  try {
    await pushService.saveSubscription(req.auth.user.id, req.body?.subscription);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/push/subscriptions', requireUser, async (req, res, next) => {
  try {
    await pushService.removeSubscription(req.auth.user.id, req.body?.endpoint);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.get('/api/notifications', requireUser, async (req, res, next) => {
  try {
    res.json(await notificationService.listForUser(req.auth.user.id, req.query.limit));
  } catch (error) {
    // Table absente (migration non exécutée) : la boîte reste simplement vide.
    if (error.status === 404 || error.status === 400) return res.json({ items: [], unread: 0 });
    return next(error);
  }
});

app.post('/api/notifications/read', requireUser, writeLimiter, async (req, res, next) => {
  try {
    await notificationService.markRead(req.auth.user.id, req.body?.ids);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

// Déclenché toutes les heures par un planificateur externe (voir .github/workflows/rappels.yml).
app.post('/api/cron/tick', async (req, res, next) => {
  const secret = process.env.CRON_SECRET;
  if (!secret) return res.status(503).json({ error: 'CRON_SECRET non configuré.' });
  const given = Buffer.from(String(req.headers['x-cron-secret'] || ''));
  const expected = Buffer.from(secret);
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) {
    return res.status(401).json({ error: 'Non autorisé.' });
  }
  try {
    res.json(await notificationService.runScheduledJobs());
  } catch (error) {
    next(error);
  }
});

app.post('/api/messages', requireUser, writeLimiter, async (req, res, next) => {
  const recipientId = req.body?.recipientId;
  const body = typeof req.body?.body === 'string' ? req.body.body.trim() : '';
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      recipientId || '',
    ) ||
    recipientId === req.auth.user.id ||
    !body ||
    body.length > 2000
  ) {
    return res.status(400).json({ error: 'Destinataire ou message invalide.' });
  }
  try {
    const message = await progressService.insertMessage(
      req.auth.accessToken,
      req.auth.user.id,
      recipientId,
      body,
    );
    if (!message) return res.status(502).json({ error: 'Le message n’a pas pu être enregistré.' });
    res.status(201).json(message);
    void (async () => {
      try {
        const sender = await progressService.getProfile(req.auth.accessToken, req.auth.user.id);
        await pushService.notifyMessage(
          recipientId,
          req.auth.user.id,
          sender?.username || 'Un joueur',
          message.body,
        );
      } catch (error) {
        console.error('Push message failed:', error.message || error);
      }
    })();
  } catch (error) {
    next(error);
  }
});

app.delete('/api/messages/conversations/:partnerId', requireUser, async (req, res, next) => {
  const { partnerId } = req.params;
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      partnerId,
    ) ||
    partnerId === req.auth.user.id
  ) {
    return res.status(400).json({ error: 'Discussion invalide.' });
  }
  try {
    const deleted = await progressService.deleteConversationForParticipants(
      req.auth.accessToken,
      req.auth.user.id,
      partnerId,
    );
    res.json({ ok: true, deleted });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/messages/:messageId', requireUser, async (req, res, next) => {
  const { messageId } = req.params;
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      messageId,
    )
  ) {
    return res.status(400).json({ error: 'Message invalide.' });
  }
  try {
    const deleted = await progressService.deleteMessageForParticipants(
      req.auth.accessToken,
      req.auth.user.id,
      messageId,
    );
    if (!deleted) return res.status(404).json({ error: 'Message introuvable ou accès refusé.' });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.get('/api/feed', requireUser, async (req, res, next) => {
  try {
    res.json(await progressService.getFeed(req.auth.user.id));
  } catch (error) {
    next(error);
  }
});

app.post('/api/feed/:postId/like', requireUser, writeLimiter, async (req, res, next) => {
  try {
    res.json(await progressService.togglePostLike(req.auth.user.id, req.params.postId));
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    return next(error);
  }
});

app.post('/api/feed/:postId/comments', requireUser, writeLimiter, async (req, res, next) => {
  try {
    res
      .status(201)
      .json(await progressService.addPostComment(req.auth.user.id, req.params.postId, req.body?.text));
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    return next(error);
  }
});

app.post('/api/battle/vote', requireUser, async (req, res, next) => {
  try {
    res.json(await progressService.voteBattle(req.auth.user.id, req.body?.camp));
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    return next(error);
  }
});

app.get('/api/progress', requireUser, async (req, res, next) => {
  try {
    const [loaded, profile] = await Promise.all([
      progressService.loadProgress(req.auth.accessToken, req.auth.user.id),
      progressService.getProfile(req.auth.accessToken, req.auth.user.id).catch(() => null),
    ]);
    const baseState = loaded || progressionService.defaultState();
    const filiere =
      progressionService.normalizeFiliere(
        baseState.filiere ?? profile?.filiere ?? req.auth.user.filiere,
      ) || 'ARI';
    const state = {
      ...baseState,
      filiere,
      theme: progressionService.themeForFiliere(filiere),
    };
    if (!loaded) {
      await progressService
        .saveProgress(req.auth.accessToken, req.auth.user.id, state)
        .catch(() => {});
    }
    res.json({ state, filiere: state.filiere, theme: state.theme });
  } catch (error) {
    next(error);
  }
});

app.post('/api/progress/actions', requireUser, async (req, res, next) => {
  try {
    const rawActionId = req.body?.actionId;
    if (
      rawActionId !== undefined &&
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        String(rawActionId),
      )
    ) {
      return res.status(400).json({ error: 'Identifiant d’action invalide.' });
    }
    const actionId = rawActionId || crypto.randomUUID();
    if (rawActionId) {
      const previousResult = await progressService.getActionReceipt(
        req.auth.accessToken,
        req.auth.user.id,
        actionId,
      );
      if (previousResult) return res.json(previousResult);
    }

    let leaderboardBefore = null;
    if (notificationService.storageConfigured()) {
      try {
        // « Dépassé » s'entend dans le classement de sa propre année.
        leaderboardBefore = await progressService.getLeaderboard(
          req.auth.accessToken,
          1000,
          req.auth.user.annee,
        );
      } catch {
        /* les notifications ne bloquent pas la progression */
      }
    }
    const current = await progressService.loadProgress(req.auth.accessToken, req.auth.user.id);
    const action = req.body?.action || req.body;
    const result = progressionService.applyAction(
      current || progressionService.defaultState(),
      action,
      contentService,
    );
    const savedState = await progressService.saveProgress(
      req.auth.accessToken,
      req.auth.user.id,
      result.state,
    );
    const finalResult = {
      ...result,
      state: savedState,
      filiere: savedState.filiere,
      theme: savedState.theme,
    };
    await progressService.saveActionReceipt(
      req.auth.accessToken,
      req.auth.user.id,
      actionId,
      finalResult,
    );
    res.json(finalResult);
    if (leaderboardBefore) {
      void (async () => {
        try {
          const leaderboardAfter = await progressService.getLeaderboard(
            req.auth.accessToken,
            1000,
            req.auth.user.annee,
          );
          const overtaken = progressService.overtakenPlayerIds(
            leaderboardBefore,
            leaderboardAfter,
            req.auth.user.id,
          );
          const oldRank = leaderboardBefore.findIndex((p) => p.id === req.auth.user.id);
          const newRank = leaderboardAfter.findIndex((p) => p.id === req.auth.user.id);
          await notificationService.notifyClimb(req.auth.user.id, oldRank, newRank);
          if (overtaken.length) {
            const profile = await progressService.getProfile(
              req.auth.accessToken,
              req.auth.user.id,
            );
            await notificationService.notifyOvertaken(overtaken, profile?.username || 'Un joueur');
          }
        } catch (error) {
          console.error('Push ranking failed:', error.message || error);
        }
      })();
    }
  } catch (error) {
    if (error.status) return next(error);
    return res.status(400).json({ error: error.message || 'Action invalide' });
  }
});

app.post('/api/progress/import', requireUser, async (req, res, next) => {
  try {
    const current = await progressService.loadProgress(req.auth.accessToken, req.auth.user.id);
    const isFresh =
      !current ||
      (current.xp === 0 &&
        (!Array.isArray(current.attempts) || current.attempts.length === 0) &&
        Object.keys(current.chaptersRead || {}).length === 0);
    if (!isFresh) return res.status(409).json({ error: 'Une progression existe déjà.' });
    const state = progressionService.importLegacyState(req.body?.state, contentService);
    const saved = await progressService.saveProgress(req.auth.accessToken, req.auth.user.id, state);
    return res.json({ state: saved });
  } catch (error) {
    return next(error);
  }
});

app.post('/api/progress/sync', requireUser, async (req, res, next) => {
  try {
    if (!req.body?.state || typeof req.body.state !== 'object') {
      return res.status(400).json({ error: 'État de progression invalide.' });
    }
    const current = await progressService.loadProgress(req.auth.accessToken, req.auth.user.id);
    const incoming = progressionService.normalizeState(req.body.state);
    const currentXp = Number(current?.xp) || 0;
    const incomingXp = Math.max(0, Math.min(500000, Number(incoming.xp) || 0));
    if (current && currentXp > incomingXp) {
      return res.json({ state: current });
    }
    incoming.xp = incomingXp;
    const saved = await progressService.saveProgress(
      req.auth.accessToken,
      req.auth.user.id,
      incoming,
    );
    return res.json({ state: saved });
  } catch (error) {
    return next(error);
  }
});

async function handleResetProgress(req, res, next) {
  try {
    const current = await progressService.loadProgress(req.auth.accessToken, req.auth.user.id);
    const filiere = progressionService.normalizeFiliere(current?.filiere) || 'ARI';
    const state = {
      ...progressionService.defaultState(),
      filiere,
      theme: progressionService.themeForFiliere(filiere),
    };
    const saved = await progressService.saveProgress(req.auth.accessToken, req.auth.user.id, state);
    res.json({ ok: true, state: saved });
  } catch (error) {
    next(error);
  }
}

app.delete('/api/progress', requireUser, handleResetProgress);
app.post('/api/progress/reset', requireUser, handleResetProgress);

app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Corps de requête JSON invalide' });
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Requête trop volumineuse' });
  console.error(err.message || err);
  res
    .status(err.status || 500)
    .json({ error: err.status === 503 ? err.message : 'Erreur serveur interne' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Akademia backend listening on http://localhost:${PORT}`);
    // À chaque démarrage (donc après chaque déploiement) : annonce les modules et formations ajoutés.
    void notificationService
      .announceNewContent()
      .then((r) => console.log('[notifications] nouveautés :', JSON.stringify(r)))
      .catch((e) => console.warn('[notifications] nouveautés impossibles :', e.message));
  });
}

module.exports = app;
