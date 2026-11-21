import { useMemo } from 'react';
import { modulesForAnnee } from '@/lib/content';
import { normalizeAnnee } from '@/lib/progress';
import type { AnneeId, ModuleMeta } from '@/lib/types';
import { useAuth } from './AuthContext';

/** Année d'études de l'utilisateur connecté (3 par défaut, comme les comptes existants). */
export function useAnnee(): AnneeId {
  const { user } = useAuth();
  return normalizeAnnee(user?.annee);
}

/** Modules de l'année de l'utilisateur : ce qu'il peut ouvrir. */
export function useMyModules(): ModuleMeta[] {
  const annee = useAnnee();
  return useMemo(() => modulesForAnnee(annee), [annee]);
}
