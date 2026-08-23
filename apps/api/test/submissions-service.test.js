const assert = require("node:assert/strict");
const test = require("node:test");

const { SubmissionsService } = require("../dist/submissions/submissions.service.js");
const { createMockSupabaseSubmissions } = require("./helpers/mock-supabase-submissions.js");

function createService() {
    const supabase = createMockSupabaseSubmissions();
    return { supabase, service: new SubmissionsService(supabase) };
}

test("creates submissions and links them to the current user", async () => {
    const { supabase, service } = createService();
    supabase.seed.user({ id: "user-1", email: "learner@example.com", name: "Learner" });
    supabase.seed.task({
        id: "task-1",
        courseId: "course-1",
        title: "Task 1",
    });
    supabase.seed.run({
        id: "run-1",
        userId: "user-1",
        taskId: "task-1",
        status: "running",
    });

    const created = await service.createSubmission("Bearer token-user-1", {
        taskId: "task-1",
        runId: "run-1",
        code: "console.log('hello')",
        language: "javascript",
    });

    assert.equal(created.taskId, "task-1");
    assert.equal(created.runId, "run-1");
    assert.equal(created.status, "running");
    assert.equal(created.userId, "user-1");
    assert.equal(supabase.state.submissions.length, 1);
});

test("lists submissions and returns a single submission for the current user", async () => {
    const { supabase, service } = createService();
    supabase.seed.user({ id: "user-1", email: "learner@example.com", name: "Learner" });
    supabase.seed.task({
        id: "task-1",
        courseId: "course-1",
        title: "Task 1",
    });
    supabase.seed.submission({
        id: "submission-1",
        userId: "user-1",
        taskId: "task-1",
        runId: null,
        status: "running",
        code: "print('hello')",
        language: "python",
    });

    const submissions = await service.listSubmissions("Bearer token-user-1");
    const submission = await service.getSubmission("submission-1", "Bearer token-user-1");

    assert.equal(submissions.items.length, 1);
    assert.equal(submission.id, "submission-1");
    assert.equal(submission.language, "python");
});
