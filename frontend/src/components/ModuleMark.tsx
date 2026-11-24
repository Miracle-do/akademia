/** Initiales d'un titre de module : « Internet des Objets » -> « IO ». */
export function initialsOf(title: string): string {
  const words = title.split(/[\s\-–·:]+/).filter((w) => w.length > 2 && /^[A-Za-zÀ-ÿ]/.test(w));
  const pick = words.length >= 2 ? [words[0], words[1]] : [words[0] ?? title];
  const out = pick.map((w) => w[0]).join('');
  return (words.length >= 2 ? out : (words[0] ?? title).slice(0, 3)).toUpperCase();
}

/** Pastille sobre qui remplace l'émoji d'un module : initiales sur la couleur du module. */
export function ModuleMark({ title, color, size = 48, className = '' }: { title: string; color: string; size?: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-2xl font-display font-black tracking-wide text-white ${className}`}
      style={{ width: size, height: size, background: color, fontSize: Math.round(size * 0.34) }}
    >
      {initialsOf(title)}
    </span>
  );
}
