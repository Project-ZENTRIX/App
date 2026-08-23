const assert = require("node:assert/strict");
const test = require("node:test");

const { ProgressService } = require("../dist/progress/progress.service.js");
const { createMockSupabaseProgress } = require("./helpers/mock-supabase-progress.js");

function createService() {
    const supabase = createMockSupabaseProgress();
    return { supabase, service: new ProgressService(supabase) };
}

test("returns progress overview for the current user", async () => {
    const { supabase, service } = createService();
    supabase.seed.user({ id: "user-1", email: "learner@example.com", name: "Learner" });
    supabase.seed.enrollment({
        id: "enrollment-1",
        userId: "user-1",
        courseId: "course-1",
        status: "active",
    });
    supabase.seed.lessonProgress({
        id: "progress-1",
        userId: "user-1",
        lessonId: "lesson-1",
        status: "in_progress",
        progress: 50,
    });
    supabase.seed.progressEvent({
        id: "event-1",
        userId: "user-1",
        courseId: "course-1",
        lessonId: "lesson-1",
        taskId: null,
        eventType: "lesson_started",
        payload: { source: "desktop" },
    });
    supabase.seed.lesson({
        id: "lesson-1",
        courseId: "course-1",
        title: "Lesson 1",
    });

    const overview = await service.getOverview("Bearer token-user-1");

    assert.equal(overview.userId, "user-1");
    assert.equal(overview.enrollments.length, 1);
    assert.equal(overview.lessonProgress.items.length, 1);
    assert.equal(overview.recentEvents.length, 1);
    assert.equal(overview.recentEvents[0].eventType, "lesson_started");
});

test("lists course progress and lesson progress", async () => {
    const { supabase, service } = createService();
    supabase.seed.user({ id: "user-1", email: "learner@example.com", name: "Learner" });
    supabase.seed.lesson({
        id: "lesson-1",
        courseId: "course-1",
        title: "Lesson 1",
    });
    supabase.seed.lesson({
        id: "lesson-2",
        courseId: "course-1",
        title: "Lesson 2",
    });
    supabase.seed.lessonProgress({
        id: "progress-1",
        userId: "user-1",
        lessonId: "lesson-1",
        status: "completed",
        progress: 100,
    });
    supabase.seed.lessonProgress({
        id: "progress-2",
        userId: "user-1",
        lessonId: "lesson-2",
        status: "in_progress",
        progress: 25,
    });

    const course = await service.getCourseProgress("course-1", "Bearer token-user-1");
    const lesson = await service.getLessonProgress("lesson-1", "Bearer token-user-1");

    assert.equal(course.courseId, "course-1");
    assert.equal(course.items.length, 2);
    assert.equal(lesson.lessonId, "lesson-1");
    assert.equal(lesson.progress, 100);
});

test("creates progress events and lists recent events", async () => {
    const { supabase, service } = createService();
    supabase.seed.user({ id: "user-1", email: "learner@example.com", name: "Learner" });
    supabase.seed.lesson({
        id: "lesson-1",
        courseId: "course-1",
        title: "Lesson 1",
    });

    const created = await service.createEvent("Bearer token-user-1", {
        courseId: "course-1",
        lessonId: "lesson-1",
        taskId: null,
        eventType: "lesson_completed",
        payload: { durationMs: 1234 },
    });
    const events = await service.listEvents("Bearer token-user-1");

    assert.equal(created.eventType, "lesson_completed");
    assert.equal(events.items.length, 1);
    assert.equal(events.items[0].payload.durationMs, 1234);
});
