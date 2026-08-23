const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const test = require("node:test");

function readMigration(filename) {
    return readFileSync(resolve(process.cwd(), "supabase", "migrations", filename), "utf8");
}

test("tenant function access migration restores execute grants for public policies", () => {
    const sql = readMigration("0023_tenant_function_access.sql");

    assert.match(sql, /grant execute on function public\.is_tenant_member\(uuid\) to anon, authenticated;/);
    assert.match(sql, /grant execute on function public\.has_tenant_role\(uuid, text\[\]\) to anon, authenticated;/);
});
