---
name: use-orm
description: Use when writing, reviewing, or refactoring application database-access code in a project that uses (or should adopt) an ORM. Enforces that application database operations go through the ORM by default — not hand-written SQL strings. Covers CRUD, filtering, relations, transactions, and migrations. Does NOT apply when the user explicitly asks for raw SQL itself (DBA work, SQL teaching, ad-hoc analysis, one-off data exports) — deliver what they asked for. Trigger keywords include "ORM", "model", "schema", "migration", "database access layer", "repository", "transaction".
---

# Use ORM for All Database Operations

All database access in this project follows one non-negotiable rule:

> **Every database operation — reads, writes, schema changes, and transactions — MUST go through the project's ORM. Raw SQL strings are forbidden except in explicitly documented escape hatches.**

This rule governs the **default** choice for application code; it does not override an explicit user request. If the user explicitly asks for raw SQL, comply — briefly note the project's ORM policy in one sentence and offer the ORM equivalent, but deliver the SQL they asked for. Standalone SQL work (query tuning, DBA tasks, teaching, ad-hoc analysis, data exports) is out of this skill's scope entirely.

---

## Step 0 — Identify the ORM in Use (MANDATORY FIRST STEP)

**Before writing a single line of database code, you MUST determine which ORM the project uses.**

### 1. Search the project first

Inspect the project's dependency manifests and existing source files:

- `package.json`, `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`
- `requirements.txt`, `pyproject.toml`, `Pipfile`, `poetry.lock`
- `go.mod`, `Cargo.toml`, `pom.xml`, `build.gradle`, `Gemfile`, `composer.json`
- Any existing model/entity/schema files already in the codebase

Look for imports or dependencies that indicate an ORM is already installed and in use.

### 2. If an ORM is detected

Use it — do not introduce a second one. Check the installed **version** in the lockfile/manifest, and verify version-specific API details against existing usage in the codebase first, then the ORM's official documentation (via WebFetch/WebSearch) when unsure. Prefer these sources over training-time knowledge for APIs that change between versions; if documentation is unreachable, proceed with well-established, stable APIs and note the uncertainty — do not pause the task.

### 3. If no ORM is detected

**Ask the user before proceeding.** Do not assume or pick one silently.

Use the AskUserQuestion tool (or ask directly in your reply) to confirm:

- What language/framework is this project using (if not already clear from the codebase)?
- Which ORM would they like to use? (offer popular options for their stack if they are unsure)

If the user is unsure, use WebSearch to find the most popular ORM options for their specific stack and present the results to the user for a decision.

**Never pick an ORM without the user's explicit confirmation.** If the user prefers no ORM at all, respect that decision and apply the parameterised-query practices from the escape-hatch section to all queries instead.

### 4. After the ORM is confirmed

Verify any API details you are not certain about against the installed version's documentation or existing code in the repo before writing the implementation.

---

## Why ORM-Only

| Concern | Raw SQL | ORM |
|---|---|---|
| SQL injection | Must sanitise manually | Parameterised by default |
| Portability | Driver-specific syntax | Swap DB with config change |
| Type safety | None at compile time | Varies by ORM; many offer full type inference |
| Schema as code | Separate manual files | Models/migrations co-located |
| Refactoring | Find-replace across strings | IDE-navigable method calls |
| Relationships | Manual JOINs | Declared associations |

---

## Core Rules

These rules apply regardless of which ORM is chosen.

### Rule 1 — No Raw SQL Strings

Never pass a SQL string directly to a database driver. Use the ORM's model methods or query builder instead.

**Forbidden pattern (language-agnostic):**

```
// NEVER — string containing SQL passed to a driver
db.execute("SELECT * FROM users WHERE email = '" + email + "'")
db.query(`DELETE FROM sessions WHERE user_id = ${id}`)
cursor.execute(f"INSERT INTO orders ... {value}")
```

**Required:** use the ORM's typed CRUD methods. Consult the ORM's documentation for the exact API.

---

### Rule 2 — Use ORM Migrations for Schema Changes

Never write or execute raw DDL (`CREATE TABLE`, `ALTER TABLE`, `DROP COLUMN`) from application code. Use the ORM's migration tooling to generate and apply schema changes.

**Forbidden:**

```sql
-- NEVER run raw DDL directly from application code
ALTER TABLE users ADD COLUMN verified_at TIMESTAMP;
```

**Required:** generate a migration using the ORM's CLI or migration API, review the generated diff, then apply it. Consult the ORM's documentation for the exact command.

