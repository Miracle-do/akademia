import { ReactNode, useEffect, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/state/AuthContext';
import { PROGRAMMES } from '@/lib/cursus';
import { Mascot } from '@/components/Mascot';
import ModeToggle from '@/components/ModeToggle';
import { CrossedSwordsIcon, WinnerTrophyCup } from '@/components/Decor';
import { cn } from '@/lib/utils';

/** Apparition douce au défilement (désactivée si l'utilisateur réduit les animations). */
function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn('transition duration-700 ease-out', shown ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0', className)}
    >
      {children}
    </div>
  );
}

const STEPS = [
  { n: '1', title: 'Crée ton compte', text: 'Choisis ta filière et ton année. Ton espace, tes cours et ton classement sont prêts.' },
  { n: '2', title: 'Apprends et t’entraîne', text: 'Cours illustrés, QCM, défis éclair, cartes mémoire et épreuves blanches.' },
  { n: '3', title: 'Progresse et gagne', text: 'XP, flamme quotidienne, badges et classement de ta classe.' },
];

const ADVANTAGES = [
  ['Une plateforme par classe', 'Chaque filière et chaque année a son espace : tu ne vois que ce qui te concerne, et tu peux visiter les autres classes.'],
  ['Une révision qui s’adapte', 'Les questions ratées reviennent demain, celles que tu maîtrises s’espacent. Tu révises ce qu’il faut, quand il faut.'],
  ['Motivant, sans pression', 'XP, flamme, 25 badges et niveaux transforment la révision en habitude.'],
  ['Pensé pour l’ENEAM', 'Le contenu suit les matières de ton cursus, avec des épreuves blanches pour te préparer aux examens.'],
  ['Mode clair et sombre', 'Un thème de couleur par filière, et un mode sombre pour réviser le soir.'],
  ['Gratuit pour commencer', 'Crée ton compte en une minute et commence directement.'],
];

function SectionTitle({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="inline-flex rounded-full bg-soft px-3.5 py-1 text-xs font-black uppercase tracking-wider text-brand">{kicker}</span>
      <h2 className="h-display mt-3 text-3xl sm:text-4xl">{title}</h2>
      {sub && <p className="mt-2 text-sm font-semibold text-muted sm:text-base">{sub}</p>}
    </div>
  );
}

/** Maquette de QCM, dessinée en CSS : montre l'écran sans image à télécharger. */
function QuizMock() {
  return (
    <div className="card w-full max-w-sm space-y-3 p-5" aria-hidden="true">
      <div className="flex items-center justify-between text-xs font-black text-muted">
        <span>Question 4 / 10</span>
        <span className="rounded-full bg-soft px-2.5 py-0.5 text-brand">+10 XP</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-soft"><div className="h-full w-[40%] rounded-full bg-brand" /></div>
      <p className="font-display text-base font-black text-ink">Quel protocole attribue automatiquement une adresse IP ?</p>
      {['DNS', 'DHCP', 'SMTP'].map((o, i) => (
        <div
          key={o}
          className={cn(
            'rounded-2xl border-2 px-4 py-2.5 text-sm font-bold',
            i === 1 ? 'border-good bg-good/10 text-ink' : 'border-line bg-card text-muted',
          )}
        >
          {o} {i === 1 && <span className="float-right text-good">✓</span>}
        </div>
      ))}
    </div>
  );
}

