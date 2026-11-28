import { useEffect, useRef, useState } from 'react';
import type { Cell, OracleSession } from '@/lib/oracleSession';

export interface LogEntry {
  id: number;
  kind: 'cmd' | 'text' | 'error' | 'table' | 'sys';
  text?: string;
  columns?: string[];
  rows?: Cell[][];
}

/** Console façon SQL*Plus : l'étudiant tape des ordres SQL, la session les exécute et affiche les messages d'Oracle. */
export function SqlConsole({
  session, user, log, history, onExecute, disabled,
}: {
  session: OracleSession;
  user: string;
  log: LogEntry[];
  history: string[];
  onExecute: (script: string) => void;
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
  /** Un trigger ou un bloc PL/SQL contient des « ; » : il se termine par une ligne « / », comme dans SQL*Plus. */
  const isBlock = /^\s*(create\s+(or\s+replace\s+)?(trigger|procedure|function|package)|declare|begin)\b/i.test(text);
  const pending = session.pendingChanges;
  const name = user.replace(/\s+/g, '_').toUpperCase().slice(0, 18);

  return (
    <div className="qx-term" onClick={() => area.current?.focus()}>
      <div className="st">
        <span>Session : <b>{name}@SAHEL_PROD</b></span>
        <span className={pending ? 'tx' : ''}>
          {pending ? `Transaction en cours : ${pending} ${pending > 1 ? 'modifications non validées' : 'modification non validée'}` : 'Aucune transaction en cours'}
        </span>
      </div>
      <div className="o" ref={out} role="log" aria-live="polite" aria-label="Sortie de la console SQL">
        {log.map((e) => {
          if (e.kind === 'cmd') return <div key={e.id} className="cmd">SQL&gt; {e.text}</div>;
          if (e.kind === 'error') return <div key={e.id} className="err">{e.text}</div>;
          if (e.kind === 'sys') return <div key={e.id} className="sys">{e.text}</div>;
          if (e.kind === 'table')
            return (
              <div key={e.id}>
                <table>
                  <thead><tr>{e.columns?.map((c, i) => <th key={i}>{c}</th>)}</tr></thead>
                  <tbody>
                    {e.rows?.map((r, i) => (
                      <tr key={i}>{r.map((v, j) => <td key={j} className={typeof v === 'number' ? 'r' : ''}>{v === null ? '' : String(v)}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
                {e.text && <div className="sys">{e.text}</div>}
              </div>
            );
          return <div key={e.id} style={{ whiteSpace: 'pre-wrap' }}>{e.text}</div>;
        })}
      </div>
      <textarea
        ref={area}
        value={text}
        rows={3}
        disabled={disabled}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        aria-label="Ordre SQL à exécuter"
        placeholder="Ordre SQL terminé par ; puis Entrée. Trigger : termine par une ligne / (Maj+Entrée : nouvelle ligne)"
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey || (!e.shiftKey && (isBlock ? /(^|\n)\s*\/\s*$/.test(text) : /;\s*$/.test(text))))) { e.preventDefault(); submit(); }
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
