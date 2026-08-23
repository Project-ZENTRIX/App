# 07. SQL Migration 草案

## 1. 说明

以下 SQL 是迁移设计草案，目标是让后续真正写入 `supabase/migrations/*.sql` 时有清晰骨架。

- 表结构按域拆分
- 先 bootstrap，再 auth/profile，再业务表，再 RLS
- UUID、timestamp、check constraint 和 foreign key 都尽量前置

---

## 2. 0001_bootstrap.sql

```sql
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

do $$
begin
  create type public.user_status as enum ('active', 'suspended', 'deleted');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.content_status as enum ('draft', 'published', 'archived');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.enrollment_status as enum ('active', 'paused', 'completed', 'cancelled');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.progress_status as enum ('not_started', 'in_progress', 'submitted', 'passed', 'failed', 'completed');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.run_status as enum ('queued', 'running', 'succeeded', 'failed', 'timeout', 'cancelled');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.order_status as enum ('pending', 'paid', 'failed', 'cancelled', 'refunded');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.payment_status as enum ('initiated', 'processing', 'succeeded', 'failed', 'reversed');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.subscription_status as enum ('active', 'suspended', 'revoked', 'expired');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.license_status as enum ('active', 'suspended', 'revoked', 'expired');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  status text not null default 'active',
  created_by uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tenant_memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null,
  role text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  unique (tenant_id, user_id)
);
```

---

## 3. 0002_auth_profiles.sql

```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid null references public.tenants(id) on delete set null,
  display_name text not null,
  avatar_url text null,
  bio text null,
  status public.user_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email boolean not null default true,
  sms boolean not null default false,
  in_app boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role_code text not null,
  created_at timestamptz not null default now(),
  unique (user_id, role_code)
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.email)
  )
  on conflict (id) do nothing;

  insert into public.notification_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;
```

---

## 4. 0003_content_catalog.sql

```sql
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
```

---

## 5. 0004_learning_and_progress.sql

```sql
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  status public.enrollment_status not null default 'active',
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz null,
  unique (user_id, course_id)
);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  status public.progress_status not null default 'not_started',
  progress integer not null default 0,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create table if not exists public.progress_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tenant_id uuid null references public.tenants(id) on delete set null,
  course_id uuid null references public.courses(id) on delete set null,
  lesson_id uuid null references public.lessons(id) on delete set null,
  task_id uuid null references public.tasks(id) on delete set null,
  event_type text not null,
  payload jsonb null,
  created_at timestamptz not null default now()
);
```

---

## 6. 0005_execution_domain.sql

```sql
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
```

---

## 7. 0006_commerce_and_subscription.sql

```sql
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
```

---

## 8. 0007_devices_and_licenses.sql

```sql
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
```

---

## 9. 0008_admin_and_audit.sql

```sql
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text null,
  deleted_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.levels (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  rank integer not null unique,
  deleted_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid null references public.tenants(id) on delete set null,
  user_id uuid null references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text null,
  payload jsonb null,
  deleted_at timestamptz null,
  created_at timestamptz not null default now()
);

create table if not exists public.integration_clients (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  secret_hash text null,
  deleted_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.feature_flags (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  enabled boolean not null default false,
  payload jsonb null,
  deleted_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

---

## 10. 0009_rls_helpers.sql

```sql
create or replace function public.is_tenant_member(p_tenant_id uuid)
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1
    from public.tenant_memberships tm
    where tm.tenant_id = p_tenant_id
      and tm.user_id = auth.uid()
      and tm.status = 'active'
  );
$$;

create or replace function public.has_tenant_role(p_tenant_id uuid, p_roles text[])
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1
    from public.tenant_memberships tm
    where tm.tenant_id = p_tenant_id
      and tm.user_id = auth.uid()
      and tm.status = 'active'
      and tm.role = any (p_roles)
  );
$$;
```

---

## 11. 0010_rls_policies.sql

```sql
alter table public.profiles enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.tenants enable row level security;
alter table public.tenant_memberships enable row level security;
alter table public.courses enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.task_submissions enable row level security;
alter table public.runs enable row level security;
alter table public.orders enable row level security;
alter table public.payments enable row level security;
alter table public.desktop_licenses enable row level security;
alter table public.device_bindings enable row level security;
alter table public.audit_logs enable row level security;

create policy "profiles_self_read" on public.profiles
for select using (id = auth.uid());

create policy "profiles_self_update" on public.profiles
for update using (id = auth.uid());

create policy "courses_public_read" on public.courses
for select using (status = 'published' or public.is_tenant_member(tenant_id));

create policy "orders_self_read" on public.orders
for select using (user_id = auth.uid());

create policy "orders_self_write" on public.orders
for insert with check (user_id = auth.uid());
```

---

## 12. 下一步

- 把以上草案拆成真正的 `supabase/migrations/*.sql`
- 为每个 migration 增加回放测试
- 先验证 `profiles`、`tenant_memberships` 和 `courses` 的 RLS
- 再扩展到订单、授权、运行和审计域
