---
name: structured-dev
description: Use when doing substantive feature or refactoring work — implementing features, creating components, restructuring modules, or adding test coverage. Enforces code categorization (tools, components, enhancements, etc.), a 500-line file size cap, shared-component extraction, test coverage following TDD principles, and a test run after coding. Does NOT apply to trivial edits (comments, config tweaks, one-line fixes); where an established codebase follows different conventions, defer to the project's own conventions and flag conflicts instead of restructuring unrelated code. Trigger keywords include "add feature", "refactor", "create component", "implement", "build", "add tests", "TDD", "split file", "organize code".
---

# Structured Development

All code produced in this project follows five non-negotiable rules:

1. **Category-based file organisation** — every file has a clear home.
2. **500-line file cap** — split before you exceed it.
3. **Shared components** — extract reuse; never copy-paste logic.
4. **Test-first (TDD)** — write the test before the implementation.
5. **Mandatory test run** — execute the full test suite after every coding session; never consider work done until all tests pass.

---

## Rule 1 — Category-Based File Organisation

Place every file into a category folder that reflects its role. The exact
folder names may vary by stack, but the intent is universal.

### Reference taxonomy

| Category | Folder (example) | What belongs here |
|---|---|---|
| **Entry points** | `src/`, `app/`, `cmd/` | CLI main, HTTP handlers, framework bootstrap |
| **Domain / business logic** | `domain/`, `core/`, `lib/` | Pure functions, entities, use-cases |
| **Components / UI** | `components/`, `ui/`, `views/` | Reusable UI pieces (React, Vue, etc.) |
| **Tools / utilities** | `utils/`, `helpers/`, `tools/` | Stateless helper functions with no side effects |
| **Enhancements / adapters** | `adapters/`, `plugins/`, `middleware/` | Wrappers around third-party APIs, decorators |
| **Configuration** | `config/` | Constants, environment parsing, feature flags |
| **Types / interfaces** | `types/`, `interfaces/` | Shared type definitions; no runtime logic |
| **Tests** | `__tests__/`, `tests/`, `*.test.ts` | Mirror the source tree; one test file per source file |
| **Fixtures / mocks** | `fixtures/`, `mocks/` | Reusable test data and mock factories |

### Rules for file placement

- One responsibility per file. Importing from support categories (`types/`,
  `utils/`, `config/`) is normal and expected everywhere; the smell to watch
  for is a file that **implements** responsibilities belonging to more than one
  category (e.g. business logic mixed into a UI component, or an adapter that
  also contains domain rules) — split those.
- Test files live **next to** their source file or in a mirrored `tests/`
  subtree. Never mix test and production code in the same file.
- Barrel files (`index.ts`, `mod.rs`, `__init__.py`) are allowed per folder,
  but must only re-export — never contain logic.

---

## Rule 2 — 500-Line File Cap

A file must not exceed **500 lines** (comments and blank lines included).

### When you hit the limit

Before adding more code to a file that is at or near 500 lines:

1. **Identify cohesive groups** of functions or classes inside the file.
2. **Extract each group** into its own file with a clear, single-responsibility name.
3. **Update imports** in the original file to reference the extracted module.
4. **Move the relevant tests** (or create new ones) for each extracted module.

### Acceptable exceptions

Exceeding 500 lines is only justified when:
- A single function / class is **inherently large** (e.g., a generated parser, a complex algorithm with extensive in-line documentation, a large SQL migration).
- Splitting it would break the algorithm's comprehensibility.

Document the exception with a short comment at the top of the file:

```ts
// FILE EXCEPTION: single-function parser — splitting would obscure the grammar.
// Lines: ~650. Reviewed and approved on YYYY-MM-DD.
```

---

## Rule 3 — Shared Components

Never duplicate logic across files. Before writing a new helper:

1. **Search first** — does an existing utility, hook, or helper already do this?
2. **Generalise** — if you find similar-but-not-identical code, generalise the
   existing one rather than writing a new special-case version.
3. **Extract to shared** — move the generalised version to the appropriate
   category folder (`utils/`, `components/`, `adapters/`, etc.).
4. **Update all callers** to use the shared version.

### Extraction checklist

- [ ] The extracted unit is generic enough to be used in ≥ 2 places.
- [ ] It has no hidden coupling to a single caller's context.
- [ ] It is accompanied by its own unit tests.
- [ ] Its name describes **what** it does, not **where** it was extracted from.

---

## Rule 4 — Test-First Development (TDD)

Every non-trivial piece of logic must have a test. Follow the **Red → Green → Refactor** cycle strictly.

### Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. RED    Write a failing test that describes the desired behaviour │
│  2. GREEN  Write the minimum production code to make it pass         │
│  3. REFACTOR  Clean up without breaking the tests                    │
└─────────────────────────────────────────────────────────────────────┘
```

**Step 1 — Write the test first**

- Create (or open) the test file before touching the source file.
- The test must fail when run against the current (unimplemented) code.
- Use descriptive test names: `it("returns empty array when input is null")`.

**Step 2 — Make it green**

- Write only the code needed to pass the test — nothing more.
- Resist the urge to implement "the whole thing" before running the test.

**Step 3 — Refactor**

- Improve naming, extract helpers, remove duplication.
- Run the tests after every change to confirm nothing regressed.
- This is the right time to apply Rules 1–3 (categorise, split, share).

### Test coverage expectations

| Code type | Minimum coverage |
|---|---|
| Pure functions / utilities | 100 % branch coverage |
| Domain / business logic | 100 % branch coverage |
| Adapters / integrations | Happy path + at least one error path |
| UI components | Render smoke test + key interaction tests |
| Entry points / main | Integration or E2E test (not unit) |

### Test file conventions

```
src/
  utils/
    format-date.ts          ← source
    format-date.test.ts     ← test lives alongside source
  components/
    Button.tsx
    Button.test.tsx
```

- One test file per source file.
- Import only the public API — never test internal implementation details.
- Use descriptive `describe` / `it` / `test` blocks that read as specifications.
- Prefer **real objects** over mocks; mock only I/O boundaries (HTTP, DB, filesystem).

---

## Implementation Checklist

Before marking a task complete, verify:

- [ ] All new files are placed in the correct category folder.
- [ ] No file exceeds 500 lines (or is documented as an exception).
- [ ] No logic is duplicated — shared helpers are extracted.
- [ ] Every new function / class has a corresponding test file.
- [ ] Tests were written **before** the implementation (TDD cycle respected).
- [ ] All tests pass (`npm test`, `cargo test`, `pytest`, etc.).
- [ ] Barrel / index files contain only re-exports, no logic.

---

## Rule 5 — Mandatory Test Run After Coding

**Every coding session ends with a full test suite run. No exceptions.**

### When to run tests

| Moment | Action |
|---|---|
| After implementing a feature | Run the full suite |
| After refactoring | Run the full suite |
| After fixing a bug | Run the full suite |
| After merging / rebasing | Run the full suite |
| After any dependency update | Run the full suite |

### How to run

Detect and use the project's test command. Common examples:

```bash
# JavaScript / TypeScript
npm test
npm run test
npx vitest run
npx jest --runInBand

# Python
pytest
python -m pytest

# Rust
cargo test

# Go
go test ./...

# Ruby
bundle exec rspec
```

If the project defines a custom script (e.g. `Makefile`, `package.json` script,
`justfile`), prefer that over calling the test runner directly.

### What "passing" means

- **Zero failing tests** — a suite with skipped tests is acceptable only if the
  skips were pre-existing and unrelated to the current change.
- **No new warnings treated as errors** — check the runner's exit code, not just
  the last line of output.
- If tests fail **because of the current change**, fix them before marking the
  task done. Do not move on, do not commit, do not hand off.
- Failures that pre-date the change and are unrelated to it (verify: the same
  test fails without your diff applied) are **not** a blocker for this task —
  report them explicitly to the user and leave them untouched unless asked to
  fix them.

### Reporting

After running, report the result explicitly:

```
✓ 42 tests passed (0 failed, 2 skipped)
```

or, if there are failures:

```
✗ 3 tests failed — see output above. Fixing before proceeding.
```

---

## Quick-Reference Workflow

```
1. Understand the requirement.
2. Identify the category folder for each new file.
3. Write the test file (RED).
4. Implement the minimum code (GREEN).
5. Refactor: split if > 500 lines, extract shared helpers (REFACTOR).
6. Run the full test suite. Fix regressions before moving on.
7. Verify the implementation checklist above.
8. Report test results — only done when all tests pass.
```

---

## Anti-Patterns to Avoid

| Anti-pattern | Corrective action |
|---|---|
| `utils.ts` with 800 lines of mixed helpers | Split into `utils/string.ts`, `utils/date.ts`, `utils/array.ts`, etc. |
| Copy-pasting a 10-line helper into a second file | Extract to `utils/` and import in both files |
| Writing all code first, then adding tests | Keep the working code; write the missing tests against it now, and start test-first on the next change |
| A single `components/index.tsx` with 10 components | One file per component; barrel `index.ts` for re-exports only |
| Test file that imports private internals | Redesign the public API so the behaviour is testable through the surface |
| `// TODO: add tests later` | Never acceptable; tests are part of the definition of done |
