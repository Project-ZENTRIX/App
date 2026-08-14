function createMockPrismaProgress(state, clone, now) {
    let tick = 0;
    const nextTimestamp = () => new Date(Date.parse(now().toISOString()) + tick++ * 1000).toISOString();

    const findLessonById = (id) => state.lessons.find((lesson) => lesson.id === id) ?? null;
    const findEnrollmentById = (id) => state.enrollments.find((enrollment) => enrollment.id === id) ?? null;
    const findLessonProgress = (userId, lessonId) =>
        state.lessonProgresses.find((progress) => progress.userId === userId && progress.lessonId === lessonId) ?? null;

    const withLesson = (progress) => ({
        ...clone(progress),
        lesson: findLessonById(progress.lessonId),
    });

    return {
        lesson: {
            findMany: async ({ where } = {}) =>
                state.lessons
                    .filter((lesson) => lesson.courseId === where?.courseId)
                    .map((lesson) => clone(lesson)),
            findUnique: async ({ where } = {}) => {
                const lesson = findLessonById(where?.id);
                return lesson ? clone(lesson) : null;
            },
        },
        enrollment: {
            findMany: async ({ where } = {}) =>
                state.enrollments
                    .filter((enrollment) => enrollment.userId === where?.userId)
                    .map((enrollment) => clone(enrollment)),
            findFirst: async ({ where } = {}) => {
                const enrollment = state.enrollments.find(
                    (item) => item.userId === where?.userId && item.courseId === where?.courseId
                );
                return enrollment ? clone(enrollment) : null;
            },
        },
        lessonProgress: {
            findMany: async ({ where, include } = {}) => {
                const progresses = state.lessonProgresses.filter((progress) => progress.userId === where?.userId);
                return progresses.map((progress) => (include?.lesson ? withLesson(progress) : clone(progress)));
            },
            findUnique: async ({ where, include } = {}) => {
                const composite = where?.userId_lessonId;
                const progress = composite ? findLessonProgress(composite.userId, composite.lessonId) : null;
                if (!progress) {
                    return null;
                }

                return include?.lesson ? withLesson(progress) : clone(progress);
            },
            upsert: async ({ where, create, update, include } = {}) => {
                const composite = where?.userId_lessonId;
                const existing = composite ? findLessonProgress(composite.userId, composite.lessonId) : null;
                if (!existing) {
                    const created = {
                        id: `lesson-progress-${state.lessonProgresses.length + 1}`,
                        userId: create.userId,
                        lessonId: create.lessonId,
                        status: create.status ?? "not_started",
                        progress: create.progress ?? 0,
                        createdAt: nextTimestamp(),
                        updatedAt: nextTimestamp(),
                    };
                    state.lessonProgresses.push(created);
                    return include?.lesson ? withLesson(created) : clone(created);
                }

                Object.assign(existing, update, { updatedAt: nextTimestamp() });
                return include?.lesson ? withLesson(existing) : clone(existing);
            },
        },
        progressEvent: {
            findMany: async ({ where, orderBy } = {}) => {
                const events = state.progressEvents.filter((event) => event.userId === where?.userId);
                if (orderBy?.createdAt === "desc") {
                    events.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
                }
                return events.map((event) => clone(event));
            },
            create: async ({ data }) => {
                const event = {
                    id: `progress-event-${state.progressEvents.length + 1}`,
                    userId: data.userId,
                    courseId: data.courseId ?? null,
                    lessonId: data.lessonId ?? null,
                    taskId: data.taskId ?? null,
                    eventType: data.eventType,
                    payload: data.payload ?? null,
                    createdAt: nextTimestamp(),
                };
                state.progressEvents.push(event);
                return clone(event);
            },
        },
        seed: {
            lesson(data) {
                state.lessons.push({
                    id: data.id,
                    courseId: data.courseId,
                    chapterId: data.chapterId ?? null,
                    title: data.title,
                    summary: data.summary ?? null,
                    sortOrder: data.sortOrder ?? 0,
                    status: data.status ?? "draft",
                    createdAt: nextTimestamp(),
                    updatedAt: nextTimestamp(),
                });
            },
            enrollment(data) {
                state.enrollments.push({
                    id: data.id,
                    userId: data.userId,
                    courseId: data.courseId,
                    status: data.status ?? "active",
                    enrolledAt: data.enrolledAt ?? nextTimestamp(),
                    completedAt: data.completedAt ?? null,
                });
            },
            lessonProgress(data) {
                state.lessonProgresses.push({
                    id: data.id,
                    userId: data.userId,
                    lessonId: data.lessonId,
                    status: data.status ?? "not_started",
                    progress: data.progress ?? 0,
                    createdAt: data.createdAt ?? nextTimestamp(),
                    updatedAt: data.updatedAt ?? nextTimestamp(),
                });
            },
            progressEvent(data) {
                state.progressEvents.push({
                    id: data.id,
                    userId: data.userId,
                    courseId: data.courseId ?? null,
                    lessonId: data.lessonId ?? null,
                    taskId: data.taskId ?? null,
                    eventType: data.eventType,
                    payload: data.payload ?? null,
                    createdAt: data.createdAt ?? nextTimestamp(),
                });
            },
        },
    };
}

module.exports = {
    createMockPrismaProgress,
};
