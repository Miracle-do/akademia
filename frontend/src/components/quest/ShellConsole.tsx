import { useEffect, useRef, useState } from 'react';
import { promptOf, type ShellState } from '@/lib/vshell';
import type { LogEntry } from './SqlConsole';

/** Console façon terminal : l'étudiant tape des commandes, le mini-shell simulé les exécute. */
export function ShellConsole({
  state, log, history, onExecute, disabled,
}: {
  state: ShellState;
  log: LogEntry[];
  history: string[];
  onExecute: (line: string) => void;
  disabled?: boolean;
}) {
  const [text, setText] = useState('');
  const [hi, setHi] = useState(-1);
  const out = useRef<HTMLDivElement>(null);
  const area = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { out.current?.scrollTo({ top: out.current.scrollHeight }); }, [log.length]);

  const submit = () => {
    if (!text.trim() || disabled) return;
    onExecute(text);
    setText('');
    setHi(-1);
    area.current?.focus();
  };

  return (
    <div className="qx-term" onClick={() => area.current?.focus()}>
      <div className="st">
        <span>Session : <b>{state.user}@{state.host}</b></span>
        <span>{state.cwd}</span>
      </div>
      <div className="o" ref={out} role="log" aria-live="polite" aria-label="Sortie du terminal">
        {log.map((e) => {
          if (e.kind === 'cmd') return <div key={e.id} className="cmd">{e.text}</div>;
          if (e.kind === 'error') return <div key={e.id} className="err">{e.text}</div>;
          if (e.kind === 'sys') return <div key={e.id} className="sys">{e.text}</div>;
          return <div key={e.id} style={{ whiteSpace: 'pre-wrap' }}>{e.text}</div>;
        })}
      </div>
      <textarea
        ref={area}
        value={text}
        rows={2}
        disabled={disabled}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        aria-label="Commande à exécuter"
        placeholder={`${promptOf(state)} …`}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
          else if (e.key === 'ArrowUp' && !text.includes('\n') && history.length) {
            e.preventDefault();
            const n = Math.min(hi + 1, history.length - 1);
            setHi(n);
            setText(history[history.length - 1 - n]);
          } else if (e.key === 'ArrowDown' && hi >= 0) {
            e.preventDefault();
            const n = hi - 1;
            setHi(n);
            setText(n < 0 ? '' : history[history.length - 1 - n]);
          }
        }}
      />
      <div className="row">
        <button type="button" className="qx-b" onClick={submit} disabled={disabled || !text.trim()}>Exécuter</button>
        <button type="button" className="qx-b g" onClick={() => setText('')} disabled={!text}>Effacer la saisie</button>
      </div>
    </div>
  );
}
