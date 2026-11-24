import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  apiRequest,
  getStoredRefreshToken,
  getStoredToken,
  getStoredUser,
  readSnapshot,
  saveStateToSupabaseDirect,
  setStoredRefreshToken,
  setStoredToken,
  setStoredUser,
  writeSnapshot,
} from '@/data/repo';
import { supabase, cloudEnabled } from '@/data/supabase';
import { disablePush } from '@/data/push';
import { defaultState, normalizeAnnee, normalizeFiliere, normalizeState } from '@/lib/progress';
import { identityOf } from '@/lib/cursus';
import type { ProgrammeId } from '@/lib/cursus';
import type { AnneeId, BackendThemeId, FiliereId, UserState } from '@/lib/types';

/** Identité demandée à l'inscription ou au changement de profil. */
export interface IdentityPatch {
  programme?: ProgrammeId;
  annee?: AnneeId;
  /** Spécialité ARI/AIP (IG3 uniquement). */
  filiere?: FiliereId;
}

/** Réponse du backend pour un utilisateur. */
interface ApiUser {
  id: string;
  email?: string;
  username: string;
  programme?: ProgrammeId;
  filiere?: FiliereId | null;
  annee?: AnneeId;
  theme?: BackendThemeId;
}

export interface AuthUser {
  id: string;
  email?: string;
  username: string;
  /** Filière (programme) : IG, GRH, GBA, GFC, GTL, GC, PLAN ou STAT. Absente = IG. */
  programme?: ProgrammeId;
  /** Spécialité ARI/AIP : uniquement pour la classe IG3, sinon null. */
  filiere?: FiliereId | null;
  /** Année d'études (1, 2 ou 3). Absente = 3ᵉ année. */
  annee?: AnneeId;
  theme?: BackendThemeId;
  guest: boolean;
}

interface AuthApi {
  user: AuthUser | null;
  ready: boolean;
  cloud: boolean;
  signIn(email: string, password: string): Promise<string | null>;
  signUp(
    email: string,
    password: string,
    username: string,
    identity: IdentityPatch,
  ): Promise<{ error?: string; needsConfirmation?: boolean }>;
  signOut(): Promise<void>;
  updateProfile(patch: IdentityPatch & { username?: string }): Promise<string | null>;
  resetPassword(email: string, newPassword?: string): Promise<string | null>;
  /** Vrai quand l'utilisateur arrive depuis le lien « mot de passe oublié » et doit en choisir un nouveau. */
  recovery: boolean;
  setNewPassword(password: string): Promise<string | null>;
}

const Ctx = createContext<AuthApi | null>(null);

