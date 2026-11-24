-- ============================================================
-- Migration : toutes les filières de l'ENEAM (programme + année 1 à 3 + spécialité IG3)
-- À exécuter UNE fois dans Supabase > SQL Editor. Sans danger si rejouée.
--
-- Avant : profiles.filiere = ARI/AIP pour tout le monde, annee = 2 ou 3.
-- Après : profiles.programme = IG, GRH, GBA, GFC, GTL, GC, PLAN ou STAT (IG par défaut : comptes existants),
--         profiles.annee = 1, 2 ou 3,
--         profiles.filiere = spécialité ARI/AIP, utilisée uniquement pour la classe IG3.
-- Les comptes existants restent en IG, avec leur année et leur spécialité.
-- ============================================================
alter table public.profiles
  add column if not exists programme text not null default 'IG'
  check (programme in ('IG', 'GRH', 'GBA', 'GFC', 'GTL', 'GC', 'PLAN', 'STAT'));

alter table public.profiles drop constraint if exists profiles_annee_check;
alter table public.profiles add constraint profiles_annee_check check (annee in (1, 2, 3));

-- Un classement = une classe (filière + année), trié par XP
create index if not exists profiles_classe_xp_idx on public.profiles (programme, annee, xp desc);

-- Le trigger d'inscription lit la filière, l'année et la spécialité choisies (user_metadata)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  wanted_username  text := nullif(trim(new.raw_user_meta_data->>'username'), '');
  wanted_programme text := upper(nullif(trim(new.raw_user_meta_data->>'programme'), ''));
  wanted_filiere   text := upper(nullif(trim(new.raw_user_meta_data->>'filiere'), ''));
  wanted_annee     text := nullif(trim(new.raw_user_meta_data->>'annee'), '');
  final_username   text;
  valid_programme  text := 'IG';
  valid_annee      smallint := 3;
  valid_filiere    text := null;   -- spécialité : IG3 uniquement
  initial_theme    text := 'ciel';
begin
  if wanted_programme in ('IG', 'GRH', 'GBA', 'GFC', 'GTL', 'GC', 'PLAN', 'STAT') then
    valid_programme := wanted_programme;
  end if;
  if wanted_annee in ('1', '2', '3') then
    valid_annee := wanted_annee::smallint;
  end if;
  if valid_programme = 'IG' and valid_annee = 3 and wanted_filiere in ('ARI', 'AIP') then
    valid_filiere := wanted_filiere;
  end if;

  initial_theme := case
    when valid_filiere = 'AIP' then 'violet'
    when valid_programme = 'GRH' then 'corail'
    when valid_programme = 'GBA' then 'cyan'
    when valid_programme = 'GFC' then 'emeraude'
    when valid_programme = 'GTL' then 'ambre'
    when valid_programme = 'GC' then 'rose'
    when valid_programme = 'PLAN' then 'ardoise'
    when valid_programme = 'STAT' then 'bordeaux'
    else 'ciel'
  end;

  final_username := coalesce(wanted_username, 'etudiant_' || substr(replace(new.id::text, '-', ''), 1, 6));
  begin
    insert into public.profiles (id, username, filiere, programme, annee)
    values (new.id, final_username, valid_filiere, valid_programme, valid_annee)
    on conflict (id) do update
      set filiere = coalesce(public.profiles.filiere, excluded.filiere);
  exception when unique_violation then
    -- pseudo déjà pris : ajout d'un suffixe unique pour ne jamais bloquer l'inscription
    insert into public.profiles (id, username, filiere, programme, annee)
    values (new.id, left(final_username, 20) || '_' || substr(replace(new.id::text, '-', ''), 1, 5), valid_filiere, valid_programme, valid_annee)
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
