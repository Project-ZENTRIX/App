function createMockSupabaseProgress(seed = {}) {
    const clone = (value) => JSON.parse(JSON.stringify(value));
    const state = {
        users: clone(seed.users ?? []),
        lessons: clone(seed.lessons ?? []),
        enrollments: clone(seed.enrollments ?? []),
        lessonProgress: clone(seed.lessonProgress ?? []),
        progressEvents: clone(seed.progressEvents ?? []),
    };

    const now = () => new Date("2026-08-20T00:00:00.000Z").toISOString();

    return {
        state,
        seed: {
            user(data) {
                state.users.push({ id: data.id, email: data.email, created_at: now(), updated_at: now(), user_metadata: { name: data.name ?? data.email } });
            },
            lesson(data) {
                state.lessons.push({
                    id: data.id,
                    course_id: data.courseId,
                    chapter_id: data.chapterId ?? null,
                    title: data.title,
                    summary: data.summary ?? null,
                    duration_minutes: data.durationMinutes ?? 0,
                    sort_order: data.sortOrder ?? 0,
                    status: data.status ?? "published",
                    created_at: now(),
                    updated_at: now(),
                });
            },
            enrollment(data) {
                state.enrollments.push({
                    id: data.id,
                    user_id: data.userId,
                    course_id: data.courseId,
                    status: data.status ?? "active",
                    enrolled_at: data.enrolledAt ?? now(),
                    completed_at: data.completedAt ?? null,
                });
            },
            lessonProgress(data) {
                state.lessonProgress.push({
                    id: data.id,
                    user_id: data.userId,
                    lesson_id: data.lessonId,
                    status: data.status ?? "not_started",
                    progress: data.progress ?? 0,
                    updated_at: now(),
                    created_at: data.createdAt ?? now(),
                });
            },
            progressEvent(data) {
                state.progressEvents.push({
                    id: data.id,
                    user_id: data.userId,
                    course_id: data.courseId ?? null,
                    lesson_id: data.lessonId ?? null,
                    task_id: data.taskId ?? null,
                    event_type: data.eventType,
                    payload: data.payload ?? null,
                    created_at: data.createdAt ?? now(),
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
        async selectRows(schema, table, filters = {}, select = "*", orderBy) {
            if (schema !== "public") {
                return [];
            }

            let rows = [];
            if (table === "enrollments") {
                rows = state.enrollments.filter((item) => item.user_id === filters.user_id);
            }

            if (table === "lesson_progress") {
                rows = state.lessonProgress.filter((item) => item.user_id === filters.user_id);
            }

            if (table === "progress_events") {
                rows = state.progressEvents.filter((item) => item.user_id === filters.user_id);
            }

            if (table === "lessons") {
                rows = state.lessons.filter((item) => (filters.course_id ? item.course_id === filters.course_id : true));
            }

            if (orderBy?.column === "created_at" || orderBy?.column === "updated_at" || orderBy?.column === "sort_order") {
                rows = [...rows].sort((left, right) => {
                    const leftValue = String(left[orderBy.column] ?? "");
                    const rightValue = String(right[orderBy.column] ?? "");
                    return orderBy.ascending === false ? rightValue.localeCompare(leftValue) : leftValue.localeCompare(rightValue);
                });
            }

            return clone(rows);
        },
        async selectOne(schema, table, filters = {}) {
            if (schema !== "public") {
                return null;
            }

            if (table === "lesson_progress") {
                const row = state.lessonProgress.find((item) => item.user_id === filters.user_id && item.lesson_id === filters.lesson_id);
                return row ? clone(row) : null;
            }

            if (table === "lessons") {
                const row = state.lessons.find((item) => item.id === filters.id);
                return row ? clone(row) : null;
            }

            return null;
        },
        async insertRow(schema, table, row) {
            if (schema !== "public") {
                return clone(row);
            }

            if (table === "progress_events") {
                const created = { ...clone(row), created_at: now() };
                state.progressEvents.push(created);
                return clone(created);
            }

            return clone(row);
        },
        async upsertRow(schema, table, row) {
            if (schema !== "public") {
                return clone(row);
            }

            if (table === "lesson_progress") {
                const existing = state.lessonProgress.find((item) => item.user_id === row.user_id && item.lesson_id === row.lesson_id);
                if (!existing) {
                    const created = {
                        id: row.id,
                        user_id: row.user_id,
                        lesson_id: row.lesson_id,
                        status: row.status,
                        progress: row.progress,
                        updated_at: now(),
                        created_at: now(),
                    };
                    state.lessonProgress.push(created);
                    return clone(created);
                }

                Object.assign(existing, row, { updated_at: now() });
                return clone(existing);
            }

            return clone(row);
        },
    };
}

module.exports = {
    createMockSupabaseProgress,
};
