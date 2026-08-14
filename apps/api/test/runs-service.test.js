const assert = require("node:assert/strict");
const test = require("node:test");

const { RunsService } = require("../dist/src/runs/runs.service.js");
const { createMockPrisma } = require("./helpers/mock-prisma.js");

function createService() {
    const prisma = createMockPrisma();
    return { prisma, service: new RunsService(prisma) };
}

test("creates runs and exposes the created run", async () => {
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

    const created = await service.createRun("Bearer token-123", {
        taskId: "task-1",
        input: "console.log('hello')",
    });

    assert.equal(created.taskId, "task-1");
    assert.equal(created.status, "queued");
    assert.equal(prisma.state.runs.length, 1);
    assert.equal(prisma.state.sandboxJobs.length, 1);
});

test("lists runs, run logs and judgements for the current user", async () => {
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
    prisma.seed.runLog({
        id: "run-log-1",
        runId: "run-1",
        level: "info",
        message: "Working",
    });
    prisma.seed.judgement({
        id: "judgement-1",
        runId: "run-1",
        status: "passed",
        score: 100,
    });

    const runs = await service.listRuns("Bearer token-123");
    const run = await service.getRun("run-1", "Bearer token-123");
    const logs = await service.getRunLogs("run-1", "Bearer token-123");
    const judgement = await service.getJudgement("judgement-1");

    assert.equal(runs.items.length, 1);
    assert.equal(run.id, "run-1");
    assert.equal(logs.items.length, 1);
    assert.equal(logs.items[0].message, "Working");
    assert.equal(judgement.status, "passed");
});
