/**
 * Ambiance sonore des missions : un bourdonnement grave, un battement lent et un « ping » de sonar occasionnel,
 * générés avec Web Audio (aucun fichier). Ne démarre qu'après un geste de l'utilisateur ; coupable à tout moment.
 */
const MUTE_KEY = 'akademia:quest:mute';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let timers: number[] = [];
let nodes: AudioScheduledSourceNode[] = [];

export const isMuted = (): boolean => {
  try { return localStorage.getItem(MUTE_KEY) === '1'; } catch { return false; }
};
export function setMuted(m: boolean) {
  try { localStorage.setItem(MUTE_KEY, m ? '1' : '0'); } catch { /* stockage indisponible */ }
  if (master && ctx) master.gain.setTargetAtTime(m ? 0 : 0.5, ctx.currentTime, 0.2);
}

export function startAmbience() {
  if (ctx || typeof window === 'undefined') return;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  try {
    ctx = new AC();
    const c = ctx;
    master = c.createGain();
    master.gain.value = 0;
    master.connect(c.destination);
    master.gain.setTargetAtTime(isMuted() ? 0 : 0.5, c.currentTime, 1.2);

    // Bourdon : deux oscillateurs légèrement désaccordés, filtrés, modulés très lentement.
    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 220;
    filter.connect(master);
    for (const [f, g] of [[55, 0.16], [55.7, 0.14], [110.4, 0.05]] as const) {
      const o = c.createOscillator();
      const gn = c.createGain();
      o.type = f > 100 ? 'triangle' : 'sawtooth';
      o.frequency.value = f;
      gn.gain.value = g;
      o.connect(gn).connect(filter);
      o.start();
      nodes.push(o);
    }
    const lfo = c.createOscillator();
    const lfoGain = c.createGain();
    lfo.frequency.value = 0.07;
    lfoGain.gain.value = 90;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();
    nodes.push(lfo);

    const hit = (freq: number, len: number, vol: number, type: OscillatorType = 'sine') => {
      if (!ctx || !master) return;
      const o = ctx.createOscillator();
      const gn = ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(freq * 0.5, ctx.currentTime + len);
      gn.gain.setValueAtTime(vol, ctx.currentTime);
      gn.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + len);
      o.connect(gn).connect(master);
      o.start();
      o.stop(ctx.currentTime + len);
    };
    // Battement lent, puis ping de sonar de temps en temps.
    timers.push(window.setInterval(() => { hit(62, 0.35, 0.22); window.setTimeout(() => hit(58, 0.3, 0.14), 190); }, 2600));
    timers.push(window.setInterval(() => { if (Math.random() < 0.5) hit(1320, 1.6, 0.025); }, 7000));
  } catch {
    ctx = null;
  }
}

/** Court signal sonore (succès / échec) par-dessus l'ambiance. */
export function cue(kind: 'ok' | 'ko' | 'type') {
  if (!ctx || !master || isMuted()) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = kind === 'ko' ? 'sawtooth' : 'sine';
  o.frequency.value = kind === 'ok' ? 740 : kind === 'ko' ? 130 : 1100;
  g.gain.setValueAtTime(kind === 'type' ? 0.01 : 0.07, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (kind === 'ko' ? 0.45 : 0.16));
  o.connect(g).connect(master);
  o.start();
  o.stop(ctx.currentTime + 0.5);
}

export function stopAmbience() {
  timers.forEach((t) => window.clearInterval(t));
  timers = [];
  const c = ctx;
  if (master && c) master.gain.setTargetAtTime(0, c.currentTime, 0.25);
  window.setTimeout(() => {
    nodes.forEach((n) => { try { n.stop(); } catch { /* déjà arrêté */ } });
    nodes = [];
    void c?.close();
  }, 900);
  ctx = null;
  master = null;
}
