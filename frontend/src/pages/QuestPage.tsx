import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Check, Cross as X } from '@getpapillon/papicons';
import { fireConfetti } from '@/components/Celebrations';
import { HoodedFigure } from '@/components/quest/HoodedFigure';
import { SqlConsole } from '@/components/quest/SqlConsole';
import type { LogEntry } from '@/components/quest/SqlConsole';
import { rich, sub } from '@/components/quest/rich';
import '@/components/quest/quest.css';
import { cue, isMuted, setMuted, startAmbience, stopAmbience } from '@/lib/ambience';
import { getModule, loadQuests } from '@/lib/content';
import { levelFromXp } from '@/lib/gamification';
import type { OracleSession, StmtResult } from '@/lib/oracleSession';
import { checkPlsqlStep, checkSqlStep } from '@/lib/questChecks';
import type { StepVerdict } from '@/lib/questChecks';
import { newSession } from '@/lib/sqlRuntime';
import type { Quest, QuestStep, Summary } from '@/lib/types';
import { useAuth } from '@/state/AuthContext';
import { useStore } from '@/state/Store';

interface Saved { accepted: boolean; step: number; history: string[]; code: Record<string, string> }
const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const START = ['Concentre-toi. Chaque commande compte.', 'Rien n’est chronométré, mais ils nous cherchent.', 'Lis bien la consigne avant de taper quoi que ce soit.'];
const GOOD = ['Propre. Aucune trace.', 'Exactement ce qu’il fallait.', 'Bien joué. On avance.'];
const BAD = ['Ce n’est pas ça. Regarde les critères qui échouent.', 'Mauvaise piste. Relis la consigne.', 'Attention, ils se rapprochent.'];
const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Texte qui s'écrit lettre par lettre, comme dans le prototype. */
function useTyped(text: string) {
  const [n, setN] = useState(0);
  const skipped = useRef(false);
  useEffect(() => {
    skipped.current = false;
    if (reduced()) { setN(text.length); return; }
    setN(0);
    let i = 0;
    const t = window.setInterval(() => {
      if (skipped.current) { window.clearInterval(t); return; }
      i += 1;
      setN(i);
      if (i >= text.length) window.clearInterval(t);
    }, 18);
    return () => window.clearInterval(t);
  }, [text]);
  return { shown: text.slice(0, n), typing: n < text.length, skip: () => { skipped.current = true; setN(text.length); } };
}

/** Une clé par mission : changer de mission repart d'un état vierge (session SQL, journal, étape). */
export default function QuestPage() {
  const { questId } = useParams();
  return <QuestRunner key={questId} />;
}

