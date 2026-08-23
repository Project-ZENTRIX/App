function createMockSupabaseRuns(seed = {}) {
    const clone = (value) => JSON.parse(JSON.stringify(value));
    const now = () => new Date("2026-08-20T00:00:00.000Z").toISOString();

    const state = {
        users: clone(seed.users ?? []),
        tasks: clone(seed.tasks ?? []),
        runs: clone(seed.runs ?? []),
        runLogs: clone(seed.runLogs ?? []),
        judgements: clone(seed.judgements ?? []),
        sandboxJobs: clone(seed.sandboxJobs ?? []),
    };

    const nextRunId = () => `run-${state.runs.length + 1}`;
    const nextSandboxJobId = () => `sandbox-job-${state.sandboxJobs.length + 1}`;

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
                    status: data.status ?? "draft",
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
                    input: data.input ?? null,
                    output: data.output ?? null,
                    error: data.error ?? null,
                    runtime_ms: data.runtimeMs ?? null,
                    memory_kb: data.memoryKb ?? null,
                    started_at: data.startedAt ?? null,
                    finished_at: data.finishedAt ?? null,
                    created_at: data.createdAt ?? now(),
                    submitted_at: data.submittedAt ?? null,
                    deleted_at: data.deletedAt ?? null,
                });
            },
            runLog(data) {
                state.runLogs.push({
                    id: data.id,
                    run_id: data.runId,
                    level: data.level,
                    message: data.message,
                    created_at: data.createdAt ?? now(),
                    archived_at: data.archivedAt ?? null,
                });
            },
            judgement(data) {
                state.judgements.push({
                    id: data.id,
                    run_id: data.runId,
                    status: data.status ?? "pending",
                    score: data.score ?? null,
                    feedback: data.feedback ?? null,
                    created_at: data.createdAt ?? now(),
                    updated_at: data.updatedAt ?? now(),
                    deleted_at: data.deletedAt ?? null,
                });
            },
            sandboxJob(data) {
                state.sandboxJobs.push({
                    id: data.id,
                    run_id: data.runId,
                    status: data.status ?? "queued",
                    retry_count: data.retryCount ?? 0,
                    queue_name: data.queueName ?? null,
                    resource_limit: data.resourceLimit ?? null,
                    created_at: data.createdAt ?? now(),
                    updated_at: data.updatedAt ?? now(),
                    deleted_at: data.deletedAt ?? null,
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
                const task = state.tasks.find((item) => item.id === filters.id);
                return task ? clone(task) : null;
            }

            if (table === "runs") {
                const run = state.runs.find(
                    (item) =>
                        item.id === filters.id &&
                        item.user_id === filters.user_id &&
                        item.deleted_at === filters.deleted_at
                );
                return run ? clone(run) : null;
            }

            if (table === "judgements") {
                const judgement = state.judgements.find((item) => item.id === filters.id);
                return judgement ? clone(judgement) : null;
            }

            return null;
        },
        async selectRows(schema, table, filters = {}, select = "*", orderBy) {
            if (schema !== "public") {
                return [];
            }

            let rows = [];
            if (table === "runs") {
                rows = state.runs.filter((item) => item.user_id === filters.user_id && item.deleted_at === filters.deleted_at);
            }

            if (table === "run_logs") {
                rows = state.runLogs.filter(
                    (item) => item.run_id === filters.run_id && item.archived_at === filters.archived_at
                );
            }

            if (orderBy?.column === "created_at") {
                rows = [...rows].sort((left, right) => {
                    const leftValue = String(left.created_at ?? "");
                    const rightValue = String(right.created_at ?? "");
                    return orderBy.ascending === false ? rightValue.localeCompare(leftValue) : leftValue.localeCompare(rightValue);
                });
            }

            return clone(rows);
        },
        async insertRow(schema, table, row) {
            if (schema !== "public") {
                return clone(row);
            }

            if (table === "runs") {
                const created = {
                    id: row.id ?? nextRunId(),
                    user_id: row.user_id,
                    task_id: row.task_id,
                    status: row.status ?? "queued",
                    input: row.input ?? null,
                    output: row.output ?? null,
                    error: row.error ?? null,
                    runtime_ms: row.runtime_ms ?? null,
                    memory_kb: row.memory_kb ?? null,
                    started_at: row.started_at ?? null,
                    finished_at: row.finished_at ?? null,
                    created_at: row.created_at ?? now(),
                    submitted_at: row.submitted_at ?? null,
                    deleted_at: row.deleted_at ?? null,
                };
                state.runs.push(created);
                return clone(created);
            }

            if (table === "sandbox_jobs") {
                const created = {
                    id: row.id ?? nextSandboxJobId(),
                    run_id: row.run_id,
                    status: row.status ?? "queued",
                    retry_count: row.retry_count ?? 0,
                    queue_name: row.queue_name ?? null,
                    resource_limit: row.resource_limit ?? null,
                    created_at: row.created_at ?? now(),
                    updated_at: row.updated_at ?? now(),
                    deleted_at: row.deleted_at ?? null,
                };
                state.sandboxJobs.push(created);
                return clone(created);
            }

            return clone(row);
        },
    };
}

module.exports = {
    createMockSupabaseRuns,
};
