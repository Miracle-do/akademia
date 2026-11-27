import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { HoodedFigure } from '@/components/quest/HoodedFigure';
import { sub } from '@/components/quest/rich';
import '@/components/quest/quest.css';
import { getModule, loadQuests } from '@/lib/content';
import { levelFromXp } from '@/lib/gamification';
import type { Quest } from '@/lib/types';
import { useAuth } from '@/state/AuthContext';
import { useStore } from '@/state/Store';

const COLORS = ['#00e5ff', '#b6ff3b', '#ff2e93', '#ffd60a'];

/** Carte des missions d'un module, dans l'univers néon du prototype. */
export default function QuestMapPage() {
  const { moduleId } = useParams();
  const m = getModule(moduleId);
  const { user } = useAuth();
  const { state } = useStore();
  const [quests, setQuests] = useState<Quest[] | null>(null);
  useEffect(() => {
    if (!moduleId) return;
    let alive = true;
    loadQuests(moduleId).then((x) => alive && setQuests(x)).catch(() => alive && setQuests([]));
    return () => { alive = false; };
  }, [moduleId]);

  if (!m) return <Navigate to="/modules" replace />;
  if (quests && quests.length === 0) return <Navigate to={`/m/${m.id}`} replace />;
  const name = user?.username ?? 'Agent';
  const done = new Set(state.quests?.[m.id] ?? []);
  const message = !quests ? 'Connexion…' : done.size === 0
    ? sub('Salut {user}. Choisis une mission quand tu es prêt(e) : je te briefe, puis tu travailles dans la vraie console.', name)
    : done.size >= quests.length
      ? sub('Tout est fait, {user}. Rien ne t’empêche de rejouer une mission pour t’entraîner.', name)
      : sub(`Content de te revoir, {user}. ${done.size} mission${done.size > 1 ? 's' : ''} sur ${quests.length} accomplie${done.size > 1 ? 's' : ''}.`, name);

  return (
    <div className="qx-root">
      <div className="qx-wrap">
        <header className="qx-hud">
          <h1 className="qx-title">Missions</h1>
          <span style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="qx-pill">Niv. {levelFromXp(state.xp)} · {state.xp} XP</span>
            <Link className="qx-pill" to={`/m/${m.id}`} style={{ textDecoration: 'none' }}>Retour au module</Link>
          </span>
        </header>
        <div className="qx-stage">
          <HoodedFigure size={110} />
          <div className="qx-bub" aria-live="polite">{message}</div>
        </div>
        <p className="qx-kb" style={{ margin: '0 0 4px' }}>{m.title} · {m.level}</p>
        <nav className="qx-map" aria-label="Liste des missions">
          {(quests ?? []).map((q, i) => (
            <Link key={q.id} to={`/m/${m.id}/quetes/${q.id}`} className={`qx-node ${done.has(q.id) ? 'done' : ''}`} style={{ ['--c' as string]: COLORS[i % COLORS.length] }}>
              <span className="n">{String(q.order ?? i + 1).padStart(2, '0')}</span>
              <span style={{ flex: 1 }}>
                <b>{q.title}</b>
                <small>{q.level} · {q.minutes} min · {q.steps.length} étapes</small>
              </span>
              <span className={`qx-tag ${done.has(q.id) ? '' : q.priority === 'Critique' ? 'hot' : q.priority === 'Haute' ? 'mid' : ''}`}>
                {done.has(q.id) ? 'Accomplie' : `Risque ${q.priority.toLowerCase()}`}
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
