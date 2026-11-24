import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { SPECIALITES, specialitesFor, type Identity } from '@/lib/cursus';
import type { BackendThemeId, FiliereId } from '@/lib/types';
import { useIdentity } from './useAnnee';
import { useStore } from './Store';

export type ThemeId = BackendThemeId;
export type { FiliereId };

export interface ThemeMeta {
  id: ThemeId;
  name: string;
  brandHex: string;
  mascotHex: string;
  ctaHex: string;
  bgHex: string;
}

export const THEMES: ThemeMeta[] = [
  { id: 'ciel', name: 'Bleu Azur', brandHex: '#1D6FFF', mascotHex: '#7EB6FF', ctaHex: '#1D6FFF', bgHex: '#FBF7EF' },
  { id: 'violet', name: 'Violet Royal & Or', brandHex: '#7C3AED', mascotHex: '#8B49F7', ctaHex: '#FFD026', bgHex: '#FBF7EF' },
  { id: 'corail', name: 'Corail', brandHex: '#FF574A', mascotHex: '#FF7266', ctaHex: '#FF574A', bgHex: '#FBF7EF' },
  { id: 'cyan', name: 'Cyan Polaire', brandHex: '#18B8E8', mascotHex: '#2DC6F5', ctaHex: '#18B8E8', bgHex: '#F4FAFC' },
  { id: 'emeraude', name: 'Vert Émeraude', brandHex: '#0D945C', mascotHex: '#34BE82', ctaHex: '#0D945C', bgHex: '#F5FAF6' },
  { id: 'ambre', name: 'Ambre Doré', brandHex: '#C86905', mascotHex: '#F59E0B', ctaHex: '#C86905', bgHex: '#FDF9F0' },
  { id: 'rose', name: 'Rose Magenta', brandHex: '#DB2777', mascotHex: '#F472B6', ctaHex: '#DB2777', bgHex: '#FDF7F9' },
  { id: 'ardoise', name: 'Bleu Ardoise', brandHex: '#47558C', mascotHex: '#818EC4', ctaHex: '#47558C', bgHex: '#F6F7FA' },
  { id: 'bordeaux', name: 'Bordeaux', brandHex: '#9F1239', mascotHex: '#E8506E', ctaHex: '#9F1239', bgHex: '#FCF7F7' },
];

/** Spécialités d'IG3 (ARI / AIP), dérivées de content/cursus.json. */
export const FILIERES: { id: FiliereId; name: string; full: string; color: string; theme: ThemeId }[] = (
  Object.values(SPECIALITES) as { id: FiliereId; name: string; theme: ThemeId; color: string }[]
).map((s) => ({ id: s.id, name: s.id, full: s.name, color: s.color, theme: s.theme }));

interface ThemeContextValue {
  theme: ThemeId;
  themeMeta: ThemeMeta;
  identity: Identity;
  /** Spécialité ARI/AIP (IG3 uniquement), sinon null. */
  filiere: FiliereId | null;
  /** Vrai si la classe a des spécialités et que l'étudiant n'a pas encore choisi la sienne (IG3). */
  needsSpecialite: boolean;
  setFiliere(f: FiliereId): Promise<void>;
  customPseudo: string;
  setCustomPseudo(name: string): void;
}

const Ctx = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { setUserFiliere } = useStore();
  const identity = useIdentity();
  const theme = identity.theme;
  const needsSpecialite = specialitesFor(identity.programme, identity.annee).length > 0 && !identity.filiere;

  const [customPseudo, setCustomPseudoState] = useState<string>(() => {
    try {
      return localStorage.getItem('akademia:pseudo') || 'Belmonde';
    } catch {
      return 'Belmonde';
    }
  });

  // Le thème découle de la filière (et de la spécialité en IG3) ; il est appliqué sur <html>.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.remove('dark');
    const metaInfo = THEMES.find((x) => x.id === theme) ?? THEMES[0];
    const metaTag = document.querySelector('meta[name="theme-color"]');
    if (metaTag && document.documentElement.getAttribute('data-mode') !== 'dark')
      metaTag.setAttribute('content', metaInfo.brandHex);
    try {
      localStorage.setItem('akademia:theme', theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const setFiliere = useCallback(
    async (f: FiliereId) => {
      await setUserFiliere(f);
    },
    [setUserFiliere],
  );

  const setCustomPseudo = (name: string) => {
    const clean = name.trim() || 'Belmonde';
    setCustomPseudoState(clean);
    try {
      localStorage.setItem('akademia:pseudo', clean);
    } catch {
      /* ignore */
    }
  };

  const themeMeta = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  return (
    <Ctx.Provider
      value={{
        theme,
        themeMeta,
        identity,
        filiere: identity.filiere,
        needsSpecialite,
        setFiliere,
        customPseudo,
        setCustomPseudo,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useTheme = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useTheme hors ThemeProvider');
  return v;
};
