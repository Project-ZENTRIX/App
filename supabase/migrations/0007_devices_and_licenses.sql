create table if not exists public.devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  device_key text not null unique,
  name text null,
  platform text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.desktop_licenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  license_key text not null unique,
  status public.license_status not null default 'active',
  max_devices integer not null default 1,
  max_primary_devices integer not null default 1,
  issued_at timestamptz not null default now(),
  expires_at timestamptz null,
  deleted_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.device_bindings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  desktop_license_id uuid not null references public.desktop_licenses(id) on delete cascade,
  device_id uuid not null references public.devices(id) on delete cascade,
  binding_key text not null unique,
  device_fingerprint text null,
  device_slot integer not null default 1,
  is_primary boolean not null default false,
  bound_at timestamptz not null default now(),
  revoked_at timestamptz null,
  deleted_at timestamptz null,
  unique (desktop_license_id, device_id),
  unique (desktop_license_id, device_fingerprint),
  unique (desktop_license_id, device_slot)
);

create table if not exists public.license_events (
  id uuid primary key default gen_random_uuid(),
  desktop_license_id uuid not null references public.desktop_licenses(id) on delete cascade,
  event_type text not null,
  payload jsonb null,
  created_at timestamptz not null default now(),
  archived_at timestamptz null
);
