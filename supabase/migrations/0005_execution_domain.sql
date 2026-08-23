create table if not exists public.task_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  status public.run_status not null default 'queued',
  code text null,
  language text null,
  run_id uuid null unique,
  submitted_at timestamptz not null default now(),
  evaluated_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  status public.run_status not null default 'queued',
  input text null,
  output text null,
  error text null,
  runtime_ms integer null,
  memory_kb integer null,
  started_at timestamptz null,
  finished_at timestamptz null,
  submitted_at timestamptz null,
  deleted_at timestamptz null,
  created_at timestamptz not null default now()
);

create table if not exists public.run_logs (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.runs(id) on delete cascade,
  level text not null,
  message text not null,
  created_at timestamptz not null default now(),
  archived_at timestamptz null
);

create table if not exists public.judgements (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null unique references public.runs(id) on delete cascade,
  status text not null default 'pending',
  score integer null,
  feedback text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
