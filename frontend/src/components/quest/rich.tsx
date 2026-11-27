import type { ReactNode } from 'react';

/** Mini-Markdown : **gras** et `code`, plus le nom de l'étudiant à la place de {user}. */
export function rich(text: string, user: string): ReactNode[] {
  return text
    .replace(/\{user\}/g, user)
    .split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
    .filter(Boolean)
    .map((part, i) =>
      part.startsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : part.startsWith('`') ? <code key={i}>{part.slice(1, -1)}</code> : <span key={i}>{part}</span>,
    );
}

export const sub = (text: string, user: string) => text.replace(/\{user\}/g, user);
