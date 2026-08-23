create table if not exists public.user_sessions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz null,
  revoked_at timestamptz null,
  ip_address text null,
  user_agent text null
);
