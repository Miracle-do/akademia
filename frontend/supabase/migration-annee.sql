-- ============================================================
-- Migration : année d'études (2 ou 3) — à exécuter UNE fois dans Supabase > SQL Editor
-- Sans danger si rejouée. Les comptes existants passent en 3ᵉ année.
-- ============================================================
alter table public.profiles add column if not exists annee smallint not null default 3 check (annee in (2, 3));
create index if not exists profiles_annee_xp_idx on public.profiles (annee, xp desc);

-- Le trigger d'inscription lit désormais l'année choisie (user_metadata.annee)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  wanted_username text := nullif(trim(new.raw_user_meta_data->>'username'), '');
  wanted_filiere  text := upper(nullif(trim(new.raw_user_meta_data->>'filiere'), ''));
  wanted_annee    text := nullif(trim(new.raw_user_meta_data->>'annee'), '');
  final_username  text;
  valid_filiere   text := 'ARI';
  valid_annee     smallint := 3;
  initial_theme   text := 'ciel';
begin
  if wanted_filiere in ('ARI', 'AIP') then
    valid_filiere := wanted_filiere;
  end if;
  if valid_filiere = 'AIP' then
    initial_theme := 'violet';
  end if;
  if wanted_annee in ('2', '3') then
    valid_annee := wanted_annee::smallint;
  end if;

  final_username := coalesce(wanted_username, 'etudiant_' || substr(replace(new.id::text, '-', ''), 1, 6));
  begin
    insert into public.profiles (id, username, filiere, annee)
    values (new.id, final_username, valid_filiere, valid_annee)
    on conflict (id) do update
      set filiere = coalesce(public.profiles.filiere, excluded.filiere);
  exception when unique_violation then
    -- pseudo déjà pris : ajout d'un suffixe unique pour ne jamais bloquer l'inscription
    insert into public.profiles (id, username, filiere, annee)
    values (new.id, left(final_username, 20) || '_' || substr(replace(new.id::text, '-', ''), 1, 5), valid_filiere, valid_annee)
    on conflict (id) do nothing;
  end;

  insert into public.user_state (user_id, state)
  values (
    new.id,
    jsonb_build_object(
      'v', 1,
      'filiere', valid_filiere,
      'theme', initial_theme,
      'xp', 0,
      'streak', 0,
      'bestStreak', 0,
      'lastActive', null,
      'daily', jsonb_build_object('date', to_char(now() at time zone 'utc', 'YYYY-MM-DD'), 'xp', 0),
      'dailyGoal', 50,
      'chaptersRead', '{}'::jsonb,
      'attempts', '[]'::jsonb,
      'badges', '{}'::jsonb,
      'review', '{}'::jsonb,
      'chapterStats', '{}'::jsonb,
      'examBest', '{}'::jsonb,
      'counters', jsonb_build_object('quizzes', 0, 'perfectQuizzes', 0, 'blitzBest', 0, 'maxCombo', 0, 'cardsKnown', 0, 'exams', 0)
    )
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;
