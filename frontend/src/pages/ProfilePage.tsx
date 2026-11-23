import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  Clock,
  Gears,
  Grades,
  GraduationHat,
  Sparkles,
  Star,
  TextBubble,
} from '@getpapillon/papicons';
import { fetchLeaderboard } from '@/data/repo';
import { useAnnee } from '@/state/useAnnee';
import { getPublicProfile, PublicProfile } from '@/data/social';
import { levelProgress } from '@/lib/gamification';
import { cn, fmtNum } from '@/lib/utils';
import { useAuth } from '@/state/AuthContext';
import { useStore } from '@/state/Store';
import { FILIERES, useTheme } from '@/state/Theme';
import { Mascot } from '@/components/Mascot';
import { renderWithAnimatedEmojis } from '@/components/AnimatedEmoji';
import { FlameBadgeIcon, TrophyBadgeIcon } from '@/components/Decor';
import { CustomAvatar } from '@/components/CustomAvatar';
import VersionBadge from '@/components/VersionBadge';
import { Empty, PageTitle, Spinner, Stat } from '@/components/ui';

export default function ProfilePage() {
  const { userId } = useParams();
  const { user } = useAuth();
  const myAnnee = useAnnee();
  const { state } = useStore();
  const { theme, filiere, customPseudo } = useTheme();

  // Public Profile State (if viewing someone else)
  const isPublicView = Boolean(userId && userId !== user?.id);
  const [publicProfile, setPublicProfile] = useState<PublicProfile | null>(null);
  const [publicLoading, setPublicLoading] = useState(false);
  const [publicError, setPublicError] = useState('');

  // Self Profile State
  const [myRank, setMyRank] = useState<number>(1);

  // Load public profile if in public view mode
  useEffect(() => {
    if (!isPublicView || !userId) return;
    let active = true;
    setPublicLoading(true);
    setPublicError('');
    getPublicProfile(userId)
      .then((res) => {
        if (active) setPublicProfile(res);
      })
      .catch(() => {
        if (active) setPublicError('Impossible de charger ce profil joueur.');
      })
      .finally(() => {
        if (active) setPublicLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isPublicView, userId]);

  // Load leaderboard rank for self
  useEffect(() => {
    if (isPublicView) return;
    let alive = true;
    fetchLeaderboard(50, myAnnee)
      .then((rows) => {
        if (!alive || !user) return;
        const idx = rows.findIndex((r) => r.id === user.id);
        if (idx >= 0) setMyRank(idx + 1);
      })
      .catch(() => {
        /* ignore */
      });
    return () => {
      alive = false;
    };
  }, [isPublicView, user, state.xp, myAnnee]);

  // ==================== RENDU PROFIL PUBLIC JOUEUR ====================
  if (isPublicView) {
    if (publicLoading) return <Spinner label="Chargement du profil…" />;
    if (publicError || !publicProfile) {
      return (
        <Empty mood="surprised" title={publicError || 'Profil introuvable'}>
          <Link to="/classement" className="btn btn-soft mt-3">
            <ArrowLeft size={16} /> Retour au classement
          </Link>
        </Empty>
      );
    }

    const publicLp = levelProgress(publicProfile.xp);
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <PageTitle
          title="Profil joueur"
          right={
            <Link to="/classement" className="btn btn-ghost !px-3">
              <ArrowLeft size={16} /> Classement
            </Link>
          }
        />

        <section className="card relative flex flex-col items-center p-6 text-center shadow-pop">
          <div className="relative flex items-center justify-center rounded-full p-1 border-[3px] border-brand bg-card shadow-card">
            <CustomAvatar name={publicProfile.username} size={88} showBadge />
          </div>

          <h2 className="h-display mt-3 text-2xl text-ink">{renderWithAnimatedEmojis(publicProfile.username)}</h2>
          <div className="mt-1 flex items-center gap-2">
            <span className="rounded-full bg-brand px-3 py-1 text-xs font-extrabold text-white">
              Niveau {publicLp.level}
            </span>
          </div>

          <div className="mt-6 flex w-full justify-center">
            <Link
              to={`/messages/${publicProfile.id}`}
              className="btn btn-primary btn-lg w-full max-w-xs"
            >
              <TextBubble size={18} /> Envoyer un message
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-3">
          <div className="card flex flex-col items-center justify-center p-4 text-center">
            <FlameBadgeIcon size={26} />
            <span className="font-display mt-2 text-xl font-extrabold text-ink">
              {publicProfile.streak}
            </span>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted">
              Séries
            </span>
          </div>

          <div className="card flex flex-col items-center justify-center p-4 text-center">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-soft text-brand font-extrabold text-xs">
              XP
            </div>
            <span className="font-display mt-2 text-xl font-extrabold text-ink">
              {fmtNum(publicProfile.xp)}
            </span>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted">
              XP
            </span>
          </div>

          <div className="card flex flex-col items-center justify-center p-4 text-center">
            <Clock size={24} className="text-muted" />
            <span className="font-display mt-2 text-xs font-extrabold text-ink">
              {new Date(publicProfile.created_at).toLocaleDateString('fr-FR', {
                month: 'short',
                year: 'numeric',
              })}
            </span>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted">
              Membre
            </span>
          </div>
        </section>
      </div>
    );
  }

  // ==================== RENDU MON PROFIL ====================
  const lp = levelProgress(state.xp);
  const displayName = user?.username || customPseudo;
  const displayXp = state.xp >= 1000 ? `${(state.xp / 1000).toFixed(1)}k` : fmtNum(state.xp);

  return (
    <div className="mx-auto max-w-md space-y-6">
      {/* En-tête Mon Profil + Roue crantée Paramètres */}
      <div className="relative flex items-center justify-center pt-1">
        <h1 className="h-display text-2xl sm:text-3xl">Mon Profil</h1>
        <Link
          to="/parametres"
          className="absolute right-0 flex h-10 w-10 items-center justify-center rounded-full bg-card text-ink shadow-card transition hover:scale-105"
          aria-label="Paramètres"
        >
          <Gears size={22} />
        </Link>
      </div>

      {/* Avatar Personnalisé avec Initiales et Couleur Filière + Nom + Pilule Niveau */}
      <section className="relative flex flex-col items-center text-center">
        <div
          className="pointer-events-none absolute -top-2 h-32 w-64 rounded-full bg-soft/65 blur-xl"
          aria-hidden="true"
        />

        <div className="relative flex items-center justify-center rounded-full p-1 border-[3px] border-brand bg-card shadow-card ring-4 ring-soft">
          <CustomAvatar name={displayName} filiere={filiere} size={96} showBadge />
        </div>

        <h2 className="h-display mt-3 text-3xl text-ink">{renderWithAnimatedEmojis(displayName)}</h2>

        <div className="mt-1.5 flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-3.5 py-1 text-xs font-extrabold text-white shadow-sm',
              theme === 'ciel' ? 'bg-[#8B5CF6]' : 'bg-brand',
            )}
          >
            <Star size={13} />
            <span>Niveau {lp.level}</span>
          </span>
          <span className="rounded-full bg-soft px-3 py-1 text-xs font-extrabold text-brand">
            Filière {filiere}
          </span>
        </div>
      </section>

      {/* Grille des 3 Tuiles Statistiques (Séries, XP, Classement) */}
      <section className="grid grid-cols-3 gap-3">
        <div className="card flex flex-col items-center justify-center p-4 text-center">
          <FlameBadgeIcon size={26} />
          <span className="font-display mt-2 text-2xl font-extrabold text-ink">{state.streak}</span>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted">
            Séries
          </span>
        </div>

        <div className="card flex flex-col items-center justify-center p-4 text-center">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-soft text-brand font-extrabold text-xs">
            XP
          </div>
          <span className="font-display mt-2 text-2xl font-extrabold text-ink">{displayXp}</span>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted">
            XP Total
          </span>
        </div>

        <div className="card flex flex-col items-center justify-center p-4 text-center">
          <TrophyBadgeIcon size={26} />
          <span className="font-display mt-2 text-2xl font-extrabold text-ink">#{myRank}</span>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted">
            Classement
          </span>
        </div>
      </section>

      {/* Liste d'actions du Profil */}
      <section className="card divide-y divide-line/60 overflow-hidden p-0">
        <Link
          to="/resultats"
          className="flex items-center justify-between p-4 transition hover:bg-soft/50"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-soft text-brand">
              <Grades size={18} />
            </span>
            <span className="font-display text-sm font-extrabold text-ink">Mes statistiques</span>
          </div>
          <ChevronRight size={18} className="text-muted" />
        </Link>

        <Link
          to="/succes"
          className="flex items-center justify-between p-4 transition hover:bg-soft/50"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-soft text-brand">
              <Sparkles size={18} />
            </span>
            <span className="font-display text-sm font-extrabold text-ink">Mes badges</span>
          </div>
          <ChevronRight size={18} className="text-muted" />
        </Link>

        <Link
          to="/messages"
          className="flex items-center justify-between p-4 transition hover:bg-soft/50"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-soft text-brand">
              <TextBubble size={18} />
            </span>
            <span className="font-display text-sm font-extrabold text-ink">Messagerie</span>
          </div>
          <ChevronRight size={18} className="text-muted" />
        </Link>

        <Link
          to="/parametres"
          className="flex items-center justify-between p-4 transition hover:bg-soft/50"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-soft text-brand">
              <Gears size={18} />
            </span>
            <span className="font-display text-sm font-extrabold text-ink">Paramètres</span>
          </div>
          <ChevronRight size={18} className="text-muted" />
        </Link>
      </section>

      <div className="pt-2 text-center">
        <VersionBadge />
      </div>
    </div>
  );
}
