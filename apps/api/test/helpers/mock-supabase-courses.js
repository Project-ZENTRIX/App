function createMockSupabaseCourses(seed = {}) {
    const clone = (value) => JSON.parse(JSON.stringify(value));
    const toCourseRow = (row) => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        summary: row.summary,
        cover: row.cover,
        category: row.category,
        language: row.language,
        difficulty: row.difficulty,
        tags: [...(row.tags ?? [])],
        price: row.price,
        currency: row.currency,
        status: row.status,
        version: row.version,
        version_label: row.versionLabel,
        unlock_scope: row.unlockScope,
        is_purchased: row.isPurchased,
        is_learnable: row.isLearnable,
        is_offline: row.isOffline,
        supported_languages: [...(row.supportedLanguages ?? [])],
        chapter_count: row.chapterCount,
        lesson_count: row.lessonCount,
        task_count: row.taskCount,
        created_at: row.createdAt,
        updated_at: row.updatedAt,
    });
    const toChapterRow = (row) => ({
        id: row.id,
        course_id: row.courseId,
        title: row.title,
        summary: row.summary,
        sort_order: row.sortOrder,
        status: row.status,
        created_at: row.createdAt,
        updated_at: row.updatedAt,
    });
    const toLessonRow = (row) => ({
        id: row.id,
        course_id: row.courseId,
        chapter_id: row.chapterId,
        title: row.title,
        summary: row.summary,
        duration_minutes: row.durationMinutes,
        sort_order: row.sortOrder,
        status: row.status,
        created_at: row.createdAt,
        updated_at: row.updatedAt,
    });
    const toTaskRow = (row) => ({
        id: row.id,
        course_id: row.courseId,
        lesson_id: row.lessonId,
        title: row.title,
        description: row.description,
        type: row.type,
        points: row.points,
        sort_order: row.sortOrder,
        status: row.status,
        created_at: row.createdAt,
        updated_at: row.updatedAt,
    });
    const toContentAssetRow = (row) => ({
        id: row.id,
        course_id: row.courseId,
        lesson_id: row.lessonId,
        task_id: row.taskId,
        file_name: row.fileName,
        mime_type: row.mimeType,
        url: row.url,
        metadata: row.metadata,
        created_at: row.createdAt,
    });

    const state = {
        courses: clone((seed.courses ?? []).map(toCourseRow)),
        chapters: clone((seed.chapters ?? []).map(toChapterRow)),
        lessons: clone((seed.lessons ?? []).map(toLessonRow)),
        tasks: clone((seed.tasks ?? []).map(toTaskRow)),
        contentAssets: clone((seed.contentAssets ?? []).map(toContentAssetRow)),
    };

    const toRowKey = {
        courses: "courses",
        chapters: "chapters",
        lessons: "lessons",
        tasks: "tasks",
        contentAssets: "contentAssets",
        content_assets: "contentAssets",
    };

    const normalize = (rows) => rows.map((row) => clone(row));

    return {
        state,
        seed: {
            course(data) {
                state.courses.push(toCourseRow(data));
            },
            chapter(data) {
                state.chapters.push(toChapterRow(data));
            },
            lesson(data) {
                state.lessons.push(toLessonRow(data));
            },
            task(data) {
                state.tasks.push(toTaskRow(data));
            },
            contentAsset(data) {
                state.contentAssets.push(toContentAssetRow(data));
            },
        },
        upsertRow(schema, table, row) {
            if (schema !== "public") {
                return clone(row);
            }

            const key = toRowKey[table];
            if (!key) {
                return clone(row);
            }

            const existingIndex = state[key].findIndex((item) => item.id === row.id);
            if (existingIndex >= 0) {
                state[key][existingIndex] = clone(row);
            } else {
                state[key].push(clone(row));
            }

            return clone(row);
        },
        async selectRows(schema, table) {
            if (schema !== "public") {
                return [];
            }

            const rows = state[toRowKey[table]] ?? [];
            return normalize(rows);
        },
        async insertRow(schema, table, row) {
            if (schema !== "public") {
                return clone(row);
            }

            const key = toRowKey[table];
            if (!key) {
                return clone(row);
            }

            state[key].push(clone(row));
            return clone(row);
        },
    };
}

module.exports = {
    createMockSupabaseCourses,
};
