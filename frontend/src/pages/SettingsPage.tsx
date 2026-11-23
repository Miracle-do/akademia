import { FormEvent, ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, ChevronRight, Info, Lock, Logout, Sparkles } from '@getpapillon/papicons';
import { cn } from '@/lib/utils';
import { ModePref, useMode } from '@/lib/mode';
import type { AnneeId } from '@/lib/types';
import { useAuth } from '@/state/AuthContext';
import { useAnnee } from '@/state/useAnnee';
import { FILIERES, useTheme } from '@/state/Theme';
import { isStandalone, triggerInstallPrompt } from '@/components/InstallPwaModal';
import PushToggle from '@/components/PushToggle';
import VersionBadge from '@/components/VersionBadge';
import { PageTitle } from '@/components/ui';

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="card space-y-4 p-5">
      <div>
        <h2 className="font-display text-lg font-extrabold text-ink">{title}</h2>
        {hint && <p className="mt-0.5 text-xs font-semibold text-muted">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function Feedback({ msg }: { msg: { ok: boolean; t: string } | null }) {
  if (!msg) return null;
  return (
    <p role="status" className={cn('text-xs font-extrabold', msg.ok ? 'text-good' : 'text-bad')}>
      {msg.t}
    </p>
  );
}

const readerPref = () => {
  try {
    return localStorage.getItem('akademia:reader') === 'lg' ? 'lg' : 'sm';
  } catch {
    return 'sm';
  }
};

export default function SettingsPage() {
  const { pref: modePref, setPref: setModePref } = useMode();
  const { user, signOut, updateProfile, setNewPassword, cloud } = useAuth();
  const myAnnee = useAnnee();
  const { filiere, hasFiliere, customPseudo, setCustomPseudo } = useTheme();
  const signedIn = Boolean(user && !user.guest && cloud);

  const [pseudo, setPseudo] = useState(user?.username || customPseudo);
  const [pseudoMsg, setPseudoMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [anneeBusy, setAnneeBusy] = useState(false);
  const [anneeMsg, setAnneeMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [reader, setReader] = useState<'sm' | 'lg'>(readerPref);
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [confirmOut, setConfirmOut] = useState(false);

  const cleanPseudo = pseudo.trim();
  const pseudoError = cleanPseudo.length < 2 ? 'Au moins 2 caractères.' : null;
  const pseudoChanged = cleanPseudo !== (user?.username || customPseudo);

  const savePseudo = async (e: FormEvent) => {
    e.preventDefault();
    if (pseudoError || !pseudoChanged) return;
    setCustomPseudo(cleanPseudo);
    const err = await updateProfile({ username: cleanPseudo });
    setPseudoMsg(err ? { ok: false, t: err } : { ok: true, t: 'Pseudo enregistré.' });
  };

  const chooseAnnee = async (a: AnneeId) => {
    if (a === myAnnee || anneeBusy) return;
    setAnneeBusy(true);
    const err = await updateProfile({ annee: a });
    setAnneeBusy(false);
    setAnneeMsg(err ? { ok: false, t: err } : { ok: true, t: `Tu es en ${a}ᵉ année : modules et classement mis à jour.` });
  };

  const chooseReader = (v: 'sm' | 'lg') => {
    setReader(v);
    try {
      localStorage.setItem('akademia:reader', v);
    } catch {
      /* ignore */
    }
  };

  const changePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (pw !== pw2) return setPwMsg({ ok: false, t: 'Les deux mots de passe ne sont pas identiques.' });
    setPwBusy(true);
    const err = await setNewPassword(pw);
    setPwBusy(false);
    if (err) return setPwMsg({ ok: false, t: err });
    setPw('');
    setPw2('');
    setPwMsg({ ok: true, t: 'Mot de passe modifié.' });
  };

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <PageTitle
        title="Paramètres"
        sub="Ton compte, ta lecture, tes notifications."
        right={<Link to="/profil" className="btn btn-ghost !px-3 text-xs">Mon profil</Link>}
      />

      <Section title="Compte" hint={user?.email ? `Connecté avec ${user.email}` : undefined}>
        <form onSubmit={savePseudo} className="space-y-1.5">
          <label htmlFor="pseudo" className="block text-xs font-extrabold uppercase text-muted">Pseudo</label>
          <div className="flex gap-2">
            <input id="pseudo" className="input flex-1" value={pseudo} maxLength={30} onChange={(e) => { setPseudo(e.target.value); setPseudoMsg(null); }} />
            <button type="submit" className="btn btn-primary whitespace-nowrap" disabled={Boolean(pseudoError) || !pseudoChanged}>Enregistrer</button>
          </div>
          {pseudoError && pseudoChanged ? <p className="text-xs font-bold text-bad">{pseudoError}</p> : <Feedback msg={pseudoMsg} />}
        </form>

        <div>
          <p className="mb-1.5 text-xs font-extrabold uppercase text-muted">Année d’études</p>
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Année d’études">
            {([2, 3] as const).map((a) => (
              <button key={a} type="button" role="radio" aria-checked={myAnnee === a} disabled={anneeBusy} onClick={() => void chooseAnnee(a)}
                className={cn('flex items-center justify-between rounded-2xl border-2 p-3 text-left transition', myAnnee === a ? 'border-brand bg-soft' : 'border-line/70 bg-card hover:border-brand/40')}>
                <span className="font-display text-base font-extrabold">{a}ᵉ année</span>
                {myAnnee === a && <Check size={18} className="text-brand" />}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] font-bold text-muted">À mettre à jour à chaque rentrée. Les modules et le classement changent avec l’année.</p>
          <Feedback msg={anneeMsg} />
        </div>

        <div>
          <p className="mb-1.5 text-xs font-extrabold uppercase text-muted">Filière</p>
          <div className="grid grid-cols-2 gap-2">
            {FILIERES.map((f) => (
              <div key={f.id} className={cn('flex items-center justify-between rounded-2xl border-2 p-3', filiere === f.id ? 'border-brand bg-soft' : 'border-line/70 bg-card opacity-70')}>
                <div>
                  <div className="font-display text-base font-extrabold">{f.id}</div>
                  <div className="text-[10px] font-bold text-muted">{f.name}</div>
                </div>
                {filiere === f.id ? <Check size={18} className="text-brand" /> : <Lock size={14} className="text-muted" />}
              </div>
            ))}
          </div>
          <p className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-muted">
            <Lock size={12} /> {hasFiliere ? 'La filière ne peut plus être modifiée une fois choisie.' : 'Choisis ta filière à l’inscription.'}
          </p>
        </div>
      </Section>

      <Section title="Apparence" hint="Clair, sombre, ou selon le réglage de ton téléphone.">
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Mode d’affichage">
          {([['auto', 'Auto', 'linear-gradient(90deg,#f4f7ff 50%,#101728 50%)'], ['light', 'Clair', '#f4f7ff'], ['dark', 'Sombre', '#101728']] as [ModePref, string, string][]).map(([id, label, bg]) => (
            <button key={id} type="button" role="radio" aria-checked={modePref === id} onClick={() => setModePref(id)}
              className={cn('rounded-2xl border-2 p-3 text-left transition', modePref === id ? 'border-brand bg-soft' : 'border-line/70 bg-card hover:border-brand/40')}>
              <span className="mb-2 block h-8 rounded-lg border border-line/70" style={{ background: bg }} />
              <span className="text-xs font-extrabold">{label}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Lecture" hint="Taille du texte dans les chapitres de cours.">
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Taille du texte">
          {([['sm', 'Normal', 'text-sm'], ['lg', 'Grand', 'text-lg']] as const).map(([id, label, size]) => (
            <button key={id} type="button" role="radio" aria-checked={reader === id} onClick={() => chooseReader(id)}
              className={cn('rounded-2xl border-2 p-3 text-left transition', reader === id ? 'border-brand bg-soft' : 'border-line/70 bg-card hover:border-brand/40')}>
              <span className={cn('block font-extrabold', size)}>Aa</span>
              <span className="text-xs font-bold text-muted">{label}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Notifications" hint="Messages, nouveaux cours et formations, classement, et un petit rappel de Nimbo si tu oublies de réviser.">
        {signedIn ? <PushToggle /> : <p className="text-sm font-semibold text-muted">Connecte-toi avec ton compte pour activer les notifications.</p>}
        <Link to="/notifications" className="flex items-center justify-between rounded-2xl bg-soft/60 p-3 transition hover:bg-soft">
          <span className="flex items-center gap-2 font-display text-sm font-extrabold"><Bell size={16} className="text-brand" /> Voir mes notifications</span>
          <ChevronRight size={16} className="text-muted" />
        </Link>
      </Section>

      {signedIn && (
        <Section title="Sécurité" hint="Choisis un mot de passe d’au moins 6 caractères.">
          <form onSubmit={changePassword} className="space-y-2">
            <input className="input w-full" type="password" autoComplete="new-password" placeholder="Nouveau mot de passe" value={pw} onChange={(e) => { setPw(e.target.value); setPwMsg(null); }} minLength={6} required />
            <input className="input w-full" type="password" autoComplete="new-password" placeholder="Confirmer le mot de passe" value={pw2} onChange={(e) => { setPw2(e.target.value); setPwMsg(null); }} minLength={6} required />
            <div className="flex items-center justify-between gap-3">
              <Feedback msg={pwMsg} />
              <button type="submit" className="btn btn-soft ml-auto whitespace-nowrap" disabled={pwBusy || !pw || !pw2}>{pwBusy ? 'Enregistrement…' : 'Changer le mot de passe'}</button>
            </div>
          </form>
        </Section>
      )}

      <Section title="Application">
        {!isStandalone() && (
          <button type="button" onClick={triggerInstallPrompt} className="btn btn-primary w-full">
            <Sparkles size={16} /> Installer Akademia sur mon téléphone
          </button>
        )}
        <div className="rounded-2xl bg-soft/60 p-3.5 text-sm font-semibold text-muted">
          <p className="mb-1 flex items-center gap-2 font-display font-extrabold text-ink"><Info size={16} className="text-brand" /> Comment ça marche ?</p>
          Chaque chapitre lu (+25 XP), QCM réussi, Défi Éclair ou épreuve te fait monter de niveau et rapporte des points à ta filière (<b>{filiere}</b>) pour la Battle de la semaine.
          <div className="mt-2 flex flex-wrap gap-2">
            <Link to="/modules" className="btn btn-primary !py-1.5 text-xs">Explorer les modules</Link>
            <Link to="/actu" className="btn btn-soft !py-1.5 text-xs">Voir la Battle</Link>
          </div>
        </div>
        <div className="text-center"><VersionBadge /></div>
      </Section>

      <Section title="Session">
        {confirmOut ? (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-muted">Te déconnecter de cet appareil ? Ta progression reste enregistrée sur ton compte.</p>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" className="btn btn-soft" onClick={() => setConfirmOut(false)}>Annuler</button>
              <button type="button" className="btn btn-primary" onClick={() => void signOut()}><Logout size={16} /> Me déconnecter</button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirmOut(true)} className="btn btn-soft w-full text-bad"><Logout size={18} /> Se déconnecter</button>
        )}
      </Section>
    </div>
  );
}
