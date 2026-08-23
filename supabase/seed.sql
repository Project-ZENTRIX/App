-- Supabase local seed for Project ZENTRIX
-- Generated from docs/axis/procedure/mvp-stage2--refactor-database
--
-- This file is intentionally conservative:
-- - It avoids guessing auth.user rows or external IDs.
-- - It can be expanded once the local auth bootstrap strategy is finalized.
-- - It is safe to run after the migrations have created the schema.

begin;

-- Demo tenant skeleton for local development.
insert into public.tenants (id, slug, name, status)
values (
  '11111111-1111-1111-1111-111111111111',
  'demo',
  'Demo Tenant',
  'active'
)
on conflict (slug) do nothing;

insert into public.courses (
  id, slug, title, summary, cover, category, language, difficulty, tags, price, currency,
  status, version, version_label, unlock_scope, is_purchased, is_learnable, is_offline,
  supported_languages, chapter_count, lesson_count, task_count, created_at, updated_at
)
values
(
  'course-frontend-foundation',
  'frontend-foundation',
  '前端工程基础课包',
  '覆盖工程化、组件化、状态管理和常见页面开发流程。',
  '/images/courses/frontend-foundation.png',
  'frontend',
  'zh-CN',
  'beginner',
  array['基础', '工程化', 'Web']::text[],
  199.00,
  'CNY',
  'published',
  13,
  'v1.3.0',
  'full',
  true,
  true,
  false,
  array['zh-CN', 'en-GB']::text[],
  2,
  3,
  2,
  '2026-07-01T09:00:00.000Z',
  '2026-08-01T09:00:00.000Z'
),
(
  'course-api-design',
  'api-design',
  'API 设计与后端契约课包',
  '聚焦接口建模、状态字段、分页返回与前后端协作。',
  '/images/courses/api-design.png',
  'backend',
  'zh-CN',
  'intermediate',
  array['API', '契约', 'NestJS']::text[],
  299.00,
  'CNY',
  'published',
  21,
  'v2.1.0',
  'preview',
  false,
  false,
  false,
  array['zh-CN', 'en-GB']::text[],
  3,
  3,
  2,
  '2026-06-15T09:00:00.000Z',
  '2026-08-02T09:00:00.000Z'
)
on conflict (id) do nothing;

insert into public.chapters (
  id, course_id, title, summary, sort_order, status, created_at, updated_at
)
values
(
  'chapter-frontend-1',
  'course-frontend-foundation',
  '工程基础',
  '认识项目结构、工具链和核心规范。',
  0,
  'published',
  '2026-07-01T09:00:00.000Z',
  '2026-08-01T09:00:00.000Z'
),
(
  'chapter-frontend-2',
  'course-frontend-foundation',
  '页面交付',
  '围绕页面开发、状态流与交互收尾。',
  1,
  'published',
  '2026-07-01T09:10:00.000Z',
  '2026-08-01T09:10:00.000Z'
),
(
  'chapter-api-1',
  'course-api-design',
  '领域划分',
  '从资源和职责开始组织接口。',
  0,
  'published',
  '2026-06-15T09:00:00.000Z',
  '2026-08-02T09:00:00.000Z'
),
(
  'chapter-api-2',
  'course-api-design',
  '查询契约',
  '统一分页、过滤和状态返回。',
  1,
  'published',
  '2026-06-15T09:10:00.000Z',
  '2026-08-02T09:10:00.000Z'
),
(
  'chapter-api-3',
  'course-api-design',
  '联调落地',
  '处理边界、错误码和兼容策略。',
  2,
  'published',
  '2026-06-15T09:20:00.000Z',
  '2026-08-02T09:20:00.000Z'
)
on conflict (id) do nothing;

insert into public.lessons (
  id, course_id, chapter_id, title, summary, duration_minutes, sort_order, status, created_at, updated_at
)
values
(
  'lesson-frontend-1',
  'course-frontend-foundation',
  'chapter-frontend-1',
  '项目骨架',
  '建立目录结构与基础约定。',
  20,
  0,
  'published',
  '2026-07-01T09:00:00.000Z',
  '2026-08-01T09:00:00.000Z'
),
(
  'lesson-frontend-2',
  'course-frontend-foundation',
  'chapter-frontend-1',
  '组件系统',
  '封装常用布局与交互组件。',
  35,
  1,
  'published',
  '2026-07-01T09:05:00.000Z',
  '2026-08-01T09:05:00.000Z'
),
(
  'lesson-frontend-3',
  'course-frontend-foundation',
  'chapter-frontend-2',
  '状态管理',
  '处理页面状态与数据流。',
  28,
  0,
  'published',
  '2026-07-01T09:10:00.000Z',
  '2026-08-01T09:10:00.000Z'
),
(
  'lesson-api-1',
  'course-api-design',
  'chapter-api-1',
  '资源与边界',
  '识别核心资源和职责边界。',
  24,
  0,
  'published',
  '2026-06-15T09:00:00.000Z',
  '2026-08-02T09:00:00.000Z'
),
(
  'lesson-api-2',
  'course-api-design',
  'chapter-api-1',
  '分页与筛选',
  '定义通用查询参数和返回格式。',
  30,
  1,
  'published',
  '2026-06-15T09:05:00.000Z',
  '2026-08-02T09:05:00.000Z'
),
(
  'lesson-api-3',
  'course-api-design',
  'chapter-api-2',
  '状态与契约',
  '统一响应结构与状态表达。',
  26,
  0,
  'published',
  '2026-06-15T09:10:00.000Z',
  '2026-08-02T09:10:00.000Z'
)
on conflict (id) do nothing;

