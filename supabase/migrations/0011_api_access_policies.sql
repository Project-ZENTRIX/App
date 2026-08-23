alter table public.profiles enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.tenants enable row level security;
alter table public.tenant_memberships enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.task_submissions enable row level security;
alter table public.runs enable row level security;
alter table public.orders enable row level security;
alter table public.payments enable row level security;
alter table public.desktop_licenses enable row level security;
alter table public.device_bindings enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists profiles_self_read on public.profiles;
drop policy if exists profiles_self_update on public.profiles;
drop policy if exists notification_preferences_self_read on public.notification_preferences;
drop policy if exists notification_preferences_self_write on public.notification_preferences;
drop policy if exists tenants_self_read on public.tenants;
drop policy if exists tenant_memberships_self_read on public.tenant_memberships;
drop policy if exists tenant_memberships_self_write on public.tenant_memberships;
drop policy if exists enrollments_self_read on public.enrollments;
drop policy if exists enrollments_self_write on public.enrollments;
drop policy if exists lesson_progress_self_read on public.lesson_progress;
drop policy if exists lesson_progress_self_write on public.lesson_progress;
drop policy if exists task_submissions_self_read on public.task_submissions;
drop policy if exists task_submissions_self_write on public.task_submissions;
drop policy if exists runs_self_read on public.runs;
drop policy if exists payments_self_read on public.payments;
drop policy if exists orders_self_read on public.orders;
drop policy if exists desktop_licenses_self_read on public.desktop_licenses;
drop policy if exists device_bindings_self_read on public.device_bindings;
drop policy if exists audit_logs_self_read on public.audit_logs;

create policy profiles_self_read on public.profiles
for select
using (id = auth.uid());

create policy profiles_self_update on public.profiles
for update
using (id = auth.uid())
with check (id = auth.uid());

create policy notification_preferences_self_read on public.notification_preferences
for select
using (user_id = auth.uid());

create policy notification_preferences_self_write on public.notification_preferences
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy tenants_self_read on public.tenants
for select
using (public.is_tenant_member(id));

create policy tenant_memberships_self_read on public.tenant_memberships
for select
using (user_id = auth.uid());

create policy tenant_memberships_self_write on public.tenant_memberships
for insert
with check (user_id = auth.uid());

create policy enrollments_self_read on public.enrollments
for select
using (user_id = auth.uid());

create policy enrollments_self_write on public.enrollments
for insert
with check (user_id = auth.uid());

create policy lesson_progress_self_read on public.lesson_progress
for select
using (user_id = auth.uid());

create policy lesson_progress_self_write on public.lesson_progress
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy task_submissions_self_read on public.task_submissions
for select
using (user_id = auth.uid());

create policy task_submissions_self_write on public.task_submissions
for insert
with check (user_id = auth.uid());

create policy runs_self_read on public.runs
for select
using (user_id = auth.uid());

create policy payments_self_read on public.payments
for select
using (user_id = auth.uid());

create policy orders_self_read on public.orders
for select
using (user_id = auth.uid());

create policy desktop_licenses_self_read on public.desktop_licenses
for select
using (user_id = auth.uid());

create policy device_bindings_self_read on public.device_bindings
for select
using (user_id = auth.uid());

create policy audit_logs_self_read on public.audit_logs
for select
using (user_id = auth.uid());

revoke execute on function public.handle_new_user() from anon, authenticated;
revoke execute on function public.is_tenant_member(uuid) from anon, authenticated;
revoke execute on function public.has_tenant_role(uuid, text[]) from anon, authenticated;
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.is_tenant_member(uuid) from public;
revoke execute on function public.has_tenant_role(uuid, text[]) from public;
