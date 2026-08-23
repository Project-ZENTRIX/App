const assert = require("node:assert/strict");
const test = require("node:test");

const { RunsService } = require("../dist/runs/runs.service.js");
const { createMockSupabaseRuns } = require("./helpers/mock-supabase-runs.js");

function createService() {
    const supabase = createMockSupabaseRuns();
    return { supabase, service: new RunsService(supabase) };
}

test("creates runs and exposes the created run", async () => {
    const { supabase, service } = createService();
    supabase.seed.user({ id: "user-1", email: "learner@example.com", name: "Learner" });
    supabase.seed.task({
        id: "task-1",
        courseId: "course-1",
        title: "Task 1",
    });

    const created = await service.createRun("Bearer token-user-1", {
        taskId: "task-1",
        input: "console.log('hello')",
    });

    assert.equal(created.taskId, "task-1");
    assert.equal(created.status, "queued");
    assert.equal(created.userId, "user-1");
    assert.equal(supabase.state.runs.length, 1);
    assert.equal(supabase.state.sandboxJobs.length, 1);
});

test("lists runs, run logs and judgements for the current user", async () => {
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
    supabase.seed.runLog({
        id: "run-log-1",
        runId: "run-1",
        level: "info",
        message: "Working",
    });
    supabase.seed.judgement({
        id: "judgement-1",
        runId: "run-1",
        status: "passed",
        score: 100,
    });

    const runs = await service.listRuns("Bearer token-user-1");
    const run = await service.getRun("run-1", "Bearer token-user-1");
    const logs = await service.getRunLogs("run-1", "Bearer token-user-1");
    const judgement = await service.getJudgement("judgement-1");

    assert.equal(runs.items.length, 1);
    assert.equal(run.id, "run-1");
    assert.equal(logs.items.length, 1);
    assert.equal(logs.items[0].message, "Working");
    assert.equal(judgement.status, "passed");
});
