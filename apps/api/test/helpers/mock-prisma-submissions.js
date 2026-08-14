function createMockPrismaSubmissions(state, clone, now) {
    let tick = 0;
    const nextTimestamp = () => new Date(Date.parse(now().toISOString()) + tick++ * 1000).toISOString();

    const findTaskById = (id) => state.tasks.find((task) => task.id === id) ?? null;
    const findRunById = (id) => state.runs.find((run) => run.id === id) ?? null;
    const findSubmissionById = (id) => state.submissions.find((submission) => submission.id === id) ?? null;

    return {
        task: {
            findUnique: async ({ where } = {}) => {
                const task = findTaskById(where?.id);
                return task ? clone(task) : null;
            },
        },
        run: {
            findMany: async ({ where, orderBy } = {}) => {
                const runs = state.runs.filter((run) => run.userId === where?.userId && run.deletedAt === where?.deletedAt);
                if (orderBy?.createdAt === "desc") {
                    runs.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
                }
                return runs.map((run) => clone(run));
            },
            findFirst: async ({ where } = {}) => {
                const run = state.runs.find(
                    (item) =>
                        item.id === where?.id &&
                        item.userId === where?.userId &&
                        item.deletedAt === where?.deletedAt
                );
                return run ? clone(run) : null;
            },
            create: async ({ data }) => {
                const run = {
                    id: `run-${state.runs.length + 1}`,
                    userId: data.userId,
                    taskId: data.taskId,
                    status: data.status ?? "queued",
                    input: data.input ?? null,
                    output: data.output ?? null,
                    error: data.error ?? null,
                    runtimeMs: data.runtimeMs ?? null,
                    memoryKb: data.memoryKb ?? null,
                    startedAt: data.startedAt ?? null,
                    finishedAt: data.finishedAt ?? null,
                    createdAt: nextTimestamp(),
                    submittedAt: data.submittedAt ?? null,
                    deletedAt: data.deletedAt ?? null,
                };
                state.runs.push(run);
                return clone(run);
            },
        },
        taskSubmission: {
            findMany: async ({ where, orderBy } = {}) => {
                const submissions = state.submissions.filter((submission) => submission.userId === where?.userId);
                if (orderBy?.submittedAt === "desc") {
                    submissions.sort((left, right) => right.submittedAt.localeCompare(left.submittedAt));
                }
                return submissions.map((submission) => clone(submission));
            },
            findFirst: async ({ where } = {}) => {
                const submission = state.submissions.find(
                    (item) => item.id === where?.id && item.userId === where?.userId
                );
                return submission ? clone(submission) : null;
            },
            create: async ({ data }) => {
                const submission = {
                    id: `submission-${state.submissions.length + 1}`,
                    userId: data.userId,
                    taskId: data.taskId,
                    status: data.status ?? "queued",
                    code: data.code ?? null,
                    language: data.language ?? null,
                    runId: data.runId ?? null,
                    submittedAt: data.submittedAt ?? nextTimestamp(),
                    evaluatedAt: data.evaluatedAt ?? null,
                    createdAt: nextTimestamp(),
                    updatedAt: nextTimestamp(),
                };
                state.submissions.push(submission);

                if (submission.runId) {
                    const run = findRunById(submission.runId);
                    if (run) {
                        run.submittedAt = submission.submittedAt;
                    }
                }

                return clone(submission);
            },
        },
        seed: {
            submission(data) {
                state.submissions.push({
                    id: data.id,
                    userId: data.userId,
                    taskId: data.taskId,
                    status: data.status ?? "queued",
                    code: data.code ?? null,
                    language: data.language ?? null,
                    runId: data.runId ?? null,
                    submittedAt: data.submittedAt ?? nextTimestamp(),
                    evaluatedAt: data.evaluatedAt ?? null,
                    createdAt: data.createdAt ?? nextTimestamp(),
                    updatedAt: data.updatedAt ?? nextTimestamp(),
                });
            },
        },
    };
}

module.exports = {
    createMockPrismaSubmissions,
};
