function createMockSupabaseSubmissions(seed = {}) {
    const clone = (value) => JSON.parse(JSON.stringify(value));
    const now = () => new Date("2026-08-20T00:00:00.000Z").toISOString();

    const state = {
        users: clone(seed.users ?? []),
        tasks: clone(seed.tasks ?? []),
        runs: clone(seed.runs ?? []),
        submissions: clone(seed.submissions ?? []),
    };

    return {
        state,
        seed: {
            user(data) {
                state.users.push({ id: data.id, email: data.email, created_at: now(), updated_at: now(), user_metadata: { name: data.name ?? data.email } });
            },
            task(data) {
                state.tasks.push({
                    id: data.id,
                    course_id: data.courseId,
                    lesson_id: data.lessonId ?? null,
                    title: data.title,
                    description: data.description ?? null,
                    type: data.type ?? null,
                    points: data.points ?? 0,
                    sort_order: data.sortOrder ?? 0,
                    status: data.status ?? "published",
                    created_at: now(),
                    updated_at: now(),
                });
            },
            run(data) {
                state.runs.push({
                    id: data.id,
                    user_id: data.userId,
                    task_id: data.taskId,
                    status: data.status ?? "queued",
                    deleted_at: data.deletedAt ?? null,
                });
            },
            submission(data) {
                state.submissions.push({
                    id: data.id,
                    user_id: data.userId,
                    task_id: data.taskId,
                    run_id: data.runId ?? null,
                    status: data.status ?? "queued",
                    code: data.code ?? null,
                    language: data.language ?? null,
                    submitted_at: data.submittedAt ?? now(),
                    evaluated_at: data.evaluatedAt ?? null,
                    created_at: data.createdAt ?? now(),
                    updated_at: data.updatedAt ?? now(),
                });
            },
        },
        async getCurrentUser(authorization) {
            if (!authorization) {
                return null;
            }

            const token = authorization.split(" ")[1] ?? authorization;
            const userId = token.replace("token-", "");
            const user = state.users.find((item) => item.id === userId);
            return user ? { ...clone(user), access_token: token } : null;
        },
        async selectOne(schema, table, filters = {}) {
            if (schema !== "public") {
                return null;
            }

            if (table === "tasks") {
                const row = state.tasks.find((item) => item.id === filters.id);
                return row ? clone(row) : null;
            }

            if (table === "runs") {
                const row = state.runs.find((item) => item.id === filters.id && item.user_id === filters.user_id && item.deleted_at === filters.deleted_at);
                return row ? clone(row) : null;
            }

            if (table === "task_submissions") {
                const row = state.submissions.find(
                    (item) => item.id === filters.id && item.user_id === filters.user_id
                );
                return row ? clone(row) : null;
            }

            return null;
        },
        async selectRows(schema, table, filters = {}, select = "*", orderBy) {
            if (schema !== "public") {
                return [];
            }

            let rows = [];
            if (table === "task_submissions") {
                rows = state.submissions.filter((item) => item.user_id === filters.user_id);
            }

            if (orderBy?.column === "submitted_at") {
                rows = [...rows].sort((left, right) => String(right.submitted_at).localeCompare(String(left.submitted_at)));
            }

            return clone(rows);
        },
        async insertRow(schema, table, row) {
            if (schema !== "public") {
                return clone(row);
            }

            if (table === "task_submissions") {
                const created = {
                    id: row.id,
                    user_id: row.user_id,
                    task_id: row.task_id,
                    run_id: row.run_id ?? null,
                    status: row.status ?? "queued",
                    code: row.code ?? null,
                    language: row.language ?? null,
                    submitted_at: row.submitted_at ?? now(),
                    evaluated_at: row.evaluated_at ?? null,
                    created_at: row.created_at ?? now(),
                    updated_at: row.updated_at ?? now(),
                };
                state.submissions.push(created);
                return clone(created);
            }

            return clone(row);
        },
    };
}

module.exports = {
    createMockSupabaseSubmissions,
};
