import { useEffect, useRef, useState } from 'react';
import { CoachBubble, UserBubble } from './CoachBubble';
import { fireConfetti } from './Celebrations';
import type { TerminalMission } from '@/lib/types';
import { evaluateCheck, initialState, promptOf, runLine, type ShellState } from '@/lib/vshell';

type Line = { prompt: string; cmd: string; output: string; error: boolean };
type Result = { ok: boolean; picked?: number; tries: number; text?: string };

/**
 * Atelier pratique : un vrai mini-terminal simulé (système de fichiers en mémoire),
 * avec une série de missions validées sur l'état réel du shell plutôt que sur un texte figé.
 */
export function TerminalMissionView({
  intro,
  missions,
  color,
  onResult,
}: {
  intro?: string;
  missions: TerminalMission[];
  color: string;
  onResult: (r: Result) => void;
}) {
  const [shell, setShell] = useState<ShellState>(() => initialState());
  const [history, setHistory] = useState<Line[]>([]);
  const [input, setInput] = useState('');
  const [missionIdx, setMissionIdx] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [triesThisMission, setTriesThisMission] = useState(0);
  const [totalTries, setTotalTries] = useState(0);
  const [justSolved, setJustSolved] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const mission = missions[missionIdx];

  useEffect(() => { bottomRef.current?.scrollIntoView({ block: 'end' }); }, [history, missionIdx]);
  useEffect(() => { if (!done) inputRef.current?.focus(); }, [missionIdx, done]);

  const runCommand = () => {
    const cmd = input;
    if (!cmd.trim()) return;
    const promptText = promptOf(shell);
    const res = runLine(shell, cmd);
    setHistory((h) => [...h, { prompt: promptText, cmd, output: res.output, error: res.error }]);
    setShell(res.state);
    setInput('');

    const passed = mission && evaluateCheck(mission.check, res.state);
    const tries = triesThisMission + 1;
    setTriesThisMission(tries);
    setTotalTries((t) => t + 1);

    if (passed) {
      setJustSolved(missionIdx);
      fireConfetti(false);
      window.setTimeout(() => {
        setJustSolved(null);
        setShowHint(false);
        setTriesThisMission(0);
        if (missionIdx + 1 >= missions.length) {
          setDone(true);
          window.setTimeout(() => onResult({ ok: true, tries: totalTries + 1 }), 500);
        } else {
          setMissionIdx((i) => i + 1);
        }
      }, 1100);
    }
  };

  return (
    <div className="bubble-in space-y-2.5">
      {intro && <CoachBubble avatar={false} color={color} text={intro} />}

      <div className="ml-[3.4rem] space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="chip bg-soft text-ink">Mission {Math.min(missionIdx + 1, missions.length)}/{missions.length}</span>
          {!done && mission?.hint && !showHint && (
            <button type="button" onClick={() => setShowHint(true)} className="btn btn-soft !px-3 !py-1 text-xs">Un indice</button>
          )}
        </div>

        {!done && mission && (
          <div className="rounded-2xl bg-card px-3.5 py-2.5 text-sm font-bold shadow-card ring-1 ring-line/60">
            {mission.prompt}
          </div>
        )}
        {!done && showHint && mission?.hint && (
          <p className="rounded-2xl bg-gold/20 px-3.5 py-2 text-sm font-bold">Indice : {mission.hint}</p>
        )}
        {triesThisMission >= 2 && !done && justSolved === null && (
          <p className="text-xs font-bold text-muted">Essaie <code>pwd</code> ou <code>ls</code> pour vérifier où tu es avant la commande demandée.</p>
        )}

        <div className="overflow-hidden rounded-2xl border border-line bg-[#141B2D] shadow-card">
          <div className="flex items-center justify-between bg-white/5 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            <span>Terminal</span>
            <span>{shell.user}@{shell.host}</span>
          </div>
          <div className="max-h-72 overflow-y-auto p-3.5 font-mono text-[12.5px] leading-relaxed text-slate-100">
            {history.map((l, i) => (
              <div key={i} className="mb-1.5 whitespace-pre-wrap">
                <div><span className="text-emerald-400">{l.prompt}</span> {l.cmd}</div>
                {l.output && <div className={l.error ? 'text-red-400' : 'text-slate-300'}>{l.output}</div>}
              </div>
            ))}
            {justSolved !== null && (
              <div className="mb-1.5 rounded-lg bg-emerald-500/15 px-2 py-1 text-emerald-300">✓ {missions[justSolved].explain}</div>
            )}
            {done && <div className="text-emerald-300">Atelier terminé — bien joué !</div>}
            {!done && (
              <div className="flex items-center gap-1.5">
                <span className="shrink-0 text-emerald-400">{promptOf(shell)}</span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') runCommand(); }}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoCorrect="off"
                  className="flex-1 bg-transparent font-mono text-[12.5px] text-slate-100 outline-none"
                  aria-label="Ligne de commande"
                />
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>
      </div>

      {done && <UserBubble className="font-mono text-xs">Atelier terminé en {totalTries} commande(s).</UserBubble>}
    </div>
  );
}
