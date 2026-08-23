const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const test = require("node:test");

function readMigration(filename) {
    return readFileSync(resolve(process.cwd(), "supabase", "migrations", filename), "utf8");
}

test("user sessions access migration grants service role CRUD", () => {
    const sql = readMigration("0022_user_sessions_access.sql");

    assert.match(sql, /grant select, insert, update, delete on table public\.user_sessions to service_role;/);
    assert.doesNotMatch(sql, /to anon\b/);
    assert.doesNotMatch(sql, /to authenticated\b/);
});
