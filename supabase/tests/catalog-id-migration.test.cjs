const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const test = require("node:test");

function readMigration(filename) {
    return readFileSync(resolve(process.cwd(), "supabase", "migrations", filename), "utf8");
}

test("catalog id migration converts seeded catalog and commerce keys to text", () => {
    const sql = readMigration("0020_catalog_ids_text.sql");

    for (const table of [
        "courses",
        "chapters",
        "lessons",
        "tasks",
        "content_assets",
        "products",
        "enrollments",
        "lesson_progress",
        "progress_events",
        "task_submissions",
        "runs",
        "order_items",
        "subscriptions",
    ]) {
        assert.match(sql, new RegExp(`alter table public\\.${table} alter column`));
        assert.match(sql, new RegExp(`alter table public\\.${table} alter column .*type text using`));
    }

    for (const table of ["courses", "products"]) {
        assert.match(sql, new RegExp(`alter table public\\.${table} alter column id drop default;`));
    }

    for (const constraint of [
        "chapters_course_id_fkey",
        "lessons_course_id_fkey",
        "lessons_chapter_id_fkey",
        "tasks_course_id_fkey",
        "tasks_lesson_id_fkey",
        "content_assets_course_id_fkey",
        "content_assets_lesson_id_fkey",
        "content_assets_task_id_fkey",
        "products_course_id_fkey",
        "enrollments_course_id_fkey",
        "lesson_progress_lesson_id_fkey",
        "progress_events_course_id_fkey",
        "progress_events_lesson_id_fkey",
        "progress_events_task_id_fkey",
        "task_submissions_task_id_fkey",
        "runs_task_id_fkey",
        "order_items_product_id_fkey",
        "subscriptions_product_id_fkey",
    ]) {
        assert.match(sql, new RegExp(`drop constraint if exists ${constraint}`));
    }

    for (const policy of [
        "chapters_public_read",
        "lessons_public_read",
        "tasks_public_read",
        "content_assets_public_read",
        "products_public_read",
        "achievements_public_read",
        "levels_public_read",
    ]) {
        assert.match(sql, new RegExp(`drop policy if exists ${policy}`));
        assert.match(sql, new RegExp(`create policy ${policy}`));
    }

    assert.match(sql, /add constraint chapters_course_id_fkey foreign key \(course_id\) references public\.courses\(id\) on delete cascade;/);
    assert.match(sql, /add constraint lessons_chapter_id_fkey foreign key \(chapter_id\) references public\.chapters\(id\) on delete set null;/);
    assert.match(sql, /add constraint content_assets_task_id_fkey foreign key \(task_id\) references public\.tasks\(id\) on delete set null;/);
    assert.match(sql, /add constraint order_items_product_id_fkey foreign key \(product_id\) references public\.products\(id\) on delete set null;/);
});
