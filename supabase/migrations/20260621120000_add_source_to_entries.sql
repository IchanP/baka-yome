-- Add a "source" classifier to entries: what kind of media the session was.
--
-- Forward-only migration: 20260607120000_create_entries is already applied, so
-- we add the column here rather than editing applied history. Plain SQL,
-- language-neutral, consistent with the create migration.

alter table public.entries
  add column source text not null default 'other'
  check (
    source in (
      'novel', 'manga', 'visual_novel',
      'anime', 'youtube', 'podcast',
      'other'
    )
  );

-- The default only exists to backfill any rows that predate this migration.
-- New inserts must specify a source explicitly (the app always does), so drop
-- it to keep the column's intent honest.
alter table public.entries
  alter column source drop default;
