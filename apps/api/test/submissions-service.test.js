const assert = require("node:assert/strict");
const test = require("node:test");

const { SubmissionsService } = require("../dist/src/submissions/submissions.service.js");
const { createMockPrisma } = require("./helpers/mock-prisma.js");

function createService() {
    const prisma = createMockPrisma();
    return { prisma, service: new SubmissionsService(prisma) };
}

test("creates submissions and links them to the current user", async () => {
    const { prisma, service } = createService();
    prisma.seed.user({ id: "user-1", email: "learner@example.com", name: "Learner" });
    prisma.seed.session({
        id: "session-1",
        userId: "user-1",
        token: "token-123",
        expiresAt: new Date("2026-08-20T00:00:00.000Z").toISOString(),
    });
    prisma.seed.task({
        id: "task-1",
        courseId: "course-1",
        title: "Task 1",
    });
    prisma.seed.run({
        id: "run-1",
        userId: "user-1",
        taskId: "task-1",
        status: "running",
    });

    const created = await service.createSubmission("Bearer token-123", {
        taskId: "task-1",
        runId: "run-1",
        code: "console.log('hello')",
        language: "javascript",
    });

    assert.equal(created.taskId, "task-1");
    assert.equal(created.runId, "run-1");
    assert.equal(created.status, "running");
    assert.equal(prisma.state.submissions.length, 1);
});

test("lists submissions and returns a single submission for the current user", async () => {
    const { prisma, service } = createService();
    prisma.seed.user({ id: "user-1", email: "learner@example.com", name: "Learner" });
    prisma.seed.session({
        id: "session-1",
        userId: "user-1",
        token: "token-123",
        expiresAt: new Date("2026-08-20T00:00:00.000Z").toISOString(),
    });
    prisma.seed.task({
        id: "task-1",
        courseId: "course-1",
        title: "Task 1",
    });
    prisma.seed.submission({
        id: "submission-1",
        userId: "user-1",
        taskId: "task-1",
        runId: null,
        status: "running",
        code: "print('hello')",
        language: "python",
    });

    const submissions = await service.listSubmissions("Bearer token-123");
    const submission = await service.getSubmission("submission-1", "Bearer token-123");

    assert.equal(submissions.items.length, 1);
    assert.equal(submission.id, "submission-1");
    assert.equal(submission.language, "python");
});