insert into public.tasks (
  id, course_id, lesson_id, title, description, type, points, sort_order, status, created_at, updated_at
)
values
(
  'task-frontend-1',
  'course-frontend-foundation',
  'lesson-frontend-1',
  '创建 Web 项目骨架',
  null,
  'implementation',
  10,
  0,
  'published',
  '2026-07-01T09:00:00.000Z',
  '2026-08-01T09:00:00.000Z'
),
(
  'task-frontend-2',
  'course-frontend-foundation',
  'lesson-frontend-2',
  '实现通用组件',
  null,
  'implementation',
  20,
  0,
  'published',
  '2026-07-01T09:05:00.000Z',
  '2026-08-01T09:05:00.000Z'
),
(
  'task-api-1',
  'course-api-design',
  'lesson-api-1',
  '梳理资源边界',
  null,
  'analysis',
  12,
  0,
  'published',
  '2026-06-15T09:00:00.000Z',
  '2026-08-02T09:00:00.000Z'
),
(
  'task-api-2',
  'course-api-design',
  'lesson-api-2',
  '统一查询协议',
  null,
  'analysis',
  18,
  0,
  'published',
  '2026-06-15T09:05:00.000Z',
  '2026-08-02T09:05:00.000Z'
)
on conflict (id) do nothing;

insert into public.content_assets (
  id, course_id, lesson_id, task_id, file_name, mime_type, url, metadata, created_at
)
values
(
  'asset-frontend-1',
  'course-frontend-foundation',
  'lesson-frontend-1',
  'task-frontend-1',
  '项目骨架参考图.png',
  'image/png',
  '/images/courses/frontend-foundation.png',
  '{"title":"项目骨架参考图","type":"image","version":"1.0.0","sizeLabel":"1.2 MB","status":"published"}'::jsonb,
  '2026-07-01T09:00:00.000Z'
),
(
  'asset-frontend-2',
  'course-frontend-foundation',
  'lesson-frontend-2',
  'task-frontend-2',
  '通用组件清单.pdf',
  'application/pdf',
  '/files/courses/frontend-components.pdf',
  '{"title":"通用组件清单","type":"document","version":"1.1.0","sizeLabel":"180 KB","status":"published"}'::jsonb,
  '2026-07-01T09:05:00.000Z'
),
(
  'asset-api-1',
  'course-api-design',
  'lesson-api-1',
  'task-api-1',
  '资源分层说明.pdf',
  'application/pdf',
  '/files/courses/api-resource-map.pdf',
  '{"title":"资源分层说明","type":"document","version":"1.0.0","sizeLabel":"96 KB","status":"published"}'::jsonb,
  '2026-06-15T09:00:00.000Z'
),
(
  'asset-api-2',
  'course-api-design',
  'lesson-api-2',
  'task-api-2',
  '查询协议示例.pdf',
  'application/pdf',
  '/files/courses/api-query-contract.pdf',
  '{"title":"查询协议示例","type":"document","version":"1.0.1","sizeLabel":"112 KB","status":"published"}'::jsonb,
  '2026-06-15T09:05:00.000Z'
)
on conflict (id) do nothing;

insert into public.products (
  id, course_id, code, name, description, status, price, currency, deleted_at, created_at, updated_at
)
values
(
  'product-frontend-foundation',
  'course-frontend-foundation',
  'course-frontend-foundation-pro',
  '前端工程基础课包',
  '覆盖工程化、组件化、状态管理和常见页面开发流程。',
  'published',
  199.00,
  'CNY',
  null,
  '2026-07-01T09:00:00.000Z',
  '2026-08-01T09:00:00.000Z'
),
(
  'product-api-design',
  'course-api-design',
  'course-api-design-pro',
  'API 设计与后端契约课包',
  '聚焦接口建模、状态字段、分页返回与前后端协作。',
  'published',
  299.00,
  'CNY',
  null,
  '2026-06-15T09:00:00.000Z',
  '2026-08-02T09:00:00.000Z'
)
on conflict (id) do nothing;

commit;