function QuestRunner() {
  const { moduleId, questId } = useParams();
  const m = getModule(moduleId);
  const nav = useNavigate();
  const { user } = useAuth();
  const { state, finishQuest } = useStore();
  const name = user?.username ?? 'Agent';

  const [quests, setQuests] = useState<Quest[] | null>(null);
  const quest = quests?.find((q) => q.id === questId);
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState<'intro' | 'brief' | 'mission' | 'done'>('intro');
  const [di, setDi] = useState(0);
  const [tense, setTense] = useState(false);
  const [flash, setFlash] = useState(false);
  const [muted, setMute] = useState(isMuted());
  const [bubble, setBubble] = useState('');
  const [stepIdx, setStepIdx] = useState(0);
  const [stepDone, setStepDone] = useState(false);
  const [alert, setAlert] = useState(0);
  const [traced, setTraced] = useState(false);
  const [verdict, setVerdict] = useState<StepVerdict | null>(null);
  const [fails, setFails] = useState(0);
  const [hints, setHints] = useState(0);
  const [refOpen, setRefOpen] = useState(false);
  const [picked, setPicked] = useState<number[]>([]);
  const [code, setCode] = useState<Record<string, string>>({});
  const [log, setLog] = useState<LogEntry[]>([]);
  const [cmds, setCmds] = useState<string[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [, tick] = useState(0);

  const session = useRef<OracleSession | null>(null);
  const baseline = useRef(0);
  const results = useRef<StmtResult[]>([]);
  const nid = useRef(1);
  const audioOn = useRef(false);
  const storeKey = `akademia:quest:${user?.id ?? 'anon'}:${moduleId}:${questId}`;
  const already = !!quest && !!state.quests?.[quest.moduleId]?.includes(quest.id);
  const line = phase === 'intro' && quest ? sub(quest.dialogue[di] ?? '', name) : bubble;
  const { shown, typing, skip } = useTyped(line);

  const save = useCallback((patch: Partial<Saved>) => {
    try {
      const cur = JSON.parse(localStorage.getItem(storeKey) ?? 'null') as Saved | null;
      localStorage.setItem(storeKey, JSON.stringify({ accepted: true, step: 0, history: [], code: {}, ...cur, ...patch }));
    } catch { /* stockage indisponible */ }
  }, [storeKey]);

  useEffect(() => {
    if (!moduleId) return;
    let alive = true;
    loadQuests(moduleId).then((x) => alive && setQuests(x)).catch(() => alive && setQuests([]));
    return () => { alive = false; };
  }, [moduleId]);

  // Environnement de départ : on construit la base de la mission, puis on rejoue ce que l'étudiant avait déjà fait.
  useEffect(() => {
    if (!quest) return;
    let alive = true;
    (async () => {
      let saved: Saved | null = null;
      try { saved = JSON.parse(localStorage.getItem(storeKey) ?? 'null') as Saved | null; } catch { /* ignoré */ }
      if (quest.steps.some((s) => s.kind === 'sql')) {
        const s = await newSession();
        for (const stmt of [...(quest.setup ?? []), ...(quest.setupPending ?? [])]) s.run(stmt);
        baseline.current = s.history.length;
        if (saved?.accepted) for (const h of saved.history) s.run(h);
        if (!alive) { s.close(); return; }
        session.current = s;
      }
      if (!alive) return;
      if (saved?.accepted && saved.step < quest.steps.length) {
        setCode(saved.code ?? {});
        setStepIdx(saved.step);
        setCmds(saved.history ?? []);
        setTense(true);
        setPhase('mission');
        setBubble(`Content de te revoir, ${name}. Reprenons à l’étape ${saved.step + 1}.`);
      }
      setReady(true);
    })();
    return () => { alive = false; session.current?.close(); session.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quest?.id]);

  // Ambiance : sonore (après un geste) et couleur de la barre du navigateur sur mobile.
  useEffect(() => {
    if (!tense) return;
    const meta = document.querySelector('meta[name="theme-color"]');
    const prev = meta?.getAttribute('content') ?? null;
    meta?.setAttribute('content', '#05020f');
    const start = () => { if (!audioOn.current) { audioOn.current = true; startAmbience(); } };
    window.addEventListener('pointerdown', start, { once: true });
    return () => { window.removeEventListener('pointerdown', start); if (prev) meta?.setAttribute('content', prev); };
  }, [tense]);
  useEffect(() => () => { audioOn.current = false; stopAmbience(); }, []);

  const step: QuestStep | undefined = quest?.steps[stepIdx];
  const say = (t: string) => setBubble(t);

  const beginStep = (i: number, first = false) => {
    results.current = [];
    setStepIdx(i); setStepDone(false); setVerdict(null); setFails(0); setHints(0); setPicked([]); setRefOpen(false); setAlert((a) => (first ? 0 : a));
    const s = quest!.steps[i];
    say(`Étape ${i + 1} sur ${quest!.steps.length} : ${s.title}. ${pick(START)}`);
    if (!first) setLog((l) => [...l, { id: nid.current++, kind: 'sys', text: `-- Étape ${i + 1} : ${s.title}` }]);
  };

  const accept = () => {
    setFlash(true);
    window.setTimeout(() => setFlash(false), 1400);
    audioOn.current = true;
    startAmbience();
    window.setTimeout(() => { setTense(true); setPhase('brief'); say(sub('Voilà le dossier, {user}. Lis-le jusqu’au bout avant d’ouvrir la session.', name)); }, 500);
    save({ accepted: true, step: 0 });
  };

  const execute = (script: string) => {
    const s = session.current;
    if (!s) return;
    const res = s.run(script);
    results.current.push(...res);
    const entries: LogEntry[] = [{ id: nid.current++, kind: 'cmd', text: script.trim() }];
    for (const r of res) {
      if (r.kind === 'select' && r.ok) entries.push({ id: nid.current++, kind: 'table', columns: r.columns, rows: r.rows, text: r.text });
      else if (!r.ok) entries.push({ id: nid.current++, kind: 'error', text: r.text });
      else if (r.text) entries.push({ id: nid.current++, kind: 'text', text: r.text });
    }
    setLog((l) => [...l, ...entries]);
    setCmds((c) => [...c, script.trim()]);
    cue(res.some((r) => !r.ok) ? 'ko' : 'type');
    save({ history: s.history.slice(baseline.current) });
    tick((n) => n + 1);
  };

  const solved = (v: StepVerdict) => {
    setVerdict(v); setStepDone(true); setAlert((a) => Math.max(0, a - 20)); cue('ok'); say(pick(GOOD));
    save({ step: stepIdx + 1, code, history: session.current?.history.slice(baseline.current) ?? [] });
  };
  const failed = (v: StepVerdict | null) => {
    setVerdict(v); setFails((f) => f + 1); cue('ko'); say(pick(BAD));
    const n = Math.min(100, alert + 20);
    setAlert(n);
    if (n >= 100) setTraced(true);
  };

  const validate = () => {
    if (!step || stepDone) return;
    if (step.kind === 'sql' && session.current) {
      const v = checkSqlStep(session.current, step, { results: results.current });
      v.pass ? solved(v) : failed(v);
    } else if (step.kind === 'plsql') {
      const v = checkPlsqlStep(step, code[step.id] ?? step.template ?? '');
      v.pass ? solved(v) : failed(v);
    }
  };

  const answer = (i: number) => {
    if (!step || step.kind !== 'choice' || stepDone || picked.includes(i)) return;
    if (i === step.answer) { setPicked((p) => [...p, i]); solved({ pass: true, items: [] }); }
    else { setPicked((p) => [...p, i]); failed(null); }
  };

  const next = async () => {
    if (!quest) return;
    if (stepIdx + 1 < quest.steps.length) { beginStep(stepIdx + 1); return; }
    setPhase('done'); setTense(false); audioOn.current = false; stopAmbience();
    say(sub(quest.outro, name));
    fireConfetti(true);
    try { localStorage.removeItem(storeKey); } catch { /* ignoré */ }
    try { setSummary(await finishQuest(quest, quests?.length ?? 1)); } catch { setSummary(null); }
  };

  if (!m) return <Navigate to="/modules" replace />;
  if (quests && !quest) return <Navigate to={`/m/${m.id}/quetes`} replace />;
  if (!quest || !ready) {
    return (
      <div className="qx-root"><div className="qx-wrap"><p className="qx-kb" role="status">Établissement de la connexion sécurisée…</p></div></div>
    );
  }

  const order = String(quest.order ?? quests!.indexOf(quest) + 1).padStart(2, '0');
  const nextQuest = quests!.find((q) => (q.order ?? 99) > (quest.order ?? 0) && !state.quests?.[q.moduleId]?.includes(q.id));
  const mapPath = `/m/${m.id}/quetes`;
  const hot = quest.priority === 'Critique' ? 'hot' : quest.priority === 'Haute' ? 'mid' : '';

  return (
    <div className={`qx-root ${tense ? 'qx-tense' : ''}`} role="dialog" aria-label={`Mission : ${quest.title}`}>
      {flash && <div className="qx-flash" aria-hidden="true" />}
      <div className="qx-wrap">
        <header className="qx-hud">
          <h1 className="qx-title">{phase === 'intro' ? 'Appel entrant' : `Mission ${order}`}</h1>
          <span style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {tense && <button type="button" className="qx-pill" onClick={() => { setMuted(!muted); setMute(!muted); }} aria-pressed={muted}>{muted ? 'Son coupé' : 'Son activé'}</button>}
            <span className="qx-pill">Niv. {levelFromXp(state.xp)} · {state.xp} XP</span>
            <button type="button" className="qx-pill" onClick={() => nav(mapPath)}>Quitter</button>
          </span>
        </header>

        {phase !== 'intro' && (
          <div className="qx-alert">
            <span>{alert >= 70 ? 'Alerte' : 'Discrétion'}</span>
            <div className="qx-bar" role="progressbar" aria-label="Niveau d’alerte" aria-valuenow={alert} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${alert}%` }} /></div>
          </div>
        )}

        <div className="qx-stage">
          <HoodedFigure size={phase === 'intro' ? 150 : 84} talk={typing} />
          <div className="qx-bub" aria-live="polite" onClick={skip}>{shown}</div>
        </div>

        {phase === 'intro' && (
          <div className="qx-nav" style={{ marginTop: 8 }}>
            {di < quest.dialogue.length - 1 ? (
              <button type="button" className="qx-b" onClick={() => { if (typing) skip(); else setDi(di + 1); }}>Suivant</button>
            ) : (
              <>
                <button type="button" className="qx-b hot" onClick={accept}>J’accepte la mission</button>
                <button type="button" className="qx-b g" onClick={() => nav(mapPath)}>Pas maintenant</button>
              </>
            )}
          </div>
        )}

        {phase === 'brief' && (
          <>
            <div className="qx-card">
              <h2>{quest.title}</h2>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '6px 0' }}>
                <span className="qx-tag">{quest.level}</span>
                <span className={`qx-tag ${hot}`}>Risque : {quest.priority}</span>
                <span className="qx-tag">{quest.minutes} min</span>
                <span className="qx-tag">{quest.client}</span>
              </div>
              {quest.context.map((p, i) => <p key={i}>{rich(p, name)}</p>)}
              <h3>Objectifs</h3>
              <ul>{quest.objectives.map((o, i) => <li key={i}>{o}</li>)}</ul>
              {quest.chapters && quest.chapters.length > 0 && (
                <p className="qx-kb">Cours à connaître : {quest.chapters.map((c) => m.chapters.find((x) => x.id === c)).filter(Boolean).map((c) => `${c!.number} ${c!.title}`).join(' · ')}</p>
              )}
            </div>
            <div className="qx-nav">
              <button type="button" className="qx-b" onClick={() => { setPhase('mission'); beginStep(0, true); }}>Ouvrir la session</button>
            </div>
          </>
        )}

        {phase === 'mission' && step && (
          <>
            <div className="qx-card">
              <div className="qx-tools">
                <button type="button" className="qx-b g" onClick={() => setRefOpen((o) => !o)} aria-expanded={refOpen}>Aide-mémoire</button>
                <button type="button" className="qx-b g" disabled={!step.hints?.length || hints >= (step.hints?.length ?? 0)} onClick={() => setHints((h) => h + 1)}>Indice</button>
              </div>
              <h2>{step.title}</h2>
              <div className="qx-kb">Étape {stepIdx + 1}/{quest.steps.length}{already ? ' · mission déjà accomplie' : ''}</div>
              {step.hints?.slice(0, hints).map((h, i) => <p key={i} className="qx-kb" style={{ clear: 'both' }}>Indice {i + 1} : {h}</p>)}
              {refOpen && (
                <div style={{ clear: 'both', borderTop: '1px dashed var(--a)', marginTop: 8, paddingTop: 6 }}>
                  {quest.reference?.map((r, i) => (<div key={i}><h3>{r.title}</h3><pre className="qx-pre">{r.sql}</pre></div>))}
                  {quest.chapters?.map((c) => m.chapters.find((x) => x.id === c)).filter(Boolean).map((c) => (
                    <p key={c!.id} className="qx-kb"><a href={`/m/${m.id}/lire/${c!.id}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--a)' }}>Relire le chapitre {c!.number} : {c!.title}</a></p>
                  ))}
                </div>
              )}
            </div>
            <div className="qx-pips">{quest.steps.map((s, k) => <i key={s.id} className={k < stepIdx || (k === stepIdx && stepDone) ? 'on' : k === stepIdx ? 'cur' : ''} />)}</div>
            <div className="qx-card qx-mission">{rich(step.task, name)}</div>

            {step.kind === 'sql' && session.current && (
              <SqlConsole session={session.current} user={name} log={log} history={cmds} onExecute={execute} disabled={stepDone || traced} />
            )}
            {step.kind === 'plsql' && (
              <textarea
                className="qx-ed"
                value={code[step.id] ?? step.template ?? ''}
                onChange={(e) => setCode((c) => ({ ...c, [step.id]: e.target.value }))}
                disabled={stepDone || traced}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                aria-label="Éditeur PL/SQL"
              />
            )}
            {step.kind === 'choice' && step.options.map((o, i) => (
              <button
                key={i}
                type="button"
                className={`qx-opt ${stepDone && i === step.answer ? 'ok' : picked.includes(i) ? 'ko' : ''}`}
                disabled={stepDone || picked.includes(i) || traced}
                onClick={() => answer(i)}
              >{o}</button>
            ))}

            {verdict && verdict.items.length > 0 && (
              <div className="qx-card" aria-live="polite">
                <h3>{step.kind === 'plsql' ? 'Revue de code' : 'Critères de validation'} : {verdict.items.filter((i) => i.ok).length}/{verdict.items.length}</h3>
                <ul className="qx-crit">
                  {verdict.items.map((it, i) => (
                    <li key={i} className={it.ok ? 'ok' : 'ko'}><span className="ic">{it.ok ? <Check size={13} /> : <X size={13} />}</span><span>{it.label}</span></li>
                  ))}
                </ul>
              </div>
            )}

            {fails >= 2 && !stepDone && step.kind !== 'choice' && (
              <div className="qx-card"><h3>Solution de référence</h3><pre className="qx-pre">{step.solution}</pre></div>
            )}

            {stepDone && (
              <div className="qx-card qx-fb">
                <h3>Étape réussie</h3>
                <p>{step.explain}</p>
              </div>
            )}

            <div className="qx-nav">
              {!stepDone && step.kind !== 'choice' && <button type="button" className="qx-b" onClick={validate} disabled={traced}>{step.kind === 'plsql' ? 'Soumettre à la revue' : 'Valider l’étape'}</button>}
              {stepDone && <button type="button" className="qx-b" onClick={next}>{stepIdx + 1 < quest.steps.length ? 'Étape suivante' : 'Terminer la mission'}</button>}
            </div>
          </>
        )}

        {phase === 'done' && (
          <>
            <div className="qx-card qx-fb">
              <h2>Mission accomplie</h2>
              <p className="qx-kb">{quest.title}</p>
              <h3>Ce qu’il faut retenir</h3>
              <ul>{quest.debrief.map((d, i) => <li key={i}>{d}</li>)}</ul>
              {summary ? (
                <>
                  <h3>Récompense</h3>
                  <ul>{summary.lines.map((l, i) => <li key={i}>{l.label} : +{l.xp} XP</li>)}</ul>
                  {summary.levelUp && <p><strong>Nouveau niveau : {summary.newLevel}</strong></p>}
                </>
              ) : (<p className="qx-kb">Mission déjà accomplie : pas de nouvelle récompense, mais l’entraînement compte.</p>)}
            </div>
            <div className="qx-nav">
              {nextQuest && <Link className="qx-b" to={`${mapPath}/${nextQuest.id}`} style={{ textDecoration: 'none' }}>Mission suivante</Link>}
              <Link className="qx-b g" to={mapPath} style={{ textDecoration: 'none' }}>Retour aux missions</Link>
            </div>
          </>
        )}
      </div>

      {traced && (
        <div className="qx-over" role="alertdialog" aria-label="Connexion tracée">
          <div className="qx-card">
            <h2 style={{ color: 'var(--pink)' }}>Connexion tracée</h2>
            <p>Trop d’erreurs d’affilée : ils ont repéré la session. Coupe, respire, relis la consigne et le cours, puis reprends l’étape.</p>
            <div className="qx-nav" style={{ justifyContent: 'center' }}>
              <button type="button" className="qx-b" onClick={() => { setTraced(false); setAlert(0); setVerdict(null); }}>Reprendre l’étape</button>
              <button type="button" className="qx-b g" onClick={() => nav(mapPath)}>Quitter la mission</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
