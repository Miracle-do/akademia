import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import Loader from '@/components/Loader';

export interface LoadingState {
  /** Au moins une requête en cours (bloquante ou non). */
  isLoading: boolean;
  /** Au moins une requête qui doit bloquer l'écran (connexion, inscription…). */
  blocking: boolean;
  activeCount: number;
  message: string | null;
}

export interface LoadingContextValue extends LoadingState {
  startLoading: (message?: string) => () => void;
  stopLoading: () => void;
  withLoading: <T>(promiseOrFn: Promise<T> | (() => Promise<T>), message?: string) => Promise<T>;
}

type Listener = (state: LoadingState) => void;

class GlobalLoadingManager {
  private activeCount = 0;
  private blockingCount = 0;
  private messageStack: string[] = [];
  private listeners = new Set<Listener>();

  public getState(): LoadingState {
    return {
      isLoading: this.activeCount > 0,
      blocking: this.blockingCount > 0,
      activeCount: this.activeCount,
      message: this.messageStack.length > 0 ? this.messageStack[this.messageStack.length - 1] : null,
    };
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch {
        /* ignore listener error */
      }
    });
  }

  public start(message?: string, blocking = false): () => void {
    this.activeCount++;
    if (blocking) this.blockingCount++;
    if (message) {
      this.messageStack.push(message);
    }
    this.notify();

    let stopped = false;
    return () => {
      if (stopped) return;
      stopped = true;
      if (blocking && this.blockingCount > 0) this.blockingCount--;
      if (message) {
        const idx = this.messageStack.lastIndexOf(message);
        if (idx !== -1) {
          this.messageStack.splice(idx, 1);
        }
      }
      this.stop();
    };
  }

  public stop(): void {
    if (this.activeCount > 0) {
      this.activeCount--;
      if (this.activeCount === 0) {
        this.messageStack = [];
        this.blockingCount = 0;
      }
      this.notify();
    }
  }

  public async track<T>(promiseOrFn: Promise<T> | (() => Promise<T>), message?: string, blocking = false): Promise<T> {
    const done = this.start(message, blocking);
    try {
      const promise = typeof promiseOrFn === 'function' ? promiseOrFn() : promiseOrFn;
      return await promise;
    } finally {
      done();
    }
  }
}

export const globalLoadingManager = new GlobalLoadingManager();

/**
 * Détermine un libellé élégant et contextuel pour la requête API
 */
export function getApiLoadingMessage(url: string, method: string = 'GET'): string {
  const cleanUrl = url.toLowerCase();
  const m = method.toUpperCase();

  if (cleanUrl.includes('/auth/signin')) return 'Connexion en cours…';
  if (cleanUrl.includes('/auth/signup')) return 'Création de votre compte…';
  if (cleanUrl.includes('/auth/refresh')) return 'Actualisation de la session…';
  if (cleanUrl.includes('/auth/reset-password')) return 'Envoi des instructions de réinitialisation…';
  if (cleanUrl.includes('/auth/update-password')) return 'Mise à jour du mot de passe…';
  if (cleanUrl.includes('/progress/sync') || cleanUrl.includes('/progress/save')) return 'Synchronisation de votre progression…';
  if (cleanUrl.includes('/quiz/submit')) return 'Vérification de vos réponses…';
  if (cleanUrl.includes('/exam/submit')) return 'Correction et notation de l’examen…';
  if (cleanUrl.includes('/formation/complete')) return 'Validation de votre leçon…';
  if (cleanUrl.includes('/users/me/filiere')) return 'Enregistrement de votre filière…';
  if (cleanUrl.includes('/users/me/profile')) return 'Mise à jour de votre profil…';
  if (cleanUrl.includes('/leaderboard')) return 'Chargement du classement…';
  if (cleanUrl.includes('/battle')) return 'Chargement des données de battle…';
  if (cleanUrl.includes('/feed') && m === 'POST') return 'Publication en cours…';
  if (cleanUrl.includes('/messages') && m === 'POST') return 'Envoi de votre message…';
  if (cleanUrl.includes('/m/') || cleanUrl.includes('/modules')) return 'Chargement des contenus…';

  return m === 'GET' ? 'Chargement en cours…' : 'Traitement en cours…';
}

/**
 * Seules les actions de compte (connexion, inscription, mot de passe) bloquent l'écran :
 * l'utilisateur ne peut rien faire d'utile tant qu'elles ne sont pas terminées.
 * Tout le reste (lecture de contenu, synchronisation de progression, messagerie, classement…)
 * se fait en arrière-plan, sans jamais masquer la page.
 */
export function isBlockingRequest(url: string, method: string = 'GET'): boolean {
  const u = url.toLowerCase();
  if (method.toUpperCase() === 'GET') return false;
  return (
    u.includes('/auth/signin') || u.includes('/auth/signup') || u.includes('/auth/reset-password') || u.includes('/auth/update-password') ||
    /supabase\.co\/auth\/v1\/(token|signup|recover)/.test(u)
  );
}

/**
 * Initialise l'interception automatique de `window.fetch` pour les requêtes API et Supabase.
 * Empêche les doubles clics et affiche immédiatement le spinner global.
 */
