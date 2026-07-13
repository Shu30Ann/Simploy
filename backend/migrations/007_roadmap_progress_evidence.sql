-- Career GPS Phase 3E: progress evidence metadata.
-- Non-destructive migration: adds an optional evidence URL to persisted roadmap progress.

alter table public.roadmap_progress
  add column if not exists evidence_url text;