function frError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('invalid login') || m.includes('invalid credentials'))
    return 'E-mail ou mot de passe incorrect.';
  if (m.includes('already registered') || m.includes('already been registered'))
    return 'Cet e-mail est déjà utilisé.';
  if (m.includes('password should be'))
    return 'Le mot de passe doit contenir au moins 6 caractères.';
  if (m.includes('email not confirmed'))
    return 'Confirme ton e-mail (lien reçu par courriel) avant de te connecter.';
  if (m.includes('rate limit') || m.includes('too many requests'))
    return 'Trop de tentatives. Réessaie dans quelques minutes.';
  if (m.includes('username') || m.includes('profiles'))
    return 'Ce pseudo est déjà pris. Choisis-en un autre.';
  return msg;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const cached = getStoredUser();
    const token = getStoredToken();
    if (cached && token) {
      return {
        id: cached.id,
        email: cached.email,
        username: cached.username,
        ...identityOf(cached),
        guest: false,
      };
    }
    return null;
  });
  const [ready, setReady] = useState(false);
  const [recovery, setRecovery] = useState(false);

  const resolveSupabaseUser = useCallback(
    async (sessionUser: {
      id: string;
      email?: string | null;
      user_metadata?: Record<string, unknown>;
    }): Promise<AuthUser> => {
      const cached = getStoredUser();
      let username =
        (sessionUser.user_metadata?.username as string | undefined) ||
        (cached?.id === sessionUser.id ? cached.username : undefined) ||
        (sessionUser.email ? sessionUser.email.split('@')[0] : 'Étudiant');
      let filiere =
        normalizeFiliere(sessionUser.user_metadata?.filiere) ??
        (cached?.id === sessionUser.id ? normalizeFiliere(cached.filiere) : null);
      let annee: AnneeId = normalizeAnnee(
        sessionUser.user_metadata?.annee ?? (cached?.id === sessionUser.id ? cached.annee : undefined),
      );
      let programme: ProgrammeId = identityOf({
        programme: sessionUser.user_metadata?.programme ?? (cached?.id === sessionUser.id ? cached.programme : undefined),
      }).programme;

      if (supabase) {
        try {
          const { data: prof } = await supabase
            .from('profiles')
            .select('username, filiere')
            .eq('id', sessionUser.id)
            .maybeSingle();
          if (prof) {
            if (prof.username) username = String(prof.username);
            const profFiliere = normalizeFiliere((prof as { filiere?: unknown }).filiere);
            if (profFiliere) filiere = profFiliere;
          } else {
            // Sans spécialité (hors IG3) : on n'écrit pas de filière (le champ ne se retire plus ensuite).
            await supabase
              .from('profiles')
              .upsert(
                {
                  id: sessionUser.id,
                  username,
                  ...(filiere ? { filiere } : {}),
                  updated_at: new Date().toISOString(),
                },
                { onConflict: 'id' },
              );
          }
        } catch {
          /* ignore */
        }
        // Lecture à part : si la colonne `annee` n'est pas encore migrée, cela n'affecte pas le reste du profil.
        try {
          const { data: anneeRow, error: anneeErr } = await supabase
            .from('profiles')
            .select('annee')
            .eq('id', sessionUser.id)
            .maybeSingle();
          if (!anneeErr && anneeRow) annee = normalizeAnnee((anneeRow as { annee?: unknown }).annee);
        } catch {
          /* ignore */
        }
        // Idem pour `programme` (migration-cursus.sql) : sans la colonne, tout le monde reste en IG.
        try {
          const { data: progRow, error: progErr } = await supabase
            .from('profiles')
            .select('programme')
            .eq('id', sessionUser.id)
            .maybeSingle();
          if (!progErr && progRow) programme = identityOf({ programme: (progRow as { programme?: unknown }).programme }).programme;
        } catch {
          /* ignore */
        }
      }

      try {
        const me = await apiRequest<ApiUser>('/me');
        if (me?.username) username = me.username;
        if (me?.filiere) filiere = normalizeFiliere(me.filiere) ?? filiere;
        if (me?.annee) annee = normalizeAnnee(me.annee);
        if (me?.programme) programme = identityOf({ programme: me.programme }).programme;
      } catch {
        /* backend may be cold-starting; keep Supabase profile */
      }

      const resolved: AuthUser = {
        id: sessionUser.id,
        email: sessionUser.email ?? undefined,
        username,
        ...identityOf({ programme, annee, filiere }),
        guest: false,
      };
      setStoredUser(resolved);
      return resolved;
    },
    [],
  );

  const loadSession = useCallback(async () => {
    if (supabase) {
      try {
        let { data } = await supabase.auth.getSession();
        if (!data.session) {
          const storedToken = getStoredToken();
          const storedRefresh = getStoredRefreshToken();
          if (storedToken && storedRefresh) {
            const restored = await supabase.auth
              .setSession({ access_token: storedToken, refresh_token: storedRefresh })
              .catch(() => ({ data: { session: null } }));
            data = restored.data;
          }
        }
        if (data.session?.user) {
          setStoredToken(data.session.access_token);
          if (data.session.refresh_token) setStoredRefreshToken(data.session.refresh_token);
          const resolved = await resolveSupabaseUser(data.session.user);
          setUser(resolved);
          setReady(true);
          return;
        }
      } catch {
        /* fallback to backend token check */
      }
    }

    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setReady(true);
      return;
    }

    try {
      const me = await apiRequest<ApiUser>('/me');
      const resolved: AuthUser = {
        id: me.id,
        email: me.email,
        username: me.username,
        ...identityOf(me),
        guest: false,
      };
      setStoredUser(resolved);
      setUser(resolved);
    } catch (error) {
      const status =
        typeof error === 'object' && error !== null && 'status' in error
          ? Number((error as { status: number }).status)
          : 0;
      if (status === 401) {
        setStoredToken(null);
        setStoredRefreshToken(null);
        setStoredUser(null);
        setUser(null);
      } else {
        const cached = getStoredUser();
        if (cached) {
          setUser({
            id: cached.id,
            email: cached.email,
            username: cached.username,
            ...identityOf(cached),
            guest: false,
          });
        }
      }
    } finally {
      setReady(true);
    }
  }, [resolveSupabaseUser]);

  useEffect(() => {
    void loadSession();
    if (!supabase) return;
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.access_token) {
        setStoredToken(session.access_token);
        if (session.refresh_token) setStoredRefreshToken(session.refresh_token);
      }
      if (event === 'PASSWORD_RECOVERY') setRecovery(true);
      if (event === 'SIGNED_OUT') {
        setRecovery(false);
        setStoredToken(null);
        setStoredRefreshToken(null);
        setStoredUser(null);
        setUser(null);
      }
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, [loadSession]);

  const api = useMemo<AuthApi>(
    () => ({
      user,
      ready,
      cloud: cloudEnabled,
      async signIn(email, password) {
        const cleanEmail = email.trim().toLowerCase();

        // 1) Connexion directe Supabase si configuré côté client
        if (supabase) {
          try {
            const { data, error } = await supabase.auth.signInWithPassword({
              email: cleanEmail,
              password,
            });
            if (!error && data.session?.user) {
              setStoredToken(data.session.access_token);
              if (data.session.refresh_token) setStoredRefreshToken(data.session.refresh_token);
              const resolved = await resolveSupabaseUser(data.session.user);
              setUser(resolved);
              return null;
            }
            if (error && !error.message.toLowerCase().includes('fetch')) {
              return frError(error.message);
            }
          } catch {
            /* fallback to backend /auth/signin */
          }
        }

        // 2) Connexion via le backend (/api/auth/signin)
        try {
          const res = await apiRequest<{
            token: string;
            refreshToken?: string;
            state?: UserState;
            user: ApiUser;
          }>('/auth/signin', {
            method: 'POST',
            body: JSON.stringify({ email: cleanEmail, password }),
          });
          setStoredToken(res.token);
          if (res.refreshToken) setStoredRefreshToken(res.refreshToken);
          if (supabase && res.token && res.refreshToken) {
            await supabase.auth
              .setSession({ access_token: res.token, refresh_token: res.refreshToken })
              .catch(() => {});
          }
          const resolved: AuthUser = {
            id: res.user.id,
            email: res.user.email,
            username: res.user.username,
            ...identityOf({ ...res.user, filiere: res.user.filiere ?? res.state?.filiere }),
            guest: false,
          };
          if (res.state) {
            const existing = readSnapshot(res.user.id);
            if (!existing) {
              writeSnapshot(res.user.id, { state: normalizeState(res.state), pending: [] });
            }
          }
          setStoredUser(resolved);
          setUser(resolved);
          return null;
        } catch (err) {
          return err instanceof Error ? err.message : 'E-mail ou mot de passe incorrect.';
        }
      },

      async signUp(email, password, username, wanted) {
        const cleanEmail = email.trim().toLowerCase();
        const cleanUsername = username.trim();
        const identity = identityOf(wanted);
        const normFiliere = identity.filiere;
        const normAnnee: AnneeId = identity.annee;
        const normProgramme: ProgrammeId = identity.programme;
        const initialTheme = identity.theme;
        const initialState = normalizeState({
          ...defaultState(),
          filiere: normFiliere,
          theme: initialTheme,
        });

        // 1) Tentative via le backend (qui utilise Supabase et/ou service_role)
        try {
          const res = await apiRequest<{
            token: string | null;
            refreshToken?: string | null;
            needsConfirmation?: boolean;
            state?: UserState;
            user: ApiUser;
          }>('/auth/signup', {
            method: 'POST',
            body: JSON.stringify({
              email: cleanEmail,
              password,
              username: cleanUsername,
              filiere: normFiliere,
              annee: normAnnee,
              programme: normProgramme,
            }),
          });

          if (res.token) {
            setStoredToken(res.token);
            if (res.refreshToken) setStoredRefreshToken(res.refreshToken);
            if (supabase && res.refreshToken) {
              await supabase.auth
                .setSession({ access_token: res.token, refresh_token: res.refreshToken })
                .catch(() => {});
            }
            const resolved: AuthUser = {
              id: res.user.id,
              email: res.user.email || cleanEmail,
              username: res.user.username || cleanUsername,
              ...identityOf({
                programme: res.user.programme ?? normProgramme,
                annee: res.user.annee ?? normAnnee,
                filiere: res.user.filiere ?? normFiliere,
              }),
              guest: false,
            };
            const targetState = normalizeState(res.state ?? initialState);
            writeSnapshot(resolved.id, { state: targetState, pending: [] });
            await saveStateToSupabaseDirect(resolved.id, targetState);
            setStoredUser(resolved);
            setUser(resolved);
            return {};
          }

          if (res.needsConfirmation) {
            return { needsConfirmation: true };
          }
        } catch (err) {
          const status =
            typeof err === 'object' && err !== null && 'status' in err
              ? Number((err as { status: number }).status)
              : 0;
          if (status === 400 || status === 409 || status === 422) {
            return { error: err instanceof Error ? err.message : 'Inscription impossible.' };
          }
          if (!supabase) {
            return { error: err instanceof Error ? err.message : 'Inscription impossible.' };
          }
        }

        // 2) Fallback direct Supabase si le backend est en veille ou hors-ligne
        if (supabase) {
          try {
            const { data: existingProf } = await supabase
              .from('profiles')
              .select('id, username')
              .ilike('username', cleanUsername)
              .limit(5);
            if (
              existingProf?.some(
                (p) => String(p.username || '').trim().toLowerCase() === cleanUsername.toLowerCase(),
              )
            ) {
              return { error: 'Ce pseudo est déjà pris. Choisis-en un autre.' };
            }

            const { data, error } = await supabase.auth.signUp({
              email: cleanEmail,
              password,
              options: {
                data: {
                  username: cleanUsername,
                  filiere: normFiliere,
                  annee: normAnnee,
                  programme: normProgramme,
                },
              },
            });
            if (error) return { error: frError(error.message) };
            if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
              return { error: 'Cet e-mail est déjà utilisé.' };
            }
            if (data.session && data.user) {
              setStoredToken(data.session.access_token);
              if (data.session.refresh_token) setStoredRefreshToken(data.session.refresh_token);
              await supabase
                .from('profiles')
                .upsert(
                  {
                    id: data.user.id,
                    username: cleanUsername,
                    ...(normFiliere ? { filiere: normFiliere } : {}),
                    xp: 0,
                    level: 1,
                    streak: 0,
                    updated_at: new Date().toISOString(),
                  },
                  { onConflict: 'id' },
                );
              // À part : sans la colonne `annee` (schéma non migré), le profil ci-dessus reste créé.
              await supabase.from('profiles').update({ annee: normAnnee }).eq('id', data.user.id);
              await supabase.from('profiles').update({ programme: normProgramme }).eq('id', data.user.id);
              writeSnapshot(data.user.id, { state: initialState, pending: [] });
              await saveStateToSupabaseDirect(data.user.id, initialState);
              const resolved: AuthUser = {
                id: data.user.id,
                email: data.user.email ?? cleanEmail,
                username: cleanUsername,
                programme: normProgramme,
                filiere: normFiliere,
                annee: normAnnee,
                theme: initialTheme,
                guest: false,
              };
              setStoredUser(resolved);
              setUser(resolved);
              return {};
            }
            return { needsConfirmation: true };
          } catch (err) {
            return { error: err instanceof Error ? frError(err.message) : 'Inscription impossible.' };
          }
        }

        return { error: 'Inscription impossible.' };
      },

      async signOut() {
        try {
          await disablePush();
        } catch {
          /* la déconnexion ne doit pas dépendre du service push */
        }
        try {
          await apiRequest('/auth/signout', { method: 'POST' });
        } catch {
          /* ignore */
        }
        if (supabase) {
          try {
            await supabase.auth.signOut();
          } catch {
            /* ignore */
          }
        }
        setStoredToken(null);
        setStoredRefreshToken(null);
        setStoredUser(null);
        setUser(null);
      },

      async updateProfile(patch) {
        try {
          const res = await apiRequest<{ user: ApiUser }>('/me', {
            method: 'PATCH',
            body: JSON.stringify(patch),
          });
          const resolved: AuthUser = {
            id: res.user.id,
            email: res.user.email ?? user?.email,
            username: res.user.username,
            ...identityOf(res.user),
            guest: false,
          };
          setStoredUser(resolved);
          setUser(resolved);
          return null;
        } catch (err) {
          // Le serveur a refusé la demande (règle métier) : on n'essaie surtout pas de la contourner en direct.
          const status =
            typeof err === 'object' && err !== null && 'status' in err
              ? Number((err as { status: number }).status)
              : 0;
          if (status === 400 || status === 409 || status === 422) {
            return err instanceof Error ? err.message : 'Mise à jour impossible.';
          }
          // Serveur indisponible (veille, hors-ligne) : mise à jour directe du pseudo uniquement.
          if (supabase && user && patch.username && !patch.programme && !patch.annee && !patch.filiere) {
            try {
              const { error } = await supabase
                .from('profiles')
                .update({ username: patch.username.trim(), updated_at: new Date().toISOString() })
                .eq('id', user.id);
              if (!error) {
                const resolved: AuthUser = { ...user, username: patch.username.trim() };
                setStoredUser(resolved);
                setUser(resolved);
                return null;
              }
            } catch {
              /* ignore */
            }
          }
          return err instanceof Error ? err.message : 'Mise à jour impossible.';
        }
      },

      recovery,
      async setNewPassword(password) {
        if (!supabase) return 'Service indisponible.';
        if (password.length < 6) return 'Le mot de passe doit contenir au moins 6 caractères.';
        const { error } = await supabase.auth.updateUser({ password });
        if (error) return frError(error.message);
        setRecovery(false);
        return null;
      },
      async resetPassword(email, newPassword) {
        const cleanEmail = email.trim().toLowerCase();
        if (supabase && !newPassword) {
          try {
            const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
              redirectTo: window.location.origin,
            });
            if (!error) return null;
          } catch {
            /* fallback to backend */
          }
        }
        try {
          await apiRequest('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ email: cleanEmail, newPassword }),
          });
          return null;
        } catch (err) {
          return err instanceof Error ? err.message : 'Réinitialisation impossible.';
        }
      },
    }),
    [user, ready, recovery, resolveSupabaseUser],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthApi {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth hors AuthProvider');
  return v;
}
