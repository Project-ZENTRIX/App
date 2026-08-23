create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid null references public.tenants(id) on delete set null,
  slug text not null unique,
  title text not null,
  summary text null,
  cover text null,
  category text null,
  language text null,
  difficulty text null,
  tags text[] not null default '{}'::text[],
  price numeric(12,2) not null default 0,
  currency text not null default 'CNY',
  status public.content_status not null default 'draft',
  version integer not null default 1,
  version_label text null,
  unlock_scope text not null default 'none',
  is_purchased boolean not null default false,
  is_learnable boolean not null default false,
  is_offline boolean not null default false,
  supported_languages text[] not null default '{}'::text[],
  chapter_count integer not null default 0,
  lesson_count integer not null default 0,
  task_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chapters (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  summary text null,
  sort_order integer not null default 0,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  chapter_id uuid null references public.chapters(id) on delete set null,
  title text not null,
  summary text null,
  duration_minutes integer not null default 0,
  sort_order integer not null default 0,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  lesson_id uuid null references public.lessons(id) on delete set null,
  title text not null,
  description text null,
  type text null,
  points integer not null default 0,
  sort_order integer not null default 0,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_assets (
  id uuid primary key default gen_random_uuid(),
  course_id uuid null references public.courses(id) on delete set null,
  lesson_id uuid null references public.lessons(id) on delete set null,
  task_id uuid null references public.tasks(id) on delete set null,
  file_name text not null,
  mime_type text null,
  url text not null,
  metadata jsonb null,
  created_at timestamptz not null default now()
);
