const assert = require("node:assert/strict");
const test = require("node:test");

const { ProgressService } = require("../dist/src/progress/progress.service.js");
const { createMockPrisma } = require("./helpers/mock-prisma.js");

function createService() {
    const prisma = createMockPrisma();
    return { prisma, service: new ProgressService(prisma) };
}

test("returns progress overview for the current user", async () => {
    const { prisma, service } = createService();
    prisma.seed.user({ id: "user-1", email: "learner@example.com", name: "Learner" });
    prisma.seed.session({
        id: "session-1",
        userId: "user-1",
        token: "token-123",
        expiresAt: new Date("2026-08-20T00:00:00.000Z").toISOString(),
    });
    prisma.seed.enrollment({
        id: "enrollment-1",
        userId: "user-1",
        courseId: "course-1",
        status: "active",
    });
    prisma.seed.lessonProgress({
        id: "progress-1",
        userId: "user-1",
        lessonId: "lesson-1",
        status: "in_progress",
        progress: 50,
    });
    prisma.seed.progressEvent({
        id: "event-1",
        userId: "user-1",
        courseId: "course-1",
        lessonId: "lesson-1",
        taskId: null,
        eventType: "lesson_started",
        payload: { source: "desktop" },
    });

    const overview = await service.getOverview("Bearer token-123");

    assert.equal(overview.userId, "user-1");
    assert.equal(overview.enrollments.length, 1);
    assert.equal(overview.lessonProgress.items.length, 1);
    assert.equal(overview.recentEvents.length, 1);
    assert.equal(overview.recentEvents[0].eventType, "lesson_started");
});

test("lists course progress and lesson progress", async () => {
    const { prisma, service } = createService();
    prisma.seed.user({ id: "user-1", email: "learner@example.com", name: "Learner" });
    prisma.seed.session({
        id: "session-1",
        userId: "user-1",
        token: "token-123",
        expiresAt: new Date("2026-08-20T00:00:00.000Z").toISOString(),
    });
    prisma.seed.lessonProgress({
        id: "progress-1",
        userId: "user-1",
        lessonId: "lesson-1",
        status: "completed",
        progress: 100,
    });
    prisma.seed.lessonProgress({
        id: "progress-2",
        userId: "user-1",
        lessonId: "lesson-2",
        status: "in_progress",
        progress: 25,
    });
    prisma.seed.lesson({
        id: "lesson-1",
        courseId: "course-1",
        title: "Lesson 1",
    });
    prisma.seed.lesson({
        id: "lesson-2",
        courseId: "course-1",
        title: "Lesson 2",
    });

    const course = await service.getCourseProgress("course-1", "Bearer token-123");
    const lesson = await service.getLessonProgress("lesson-1", "Bearer token-123");

    assert.equal(course.courseId, "course-1");
    assert.equal(course.items.length, 2);
    assert.equal(lesson.lessonId, "lesson-1");
    assert.equal(lesson.progress, 100);
});

test("creates progress events and lists recent events", async () => {
    const { prisma, service } = createService();
    prisma.seed.user({ id: "user-1", email: "learner@example.com", name: "Learner" });
    prisma.seed.session({
        id: "session-1",
        userId: "user-1",
        token: "token-123",
        expiresAt: new Date("2026-08-20T00:00:00.000Z").toISOString(),
    });

    const created = await service.createEvent("Bearer token-123", {
        courseId: "course-1",
        lessonId: "lesson-1",
        taskId: null,
        eventType: "lesson_completed",
        payload: { durationMs: 1234 },
    });
    const events = await service.listEvents("Bearer token-123");

    assert.equal(created.eventType, "lesson_completed");
    assert.equal(events.items.length, 1);
    assert.equal(events.items[0].payload.durationMs, 1234);
});
