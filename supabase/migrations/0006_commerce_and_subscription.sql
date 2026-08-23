create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  course_id uuid null references public.courses(id) on delete set null,
  code text not null unique,
  name text not null,
  description text null,
  status public.content_status not null default 'draft',
  price numeric(12,2) not null,
  currency text not null default 'CNY',
  deleted_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_no text not null unique,
  status public.order_status not null default 'pending',
  total_amount numeric(12,2) not null,
  currency text not null default 'CNY',
  deleted_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid null references public.products(id) on delete set null,
  name text not null,
  quantity integer not null default 1,
  unit_price numeric(12,2) not null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz null
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid null references public.orders(id) on delete set null,
  payment_no text not null unique,
  status public.payment_status not null default 'initiated',
  amount numeric(12,2) not null,
  currency text not null default 'CNY',
  provider text null,
  external_ref text null,
  gateway_txn_id text null unique,
  deleted_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid null references public.products(id) on delete set null,
  order_id uuid null references public.orders(id) on delete set null,
  status public.subscription_status not null default 'active',
  started_at timestamptz not null default now(),
  ends_at timestamptz null,
  deleted_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