function RankMock() {
  const rows = [['Awa', 1820], ['Koffi', 1610], ['Toi', 1495], ['Sènami', 1320]];
  return (
    <div className="card w-full max-w-sm p-5" aria-hidden="true">
      <div className="mb-3 flex items-center gap-2 font-display text-base font-black text-ink">
        <WinnerTrophyCup size={26} /> Classement de ta classe
      </div>
      <div className="space-y-2">
        {rows.map(([n, xp], i) => (
          <div key={n} className={cn('flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-bold', n === 'Toi' ? 'bg-soft text-brand' : 'bg-bg text-ink')}>
            <span className="w-5 text-center font-black">{i + 1}</span>
            <span className="flex-1">{n}</span>
            <span className="text-xs text-muted">{xp} XP</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen overflow-x-hidden bg-bg text-ink">
      {/* Barre du haut */}
      <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/bienvenue" className="flex items-center gap-2">
            <Mascot size={34} animate={false} />
            <span className="h-display text-xl">Akademia</span>
          </Link>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Link to="/connexion?mode=in" className="btn btn-soft max-sm:!hidden">Se connecter</Link>
            <Link to="/connexion?mode=up" className="btn btn-primary whitespace-nowrap">S’inscrire</Link>
          </div>
        </div>
      </header>

      {/* Héros */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 -z-0 bg-gradient-to-b from-[rgb(var(--bg-tinted))] to-transparent" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-12 lg:grid-cols-2 lg:pt-20">
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-soft px-3.5 py-1 text-xs font-black uppercase tracking-wider text-brand">
              La plateforme des étudiants de l’ENEAM
            </span>
            <h1 className="h-display mt-4 text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
              Révise mieux. <span className="text-brand">Joue le jeu.</span> Réussis.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base font-semibold text-muted sm:text-lg lg:mx-0">
              Cours, QCM, cartes mémoire et épreuves blanches, avec XP, badges et classement de ta classe pour garder le rythme jusqu’aux examens.
            </p>
            <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row lg:justify-start sm:justify-center">
              <Link to="/connexion?mode=up" className="btn btn-primary btn-lg w-full sm:w-auto">Commencer gratuitement</Link>
              <a href="#fonctionnement" className="btn btn-soft btn-lg w-full sm:w-auto">Voir comment ça marche</a>
            </div>
            <p className="mt-3 text-xs font-bold text-muted">Sans carte bancaire · Inscription en 1 minute</p>
          </div>

          <div className="relative mx-auto flex w-full max-w-md justify-center">
            <div className="absolute -inset-6 rounded-[3rem] bg-brand/10 blur-2xl" />
            <div className="relative">
              <Mascot mood="excited" size={230} graduationCap />
            </div>
          </div>
        </div>
      </section>

      {/* Chiffres vérifiables */}
      <section className="border-y border-line/70 bg-card">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-6 text-center sm:grid-cols-4">
          {[
            [String(PROGRAMMES.length), 'filières de l’ENEAM'],
            ['3', 'années par filière'],
            ['25', 'badges à débloquer'],
            ['5', 'façons de réviser'],
          ].map(([v, l]) => (
            <div key={l}>
              <div className="h-display text-3xl text-brand">{v}</div>
              <div className="text-xs font-bold text-muted">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Fonctionnement */}
      <section id="fonctionnement" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:py-20">
        <SectionTitle kicker="Comment ça marche" title="Trois étapes, et c’est parti" />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 100}>
              <div className="card h-full p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand font-display text-xl font-black text-white shadow-btn-brand">{s.n}</span>
                <h3 className="h-display mt-4 text-xl">{s.title}</h3>
                <p className="mt-1.5 text-sm font-semibold text-muted">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Aperçu : réviser */}
      <section className="bg-card">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 sm:py-20">
          <Reveal className="flex justify-center md:order-2"><QuizMock /></Reveal>
          <Reveal className="md:order-1">
            <span className="rounded-full bg-soft px-3.5 py-1 text-xs font-black uppercase tracking-wider text-brand">Réviser</span>
            <h2 className="h-display mt-3 text-3xl sm:text-4xl">Une révision qui apprend de toi</h2>
            <p className="mt-3 text-base font-semibold text-muted">
              Tu rates une question ? Elle revient demain. Tu la maîtrises ? Elle s’espace. Akademia repère aussi les chapitres à renforcer pour que tu passes ton temps où ça compte.
            </p>
            <ul className="mt-4 space-y-2 text-sm font-bold">
              {['QCM par chapitre et défis éclair', 'Cartes mémoire et épreuves blanches', 'Rappel « À réviser aujourd’hui »'].map((t) => (
                <li key={t} className="flex items-center gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-good/15 text-xs text-good">✓</span>{t}</li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Aperçu : classement */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 sm:py-20">
        <Reveal className="flex justify-center"><RankMock /></Reveal>
        <Reveal>
          <span className="rounded-full bg-soft px-3.5 py-1 text-xs font-black uppercase tracking-wider text-brand">Se mesurer</span>
          <h2 className="h-display mt-3 text-3xl sm:text-4xl">Un classement pour chaque classe</h2>
          <p className="mt-3 text-base font-semibold text-muted">
            IG1, IG2, GRH3, STAT1… Tu te compares aux étudiants de ta classe, et tu peux aller voir les autres filières et années quand tu veux.
          </p>
        </Reveal>
      </section>

      {/* Filières */}
      <section className="bg-card">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <SectionTitle kicker="Toutes les filières" title="Chaque filière a son espace" sub="Ton espace garde ta couleur, tes cours et ton classement." />
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {PROGRAMMES.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 80}>
                <div className="card flex h-full flex-col items-center p-4 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand font-display text-sm font-black tracking-wide text-white" aria-hidden="true">{p.short}</span>
                  <div className="mt-3 text-sm font-extrabold leading-snug text-ink">{p.name}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Battle */}
      <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:py-20">
        <Reveal>
          <div className="mx-auto flex w-fit items-center gap-3">
            <Mascot size={86} color="#1D6FFF" animate={false} />
            <CrossedSwordsIcon size={34} className="text-brand" />
            <Mascot size={86} color="#7C3AED" animate={false} />
          </div>
          <h2 className="h-display mt-4 text-3xl sm:text-4xl">ARI contre AIP : la Battle de la semaine</h2>
          <p className="mx-auto mt-3 max-w-xl text-base font-semibold text-muted">
            En 3ᵉ année d’Informatique de Gestion, les deux spécialités s’affrontent du lundi au samedi. Chaque XP gagné fait avancer ton camp.
          </p>
        </Reveal>
      </section>

      {/* Avantages */}
      <section className="bg-card">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <SectionTitle kicker="Pourquoi Akademia" title="Tout pour tenir sur la durée" />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ADVANTAGES.map(([t, d], i) => (
              <Reveal key={t} delay={(i % 3) * 80}>
                <div className="h-full rounded-3xl border border-line bg-bg p-5">
                  <h3 className="h-display text-lg">{t}</h3>
                  <p className="mt-1.5 text-sm font-semibold text-muted">{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Appel final */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:py-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-brand px-6 py-12 text-center text-white shadow-pop">
            <div className="mx-auto flex w-fit"><Mascot mood="happy" size={110} graduationCap /></div>
            <h2 className="h-display mt-3 text-3xl sm:text-4xl">Prêt à rejoindre ta classe ?</h2>
            <p className="mx-auto mt-2 max-w-md text-sm font-semibold text-white/85">Crée ton compte, choisis ta filière et commence ta première série.</p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/connexion?mode=up" className="btn btn-lg bg-white text-brand hover:bg-white/90">Créer mon compte</Link>
              <Link to="/connexion?mode=in" className="text-sm font-extrabold underline underline-offset-4">J’ai déjà un compte</Link>
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-line/70 py-6 text-center text-xs font-bold text-muted">
        Akademia · Fait pour les étudiants de l’ENEAM
      </footer>
    </div>
  );
}
