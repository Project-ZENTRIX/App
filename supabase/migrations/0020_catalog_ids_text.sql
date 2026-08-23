begin;

alter table public.order_items drop constraint if exists order_items_product_id_fkey;
alter table public.subscriptions drop constraint if exists subscriptions_product_id_fkey;

drop policy if exists chapters_public_read on public.chapters;
drop policy if exists lessons_public_read on public.lessons;
drop policy if exists tasks_public_read on public.tasks;
drop policy if exists content_assets_public_read on public.content_assets;
drop policy if exists products_public_read on public.products;
drop policy if exists achievements_public_read on public.achievements;
drop policy if exists levels_public_read on public.levels;

alter table public.products drop constraint if exists products_course_id_fkey;
alter table public.content_assets drop constraint if exists content_assets_course_id_fkey;
alter table public.content_assets drop constraint if exists content_assets_lesson_id_fkey;
alter table public.content_assets drop constraint if exists content_assets_task_id_fkey;
alter table public.tasks drop constraint if exists tasks_course_id_fkey;
alter table public.tasks drop constraint if exists tasks_lesson_id_fkey;
alter table public.lessons drop constraint if exists lessons_course_id_fkey;
alter table public.lessons drop constraint if exists lessons_chapter_id_fkey;
alter table public.chapters drop constraint if exists chapters_course_id_fkey;
alter table public.enrollments drop constraint if exists enrollments_course_id_fkey;
alter table public.lesson_progress drop constraint if exists lesson_progress_lesson_id_fkey;
alter table public.progress_events drop constraint if exists progress_events_course_id_fkey;
alter table public.progress_events drop constraint if exists progress_events_lesson_id_fkey;
alter table public.progress_events drop constraint if exists progress_events_task_id_fkey;
alter table public.task_submissions drop constraint if exists task_submissions_task_id_fkey;
alter table public.runs drop constraint if exists runs_task_id_fkey;

alter table public.courses alter column id drop default;
alter table public.products alter column id drop default;

alter table public.courses alter column id type text using id::text;
alter table public.chapters alter column id type text using id::text;
alter table public.chapters alter column course_id type text using course_id::text;
alter table public.lessons alter column id type text using id::text;
alter table public.lessons alter column course_id type text using course_id::text;
alter table public.lessons alter column chapter_id type text using chapter_id::text;
alter table public.tasks alter column id type text using id::text;
alter table public.tasks alter column course_id type text using course_id::text;
alter table public.tasks alter column lesson_id type text using lesson_id::text;
alter table public.content_assets alter column id type text using id::text;
alter table public.content_assets alter column course_id type text using course_id::text;
alter table public.content_assets alter column lesson_id type text using lesson_id::text;
alter table public.content_assets alter column task_id type text using task_id::text;
alter table public.products alter column id type text using id::text;
alter table public.products alter column course_id type text using course_id::text;
alter table public.enrollments alter column course_id type text using course_id::text;
alter table public.lesson_progress alter column lesson_id type text using lesson_id::text;
alter table public.progress_events alter column course_id type text using course_id::text;
alter table public.progress_events alter column lesson_id type text using lesson_id::text;
alter table public.progress_events alter column task_id type text using task_id::text;
alter table public.task_submissions alter column task_id type text using task_id::text;
alter table public.runs alter column task_id type text using task_id::text;
alter table public.order_items alter column product_id type text using product_id::text;
alter table public.subscriptions alter column product_id type text using product_id::text;

alter table public.chapters
    add constraint chapters_course_id_fkey foreign key (course_id) references public.courses(id) on delete cascade;

alter table public.lessons
    add constraint lessons_course_id_fkey foreign key (course_id) references public.courses(id) on delete cascade;
alter table public.lessons
    add constraint lessons_chapter_id_fkey foreign key (chapter_id) references public.chapters(id) on delete set null;

alter table public.tasks
    add constraint tasks_course_id_fkey foreign key (course_id) references public.courses(id) on delete cascade;
alter table public.tasks
    add constraint tasks_lesson_id_fkey foreign key (lesson_id) references public.lessons(id) on delete set null;

alter table public.content_assets
    add constraint content_assets_course_id_fkey foreign key (course_id) references public.courses(id) on delete set null;
alter table public.content_assets
    add constraint content_assets_lesson_id_fkey foreign key (lesson_id) references public.lessons(id) on delete set null;
alter table public.content_assets
    add constraint content_assets_task_id_fkey foreign key (task_id) references public.tasks(id) on delete set null;

alter table public.products
    add constraint products_course_id_fkey foreign key (course_id) references public.courses(id) on delete set null;

alter table public.enrollments
    add constraint enrollments_course_id_fkey foreign key (course_id) references public.courses(id) on delete cascade;

alter table public.lesson_progress
    add constraint lesson_progress_lesson_id_fkey foreign key (lesson_id) references public.lessons(id) on delete cascade;

alter table public.progress_events
    add constraint progress_events_course_id_fkey foreign key (course_id) references public.courses(id) on delete set null;
alter table public.progress_events
    add constraint progress_events_lesson_id_fkey foreign key (lesson_id) references public.lessons(id) on delete set null;
alter table public.progress_events
    add constraint progress_events_task_id_fkey foreign key (task_id) references public.tasks(id) on delete set null;

alter table public.task_submissions
    add constraint task_submissions_task_id_fkey foreign key (task_id) references public.tasks(id) on delete cascade;

alter table public.runs
    add constraint runs_task_id_fkey foreign key (task_id) references public.tasks(id) on delete cascade;

alter table public.order_items
    add constraint order_items_product_id_fkey foreign key (product_id) references public.products(id) on delete set null;

alter table public.subscriptions
    add constraint subscriptions_product_id_fkey foreign key (product_id) references public.products(id) on delete set null;

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

commit;
