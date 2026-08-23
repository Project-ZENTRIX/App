alter table public.chapters enable row level security;
alter table public.lessons enable row level security;
alter table public.tasks enable row level security;
alter table public.content_assets enable row level security;
alter table public.products enable row level security;
alter table public.achievements enable row level security;
alter table public.levels enable row level security;

drop policy if exists chapters_public_read on public.chapters;
drop policy if exists lessons_public_read on public.lessons;
drop policy if exists tasks_public_read on public.tasks;
drop policy if exists content_assets_public_read on public.content_assets;
drop policy if exists products_public_read on public.products;
drop policy if exists achievements_public_read on public.achievements;
drop policy if exists levels_public_read on public.levels;

create policy chapters_public_read on public.chapters
for select
to anon, authenticated
using (
  status = 'published'
  and exists (
    select 1
    from public.courses c
    where c.id = course_id
      and c.status = 'published'
  )
);

create policy lessons_public_read on public.lessons
for select
to anon, authenticated
using (
  status = 'published'
  and exists (
    select 1
    from public.courses c
    where c.id = course_id
      and c.status = 'published'
  )
);

create policy tasks_public_read on public.tasks
for select
to anon, authenticated
using (
  status = 'published'
  and exists (
    select 1
    from public.courses c
    where c.id = course_id
      and c.status = 'published'
  )
);

create policy content_assets_public_read on public.content_assets
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.courses c
    where c.id = course_id
      and c.status = 'published'
  )
  or exists (
    select 1
    from public.lessons l
    join public.courses c on c.id = l.course_id
    where l.id = lesson_id
      and l.status = 'published'
      and c.status = 'published'
  )
  or exists (
    select 1
    from public.tasks t
    join public.courses c on c.id = t.course_id
    where t.id = task_id
      and t.status = 'published'
      and c.status = 'published'
  )
);

create policy products_public_read on public.products
for select
to anon, authenticated
using (
  status = 'published'
  and deleted_at is null
);

create policy achievements_public_read on public.achievements
for select
to anon, authenticated
using (
  deleted_at is null
);

create policy levels_public_read on public.levels
for select
to anon, authenticated
using (
  deleted_at is null
);
