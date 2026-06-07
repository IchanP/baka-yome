-- Immersion entries: one row per logged reading/listening session.
--
-- Plain SQL on purpose: migrations stay language-neutral so the future
-- (non-TypeScript) backend can keep using the same schema without an
-- ORM-specific migration format.

create table if not exists public.entries (
  id          uuid primary key default gen_random_uuid(),
  -- Nullable for now: logging works without auth wired up. Once auth lands,
  -- new rows carry the authenticated user's id.
  user_id     uuid references auth.users (id) on delete cascade,
  kind        text not null check (kind in ('reading', 'listening')),
  title       text,
  occurred_on date not null default current_date,
  characters  integer check (characters is null or characters >= 0),
  minutes     integer check (minutes is null or minutes >= 0),
  created_at  timestamptz not null default now()
);

-- Supports the common "this user's entries, by day" access pattern (heatmap,
-- recent sessions, streaks).
create index if not exists entries_user_occurred_idx
  on public.entries (user_id, occurred_on desc);

-- Enable RLS with no policies: the table is reachable only via the service-role
-- key (which bypasses RLS) from our server layer. When direct client access is
-- wanted later, add per-user SELECT/INSERT policies here.
alter table public.entries enable row level security;
