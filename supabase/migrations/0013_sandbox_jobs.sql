create table if not exists public.sandbox_jobs (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null unique references public.runs(id) on delete cascade,
  status public.run_status not null default 'queued',
  retry_count integer not null default 0,
  queue_name text null,
  resource_limit jsonb null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null
);
