import { useMemo } from 'react';
import { modulesForClass } from '@/lib/content';
import { classCode, identityOf, type Identity } from '@/lib/cursus';
import type { AnneeId, ModuleMeta } from '@/lib/types';
import { useAuth } from './AuthContext';
import { useStore } from './Store';

/** Filière, année et spécialité de l'utilisateur connecté (IG, 3ᵉ année par défaut, comme les comptes existants). */
export function useIdentity(): Identity {
  const { user } = useAuth();
  const { state } = useStore();
  // La spécialité choisie après l'inscription (IG3) vit d'abord dans la progression, puis dans le profil.
  const filiere = user?.filiere ?? state.filiere;
  return useMemo(
    () => identityOf({ programme: user?.programme, annee: user?.annee, filiere }),
    [user?.programme, user?.annee, filiere],
  );
}

/** Année d'études de l'utilisateur connecté. */
export function useAnnee(): AnneeId {
  return useIdentity().annee;
}

/** Code de classe de l'utilisateur (ex. « IG3 », « GRH2 »). */
export function useClassCode(): string {
  const { programme, annee } = useIdentity();
  return classCode(programme, annee);
}

/** Modules de la classe de l'utilisateur : son espace par défaut. */
export function useMyModules(): ModuleMeta[] {
  const { programme, annee, filiere } = useIdentity();
  return useMemo(() => modulesForClass(programme, annee, filiere), [programme, annee, filiere]);
}