let isFetchIntercepted = false;
export function initGlobalFetchInterceptor() {
  if (typeof window === 'undefined' || isFetchIntercepted) return;
  isFetchIntercepted = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = typeof input === 'string' ? input : input instanceof Request ? input.url : input.toString();

    // Vérifier si le header x-skip-loader est présent
    let shouldSkip = false;
    if (init?.headers) {
      if (init.headers instanceof Headers) {
        shouldSkip = init.headers.get('x-skip-loader') === 'true';
      } else if (Array.isArray(init.headers)) {
        shouldSkip = init.headers.some(([k, v]) => k.toLowerCase() === 'x-skip-loader' && v === 'true');
      } else if (typeof init.headers === 'object') {
        shouldSkip = (init.headers as Record<string, string>)['x-skip-loader'] === 'true';
      }
    }

    // Cibler les requêtes vers l'API backend (/api, http://localhost:4000/api, etc.) ou Supabase REST/Auth
    const isApi = url.includes('/api/') || url.includes('/api') || url.includes('supabase.co');

    if (!isApi || shouldSkip) {
      return originalFetch(input, init);
    }

    const method = init?.method || (input instanceof Request ? input.method : 'GET');
    const message = getApiLoadingMessage(url, method);

    return globalLoadingManager.track(originalFetch(input, init), message, isBlockingRequest(url, method));
  };
}

const LoadingContext = createContext<LoadingContextValue | null>(null);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<LoadingState>(() => globalLoadingManager.getState());

  useEffect(() => {
    initGlobalFetchInterceptor();
    return globalLoadingManager.subscribe((next) => {
      setState(next);
    });
  }, []);

  const startLoading = useCallback((message?: string) => {
    return globalLoadingManager.start(message, true);
  }, []);

  const stopLoading = useCallback(() => {
    globalLoadingManager.stop();
  }, []);

  const withLoading = useCallback(async <T,>(promiseOrFn: Promise<T> | (() => Promise<T>), message?: string) => {
    return globalLoadingManager.track(promiseOrFn, message, true);
  }, []);

  const value = useMemo<LoadingContextValue>(
    () => ({
      ...state,
      startLoading,
      stopLoading,
      withLoading,
    }),
    [state, startLoading, stopLoading, withLoading],
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <GlobalProgressBar active={state.isLoading && !state.blocking} />
      <GlobalLoaderOverlay state={state} />
    </LoadingContext.Provider>
  );
};

export function useLoading(): LoadingContextValue {
  const ctx = useContext(LoadingContext);
  if (!ctx) {
    throw new Error('useLoading doit être utilisé au sein d’un LoadingProvider');
  }
  return ctx;
}

/**
 * Overlay plein écran interactif qui bloque les interactions utilisateur (clics multiples)
 * et affiche le Dot Spinner adapté au thème actif de l'application.
 */
/** Délai avant d'afficher le voile (évite le clignotement sur les requêtes rapides) et durée maximale d'affichage. */
const OVERLAY_DELAY_MS = 400;
const OVERLAY_MAX_MS = 12000;

export const GlobalLoaderOverlay: React.FC<{ state: LoadingState }> = ({ state }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!state.blocking) {
      setVisible(false);
      return;
    }
    const show = window.setTimeout(() => setVisible(true), OVERLAY_DELAY_MS);
    // Garde-fou : une requête qui traîne ne doit jamais enfermer l'utilisateur derrière le voile.
    const hide = window.setTimeout(() => setVisible(false), OVERLAY_MAX_MS);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [state.blocking]);

  if (!state.blocking || !visible) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center p-4 select-none animate-in fade-in duration-200"
      style={{
        backgroundColor: 'rgba(18, 32, 58, 0.45)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        pointerEvents: 'all',
        cursor: 'wait',
      }}
      role="alertdialog"
      aria-modal="true"
      aria-live="assertive"
      aria-busy="true"
      aria-label={state.message || 'Chargement en cours'}
    >
      <div
        className="card flex flex-col items-center gap-4 rounded-3xl p-7 max-w-sm w-full mx-auto text-center border-2 border-line bg-card shadow-2xl transition-transform duration-200 scale-100"
        style={{
          boxShadow: '0 20px 40px -15px rgba(var(--brand), 0.35), 0 0 0 1px rgb(var(--line))',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Loader size="4.8rem" speed="0.9s" />
        <div className="flex flex-col gap-1 items-center">
          <p className="font-display text-lg font-extrabold text-ink leading-tight">
            {state.message || 'Chargement en cours…'}
          </p>
          <p className="text-xs font-semibold text-muted">
            Veuillez patienter un instant…
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Fine barre de progression en haut de l'écran pour les requêtes d'arrière-plan lentes (> 1 s).
 * Elle n'intercepte aucun clic : la page reste utilisable.
 */
export const GlobalProgressBar: React.FC<{ active: boolean }> = ({ active }) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!active) {
      setShow(false);
      return;
    }
    const t = window.setTimeout(() => setShow(true), 1000);
    return () => window.clearTimeout(t);
  }, [active]);
  if (!show) return null;
  return (
    <div className="fixed left-0 top-0 z-[99998] h-0.5 w-full overflow-hidden pointer-events-none" role="progressbar" aria-label="Chargement en arrière-plan">
      <div className="h-full w-1/3 animate-pulse rounded-full" style={{ backgroundColor: 'rgb(var(--brand))' }} />
    </div>
  );
};

export default LoadingProvider;
