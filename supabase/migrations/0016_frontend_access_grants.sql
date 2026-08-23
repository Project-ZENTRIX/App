grant select, insert, update on table public.profiles to authenticated;
grant select, insert, update on table public.notification_preferences to authenticated;

grant select on table public.audit_logs to authenticated;
grant select on table public.enrollments to authenticated;
grant select on table public.lesson_progress to authenticated;
grant select on table public.progress_events to authenticated;
grant select on table public.orders to authenticated;
grant select on table public.order_items to authenticated;
grant select on table public.payments to authenticated;
grant select on table public.subscriptions to authenticated;
grant select on table public.desktop_licenses to authenticated;
grant select on table public.device_bindings to authenticated;
grant select on table public.devices to authenticated;
grant select on table public.license_events to authenticated;
grant select on table public.user_achievements to authenticated;
grant select on table public.user_level_progress to authenticated;

grant select on table public.courses to anon, authenticated;
grant select on table public.chapters to anon, authenticated;
grant select on table public.lessons to anon, authenticated;
grant select on table public.tasks to anon, authenticated;
grant select on table public.content_assets to anon, authenticated;
grant select on table public.products to anon, authenticated;
grant select on table public.achievements to anon, authenticated;
grant select on table public.levels to anon, authenticated;
