const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const test = require("node:test");

function readMigration(filename) {
    return readFileSync(resolve(process.cwd(), "supabase", "migrations", filename), "utf8");
}

test("public anon migration only defines anonymous read policies", () => {
    const sql = readMigration("0018_public_anon_rls.sql");

    for (const policy of [
        "chapters_public_read",
        "lessons_public_read",
        "tasks_public_read",
        "content_assets_public_read",
        "products_public_read",
        "achievements_public_read",
        "levels_public_read",
    ]) {
        assert.match(sql, new RegExp(`create policy ${policy}`));
    }

    assert.match(sql, /to anon, authenticated/);
    assert.doesNotMatch(sql, /service_role/);
});

test("service role migration grants CRUD on every public table", () => {
    const sql = readMigration("0019_service_role_grants.sql");

    const tables = [
        "tenants",
        "tenant_memberships",
        "profiles",
        "notification_preferences",
        "user_roles",
        "courses",
        "chapters",
        "lessons",
        "tasks",
        "content_assets",
        "enrollments",
        "lesson_progress",
        "progress_events",
        "task_submissions",
        "runs",
        "run_logs",
        "judgements",
        "products",
        "orders",
        "order_items",
        "payments",
        "subscriptions",
        "devices",
        "desktop_licenses",
        "device_bindings",
        "license_events",
        "achievements",
        "levels",
        "audit_logs",
        "integration_clients",
        "feature_flags",
        "sandbox_jobs",
        "user_achievements",
        "user_level_progress",
    ];

    for (const table of tables) {
        assert.match(sql, new RegExp(`grant select, insert, update, delete on table public\\.${table} to service_role;`));
    }

    assert.doesNotMatch(sql, /to anon\b/);
    assert.doesNotMatch(sql, /create policy/i);
});
