const assert = require("node:assert/strict");
const test = require("node:test");

const { SubmissionsController } = require("../dist/submissions/submissions.controller.js");

test("submissions controller proxies submission routes to the service", () => {
    const calls = [];
    const controller = new SubmissionsController({
        createSubmission: (authorization, body) => {
            calls.push(["create", authorization, body]);
            return { id: "submission-1" };
        },
        listSubmissions: (authorization) => {
            calls.push(["list", authorization]);
            return { items: [] };
        },
        getSubmission: (submissionId, authorization) => {
            calls.push(["get", submissionId, authorization]);
            return null;
        },
    });

    assert.deepEqual(
        controller.createSubmission("Bearer token-123", {
            taskId: "task-1",
            runId: "run-1",
            code: "console.log('hello')",
        }),
        { id: "submission-1" }
    );
    assert.deepEqual(controller.listSubmissions("Bearer token-123"), { items: [] });
    assert.equal(controller.getSubmission("submission-1", "Bearer token-123"), null);
    assert.deepEqual(calls, [
        ["create", "Bearer token-123", { taskId: "task-1", runId: "run-1", code: "console.log('hello')" }],
        ["list", "Bearer token-123"],
        ["get", "submission-1", "Bearer token-123"],
    ]);
});
