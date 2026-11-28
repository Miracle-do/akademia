import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadQuests } from '@/lib/content';
import type { Quest } from '@/lib/types';
import { useAuth } from '@/state/AuthContext';
import { useStore } from '@/state/Store';
import { HoodedFigure } from './HoodedFigure';
import { sub } from './rich';
import './quest.css';

/**
 * Apparition du contact : de temps en temps, sur la page d'un module qui a des missions, un inconnu en capuche surgit
 * dans un coin de l'écran. Un clic ouvre la conversation ; il peut être ignoré (il ne revient pas avant la prochaine session).
 */
export function QuestEncounter({ moduleId }: { moduleId: string }) {
  const nav = useNavigate();
  const { user } = useAuth();
  const { state } = useStore();
  const [quest, setQuest] = useState<Quest | null>(null);
  const [show, setShow] = useState(false);
  const dismissKey = `akademia:quest:ignored:${moduleId}`;
  const doneCount = state.quests?.[moduleId]?.length ?? 0;

  useEffect(() => {
    let alive = true;
    loadQuests(moduleId)
      .then((list) => {
        if (!alive) return;
        const done = new Set(state.quests?.[moduleId] ?? []);
        setQuest(list.find((q) => !done.has(q.id)) ?? null);
      })
      .catch(() => undefined);
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId]);

  useEffect(() => {
    if (!quest) return;
    try { if (sessionStorage.getItem(dismissKey)) return; } catch { /* stockage indisponible */ }
    // Toujours pour une première rencontre ; ensuite, seulement parfois.
    if (doneCount > 0 && Math.random() > 0.4) return;
    const t = window.setTimeout(() => setShow(true), doneCount === 0 ? 5000 : 12000);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quest?.id]);

  if (!show || !quest) return null;
  const open = () => nav(`/m/${moduleId}/quetes/${quest.id}`);
  const ignore = () => {
    try { sessionStorage.setItem(dismissKey, '1'); } catch { /* ignoré */ }
    setShow(false);
  };
  return (
    <aside className="qx-enc" aria-label="Message d’un contact inconnu">
      <div className="wrap">
        <button type="button" className="bub" onClick={open}>
          <b>CONTACT INCONNU</b>
          <span>{sub(quest.teaser, user?.username ?? '')}</span>
          <em>Touche pour répondre</em>
        </button>
        <button type="button" className="x" onClick={ignore} aria-label="Ignorer ce message">×</button>
      </div>
      <HoodedFigure size={96} talk />
    </aside>
  );
}
