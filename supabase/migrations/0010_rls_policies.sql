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
