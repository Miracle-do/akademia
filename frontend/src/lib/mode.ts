import { useCallback, useEffect, useSyncExternalStore } from 'react';

export type ModePref = 'auto' | 'light' | 'dark';
export type Mode = 'light' | 'dark';

const KEY = 'akademia:mode';
const listeners = new Set<() => void>();

export function readPref(): ModePref {
  try {
    const v = localStorage.getItem(KEY);
    if (v === 'light' || v === 'dark' || v === 'auto') return v;
  } catch {
    /* ignore */
  }
  return 'auto';
}

function systemMode(): Mode {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function resolveMode(pref: ModePref): Mode {
  return pref === 'auto' ? systemMode() : pref;
}

const THEME_COLOR: Record<Mode, string | null> = { light: null, dark: '#0B1020' };

export function applyMode(pref: ModePref = readPref()): Mode {
  const mode = resolveMode(pref);
  const root = document.documentElement;
  root.setAttribute('data-mode', mode);
  const meta = document.querySelector('meta[name="theme-color"]');
  const dark = THEME_COLOR[mode];
  if (meta && dark) meta.setAttribute('content', dark);
  return mode;
}

export function setModePref(pref: ModePref) {
  try {
    localStorage.setItem(KEY, pref);
  } catch {
    /* ignore */
  }
  applyMode(pref);
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** Préférence (auto/clair/sombre) + mode réellement appliqué. */
export function useMode() {
  const pref = useSyncExternalStore(subscribe, readPref, () => 'auto' as ModePref);

  useEffect(() => {
    applyMode(pref);
    if (pref !== 'auto') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      applyMode('auto');
      listeners.forEach((l) => l());
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [pref]);

  const mode = resolveMode(pref);
  const toggle = useCallback(() => setModePref(mode === 'dark' ? 'light' : 'dark'), [mode]);
  return { pref, mode, setPref: setModePref, toggle };
}
