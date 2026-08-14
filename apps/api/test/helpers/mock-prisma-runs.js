function createMockPrismaRuns(state, clone, now) {
    let tick = 0;
    const nextTimestamp = () => new Date(Date.parse(now().toISOString()) + tick++ * 1000).toISOString();

    const findTaskById = (id) => state.tasks.find((task) => task.id === id) ?? null;
    const findRunById = (id) => state.runs.find((run) => run.id === id) ?? null;
    const findJudgementById = (id) => state.judgements.find((judgement) => judgement.id === id) ?? null;

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
            update: async ({ where, data }) => {
                const run = findRunById(where.id);
                if (!run) {
                    throw new Error("run not found");
                }

                Object.assign(run, data);
                return clone(run);
            },
        },
        runLog: {
            findMany: async ({ where, orderBy } = {}) => {
                const logs = state.runLogs.filter((log) => log.runId === where?.runId && log.archivedAt === where?.archivedAt);
                if (orderBy?.createdAt === "asc") {
                    logs.sort((left, right) => left.createdAt.localeCompare(right.createdAt));
                }
                return logs.map((log) => clone(log));
            },
            create: async ({ data }) => {
                const log = {
                    id: `run-log-${state.runLogs.length + 1}`,
                    runId: data.runId,
                    level: data.level,
                    message: data.message,
                    createdAt: nextTimestamp(),
                    archivedAt: data.archivedAt ?? null,
                };
                state.runLogs.push(log);
                return clone(log);
            },
        },
        judgement: {
            findUnique: async ({ where } = {}) => {
                const judgement = findJudgementById(where?.id);
                return judgement ? clone(judgement) : null;
            },
            create: async ({ data }) => {
                const judgement = {
                    id: `judgement-${state.judgements.length + 1}`,
                    runId: data.runId,
                    status: data.status ?? "pending",
                    score: data.score ?? null,
                    feedback: data.feedback ?? null,
                    createdAt: nextTimestamp(),
                    updatedAt: nextTimestamp(),
                    deletedAt: data.deletedAt ?? null,
                };
                state.judgements.push(judgement);
                return clone(judgement);
            },
        },
        sandboxJob: {
            create: async ({ data }) => {
                const job = {
                    id: `sandbox-job-${state.sandboxJobs.length + 1}`,
                    runId: data.runId,
                    status: data.status ?? "queued",
                    retryCount: data.retryCount ?? 0,
                    queueName: data.queueName ?? null,
                    resourceLimit: data.resourceLimit ?? null,
                    createdAt: nextTimestamp(),
                    updatedAt: nextTimestamp(),
                    deletedAt: data.deletedAt ?? null,
                };
                state.sandboxJobs.push(job);
                return clone(job);
            },
        },
        submission: {
            findUnique: async ({ where } = {}) => {
                const submission = state.submissions.find((item) => item.runId === where?.runId) ?? null;
                return submission ? clone(submission) : null;
            },
        },
        seed: {
            task(data) {
                state.tasks.push({
                    id: data.id,
                    courseId: data.courseId,
                    lessonId: data.lessonId ?? null,
                    title: data.title,
                    description: data.description ?? null,
                    sortOrder: data.sortOrder ?? 0,
                    status: data.status ?? "draft",
                    createdAt: nextTimestamp(),
                    updatedAt: nextTimestamp(),
                });
            },
            run(data) {
                state.runs.push({
                    id: data.id,
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
                    createdAt: data.createdAt ?? nextTimestamp(),
                    submittedAt: data.submittedAt ?? null,
                    deletedAt: data.deletedAt ?? null,
                });
            },
            runLog(data) {
                state.runLogs.push({
                    id: data.id,
                    runId: data.runId,
                    level: data.level,
                    message: data.message,
                    createdAt: data.createdAt ?? nextTimestamp(),
                    archivedAt: data.archivedAt ?? null,
                });
            },
            judgement(data) {
                state.judgements.push({
                    id: data.id,
                    runId: data.runId,
                    status: data.status ?? "pending",
                    score: data.score ?? null,
                    feedback: data.feedback ?? null,
                    createdAt: data.createdAt ?? nextTimestamp(),
                    updatedAt: data.updatedAt ?? nextTimestamp(),
                    deletedAt: data.deletedAt ?? null,
                });
            },
            sandboxJob(data) {
                state.sandboxJobs.push({
                    id: data.id,
                    runId: data.runId,
                    status: data.status ?? "queued",
                    retryCount: data.retryCount ?? 0,
                    queueName: data.queueName ?? null,
                    resourceLimit: data.resourceLimit ?? null,
                    createdAt: data.createdAt ?? nextTimestamp(),
                    updatedAt: data.updatedAt ?? nextTimestamp(),
                    deletedAt: data.deletedAt ?? null,
                });
            },
        },
    };
}

module.exports = {
    createMockPrismaRuns,
};