---

### Rule 3 — Use ORM Relation APIs, Not Manual JOINs

Declare associations in the model/schema definition and use the ORM's eager-load or include mechanism. Do not reconstruct relationships with raw JOIN strings.

**Forbidden pattern:**

```
// NEVER
db.query("SELECT u.*, p.bio FROM users u LEFT JOIN profiles p ON p.user_id = u.id WHERE u.id = " + id)
```

**Required:** define the relationship on the model and use the ORM's include/eager-load/preload API. Consult the ORM's documentation for the exact syntax.

---

### Rule 4 — Use ORM Transaction APIs

Never manage transactions with raw `BEGIN` / `COMMIT` / `ROLLBACK` strings. Use the ORM's transaction wrapper.

**Forbidden:**

```
db.execute("BEGIN")
// ...
db.execute("COMMIT")
```

**Required:** use the ORM's transaction method (e.g. a callback-based wrapper, context manager, or Unit of Work). Consult the ORM's documentation for the exact API.

---

### Rule 5 — Use Query Builder for Complex Queries

When a query involves aggregations, window functions, CTEs, or other complexity, reach for the ORM's query builder before considering raw SQL. Most modern ORMs support these natively.

If the ORM's query builder cannot express the query and the **documented escape hatch** criteria below are met, fall back to that escape hatch.

---

## Documented Escape Hatch for Raw SQL

Raw SQL is allowed **only** when all three conditions are met:

1. The query cannot be expressed with the ORM's query builder without either (a) nesting more than 3 levels of query-builder calls, or (b) losing a feature the ORM documentation explicitly marks as unsupported (for example, a specific window function or CTE syntax).
2. It is wrapped in a named function with a clear comment explaining why raw SQL is necessary.
3. It uses **parameterised placeholders** — never string interpolation or concatenation.

If the target database is a read-only analytics replica with no ORM support, treat the entire connection as an escape hatch: wrap all queries in named repository functions with parameterised placeholders and a documented justification comment.

```
// ESCAPE HATCH: <ORM name> does not support <specific feature> natively.
// Reviewed and approved YYYY-MM-DD.
function myComplexQuery(param) {
  return orm.rawQuery(
    "SELECT ... WHERE id = ?",  // parameterised, NOT string-interpolated
    [param]
  )
}
```

---

## Anti-Patterns to Avoid

| Anti-pattern | Corrective action |
|---|---|
| SQL string passed directly to a driver | Replace with ORM model method or query builder call |
| SQL built via string concatenation or interpolation | Switch to ORM query builder with bound parameters |
| Raw DDL executed in application startup or scripts | Generate a proper ORM migration and commit it to the repo |
| Manual `BEGIN`/`COMMIT` strings | Use the ORM's transaction wrapper API |
| Undocumented raw SQL in the codebase | Add escape-hatch comment with justification, approval, and date |
| Two ORMs installed for the same database connection | Remove the secondary one; standardise on one |
| Stored procedure called directly without a repository wrapper | Wrap in a named function with a documented escape-hatch comment |
| Schema migration applied without reviewing the generated diff | Always inspect the diff before applying in any environment |

---

## Implementation Checklist

Before marking any database-related task complete, verify:

- [ ] The ORM was identified or confirmed with the user before writing code.
- [ ] Version-specific ORM APIs were verified against existing code or official docs, not guessed.
- [ ] No raw SQL strings exist outside documented escape-hatch functions.
- [ ] All schema changes are expressed as ORM migration files.
- [ ] All relationships are declared in the model/schema, not re-implemented as JOIN strings.
- [ ] All multi-step writes are wrapped in the ORM's transaction API.
- [ ] Any escape-hatch raw SQL is parameterised and has an explanatory comment with date.
- [ ] Only one ORM is used per database connection in the project.

---

## Quick-Reference Workflow

```
1. Search the project for an existing ORM (dependency files + source imports).
2. If found: use it. Verify version-specific APIs against existing code/docs.
3. If not found: ask the user which ORM they want; never pick silently.
4. Express all CRUD and queries using ORM methods — no raw SQL.
5. For schema changes: generate a migration, review the diff, apply it.
6. For relations: declare in schema/model, use the ORM's include/preload API.
7. For multi-step writes: wrap in the ORM's transaction API.
8. For complex queries: use the query builder first; only use raw SQL as a
   documented escape hatch with parameterised placeholders.
9. Run all tests; confirm no raw SQL slipped in during implementation.
```
