import { Link, Outlet, useParams } from 'react-router-dom';
import { Empty } from '@/components/ui';
import { getModule, moduleAnnee } from '@/lib/content';
import { useAnnee } from '@/state/useAnnee';

/**
 * Protège les routes /m/:moduleId/* : un module d'une autre année que celle de l'étudiant
 * n'est pas ouvert (accès payant à venir). Un module inconnu laisse la page gérer sa redirection.
 */
export default function ModuleGate() {
  const { moduleId } = useParams();
  const annee = useAnnee();
  const m = getModule(moduleId);
  if (m && moduleAnnee(m) !== annee) {
    return (
      <Empty mood="sleepy" title={`Module de ${moduleAnnee(m)}ᵉ année`}>
        <p>
          « {m.title} » fait partie du programme de {moduleAnnee(m)}ᵉ année. L’accès aux modules des autres années sera
          proposé en option payante.
        </p>
        <p className="mt-3 flex flex-wrap justify-center gap-3">
          <Link to="/modules" className="btn btn-primary !py-2 text-xs">
            Mes modules
          </Link>
          <Link to="/classement" className="btn !py-2 text-xs">
            Voir le classement
          </Link>
        </p>
      </Empty>
    );
  }
  return <Outlet />;
}
