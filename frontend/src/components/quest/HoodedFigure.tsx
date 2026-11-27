import { useEffect, useId, useRef } from 'react';
import './quest.css';

/**
 * Le contact : une silhouette à capuche dont le visage reste dans l'ombre, seuls les yeux brillent.
 * Le volume vient de couches SVG empilées à des profondeurs différentes (CSS 3D) qui s'inclinent en suivant le pointeur.
 */
export function HoodedFigure({ size = 140, talk = false, tilt = true, className = '' }: { size?: number; talk?: boolean; tilt?: boolean; className?: string }) {
  const id = useId().replace(/:/g, '');
  const rig = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tilt || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = rig.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const dx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)));
        const dy = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2)));
        el.style.transform = `rotateY(${(dx * 18).toFixed(1)}deg) rotateX(${(-dy * 12).toFixed(1)}deg)`;
      });
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => { window.removeEventListener('pointermove', move); cancelAnimationFrame(raf); };
  }, [tilt]);

  const L = (z: number, children: React.ReactNode) => (
    <svg className="layer" viewBox="0 0 240 300" style={{ transform: `translateZ(${z}px)` }} aria-hidden="true">{children}</svg>
  );

  return (
    <div className={`qx-fig ${talk ? 'talk' : ''} ${className}`} style={{ width: size, height: size * 1.25 }} role="img" aria-label="Un contact en capuche, le visage dans l'ombre">
      <div className="rig" ref={rig}>
        {L(-60, (
          <>
            <defs>
              <radialGradient id={`${id}h`}><stop offset="0" stopColor="#00e5ff" stopOpacity=".5" /><stop offset=".6" stopColor="#7a2cff" stopOpacity=".18" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
            </defs>
            <circle className="halo" cx="120" cy="130" r="122" fill={`url(#${id}h)`} />
            <g fontFamily="monospace" fontSize="11" fill="#00e5ff" opacity=".75">
              {[['6', 40, '01', 0], ['30', 70, '10', -1], ['196', 36, '11', -2], ['214', 90, '00', -.6], ['14', 140, '10', -1.6], ['204', 150, '01', -2.4]].map(([x, y, t, d]) => (
                <text key={String(x)} className="bit" x={x as number} y={y as number} style={{ animationDelay: `${d}s`, transformBox: 'fill-box' }}>{t}</text>
              ))}
            </g>
          </>
        ))}
        {L(0, (
          <>
            <defs>
              <linearGradient id={`${id}c`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a1a63" /><stop offset="1" stopColor="#06021a" /></linearGradient>
            </defs>
            <path d="M12 300 C 20 236 58 204 120 198 C 182 204 220 236 228 300 Z" fill={`url(#${id}c)`} />
            <path d="M12 300 C 20 236 58 204 120 198" fill="none" stroke="#00e5ff" strokeOpacity=".6" strokeWidth="2.2" />
            <path d="M228 300 C 220 236 182 204 120 198" fill="none" stroke="#ff2e93" strokeOpacity=".5" strokeWidth="2.2" />
            <path d="M66 232 C 78 262 82 282 80 300 M174 232 C 162 262 158 282 160 300 M120 204 V300" fill="none" stroke="#ffffff" strokeOpacity=".07" strokeWidth="2" />
          </>
        ))}
        {L(22, (
          <>
            <defs>
              <linearGradient id={`${id}d`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3a2380" /><stop offset=".55" stopColor="#170a45" /><stop offset="1" stopColor="#090321" /></linearGradient>
            </defs>
            <path d="M120 12 C 64 14 38 68 44 128 C 47 172 76 202 120 208 C 164 202 193 172 196 128 C 202 68 176 14 120 12 Z" fill={`url(#${id}d)`} />
            <path d="M120 12 C 64 14 38 68 44 128 C 47 172 76 202 120 208" fill="none" stroke="#00e5ff" strokeOpacity=".75" strokeWidth="2.6" />
            <path d="M120 12 C 176 14 202 68 196 128 C 193 172 164 202 120 208" fill="none" stroke="#ff2e93" strokeOpacity=".6" strokeWidth="2.6" />
            <path d="M120 14 C 100 42 95 72 100 98" fill="none" stroke="#ffffff" strokeOpacity=".1" strokeWidth="3" strokeLinecap="round" />
          </>
        ))}
        {L(34, (
          <>
            <defs>
              <radialGradient id={`${id}v`} cx=".5" cy=".45" r=".6"><stop offset="0" stopColor="#000" /><stop offset=".75" stopColor="#030110" /><stop offset="1" stopColor="#0c0630" /></radialGradient>
            </defs>
            <path d="M120 56 C 84 58 68 94 72 128 C 76 162 98 184 120 186 C 142 184 164 162 168 128 C 172 94 156 58 120 56 Z" fill={`url(#${id}v)`} stroke="#00e5ff" strokeOpacity=".18" strokeWidth="1.5" />
          </>
        ))}
        {L(48, (
          <>
            <defs>
              <filter id={`${id}g`} x="-60%" y="-200%" width="220%" height="500%"><feGaussianBlur stdDeviation="3.2" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>
            <g filter={`url(#${id}g)`}>
              <ellipse className="eye" cx="101" cy="124" rx="10" ry="3.6" transform="rotate(12 101 124)" fill="#00e5ff" />
              <ellipse className="eye" cx="139" cy="124" rx="10" ry="3.6" transform="rotate(-12 139 124)" fill="#00e5ff" />
            </g>
            <path d="M108 158 H132" stroke="#00e5ff" strokeOpacity=".25" strokeWidth="2" strokeLinecap="round" />
          </>
        ))}
        {L(56, (
          <>
            <defs>
              <radialGradient id={`${id}s`}><stop offset="0" stopColor="#00e5ff" stopOpacity=".55" /><stop offset="1" stopColor="#00e5ff" stopOpacity="0" /></radialGradient>
            </defs>
            <ellipse cx="120" cy="296" rx="84" ry="22" fill={`url(#${id}s)`} />
          </>
        ))}
      </div>
    </div>
  );
}
