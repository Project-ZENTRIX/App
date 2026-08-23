const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const test = require("node:test");

function readMigration(filename) {
    return readFileSync(resolve(process.cwd(), "supabase", "migrations", filename), "utf8");
}

test("user sessions migration creates the public session table", () => {
    const sql = readMigration("0021_user_sessions.sql");

    assert.match(sql, /create table if not exists public\.user_sessions/);
    assert.match(sql, /id text primary key/);
    assert.match(sql, /user_id uuid not null references auth\.users\(id\) on delete cascade/);
    assert.match(sql, /expires_at timestamptz null/);
    assert.match(sql, /revoked_at timestamptz null/);
    assert.doesNotMatch(sql, /grant select, insert, update, delete on table public\.user_sessions to service_role;/);
});
