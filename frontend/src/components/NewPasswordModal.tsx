import { FormEvent, useState } from 'react';
import { Lock } from '@getpapillon/papicons';
import { useAuth } from '@/state/AuthContext';

/** Affichée après un clic sur le lien « mot de passe oublié » reçu par e-mail. */
export default function NewPasswordModal() {
  const { recovery, setNewPassword } = useAuth();
  const [pw, setPw] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (!recovery) return null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(await setNewPassword(pw));
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label="Nouveau mot de passe">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-3 p-6">
        <h2 className="h-display text-2xl">Nouveau mot de passe</h2>
        <p className="text-sm font-semibold text-muted">Choisis le mot de passe que tu utiliseras pour te connecter.</p>
        <label className="flex items-center gap-3 rounded-2xl border-2 border-line bg-card px-4 py-3 focus-within:border-brand">
          <Lock size={18} className="shrink-0 text-brand" />
          <input
            className="w-full bg-transparent text-sm font-bold outline-none"
            type="password"
            placeholder="6 caractères minimum"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            minLength={6}
            required
            autoFocus
            autoComplete="new-password"
          />
        </label>
        {err && <p role="alert" className="rounded-2xl bg-bad/15 p-3 text-xs font-extrabold text-bad">{err}</p>}
        <button type="submit" className="btn btn-primary btn-lg w-full" disabled={busy}>
          {busy ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </form>
    </div>
  );
}
