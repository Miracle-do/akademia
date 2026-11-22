-- Notifications : boîte de réception, rappels d'inactivité, mémoire des nouveautés de contenu.
-- À exécuter une fois dans Supabase (SQL Editor). Sans danger si relancé.

-- 1) Boîte de réception (écrite et lue uniquement par le backend, avec la clé service)
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  kind        text not null,
  title       text not null,
  body        text not null,
  url         text not null default '/',
  tag         text,
  created_at  timestamptz not null default now(),
  read_at     timestamptz
);
create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);
create index if not exists notifications_tag_idx on public.notifications (user_id, tag) where read_at is null;
alter table public.notifications enable row level security;
revoke all on public.notifications from anon, authenticated;
grant all on public.notifications to service_role;

-- 2) Étape du dernier rappel d'inactivité envoyé à chaque utilisateur
create table if not exists public.reminder_state (
  user_id          uuid primary key references auth.users(id) on delete cascade,
  stage            int not null default 0,
  last_reminder_at timestamptz
);
alter table public.reminder_state enable row level security;
revoke all on public.reminder_state from anon, authenticated;
grant all on public.reminder_state to service_role;

-- 3) Petite mémoire clé/valeur du backend (liste du contenu déjà annoncé)
create table if not exists public.app_kv (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.app_kv enable row level security;
revoke all on public.app_kv from anon, authenticated;
grant all on public.app_kv to service_role;
