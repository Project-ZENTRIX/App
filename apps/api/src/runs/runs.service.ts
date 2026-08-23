import { BadRequestException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { errorKeys } from "../common/errors/error-keys.js";
import { SUPABASE_CLIENT } from "../common/supabase/supabase.module.js";
import { SupabaseClient } from "../common/supabase/supabase.client.js";
import { getTokenFromAuthorizationHeader } from "../auth/auth-crypto.js";

type CreateRunInput = {
    taskId: string;
    input?: string | null;
};

type RunRow = {
    id: string;
    user_id: string;
    task_id: string;
    status: string;
    input: string | null;
    output: string | null;
    error: string | null;
    runtime_ms: number | null;
    memory_kb: number | null;
    started_at: string | null;
    finished_at: string | null;
    created_at: string;
    submitted_at: string | null;
    deleted_at: string | null;
};

type RunLogRow = {
    id: string;
    run_id: string;
    level: string;
    message: string;
    created_at: string;
    archived_at: string | null;
};

type JudgementRow = {
    id: string;
    run_id: string;
    status: string;
    score: number | null;
    feedback: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
};

type SandboxJobRow = {
    id: string;
    run_id: string;
    status: string;
    retry_count: number;
    queue_name: string | null;
    resource_limit: unknown;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
};

type TaskRow = {
    id: string;
};

function toDate(value: string | null) {
    return value ? new Date(value) : null;
}

function mapRun(run: {
    id: string;
    user_id: string;
    task_id: string;
    status: string;
    input: string | null;
    output: string | null;
    error: string | null;
    runtime_ms: number | null;
    memory_kb: number | null;
    started_at: string | null;
    finished_at: string | null;
    created_at: string;
    submitted_at: string | null;
    deleted_at: string | null;
}) {
    return {
        id: run.id,
        userId: run.user_id,
        taskId: run.task_id,
        status: run.status,
        input: run.input,
        output: run.output,
        error: run.error,
        runtimeMs: run.runtime_ms,
        memoryKb: run.memory_kb,
        startedAt: toDate(run.started_at),
        finishedAt: toDate(run.finished_at),
        createdAt: new Date(run.created_at),
        submittedAt: toDate(run.submitted_at),
        deletedAt: toDate(run.deleted_at),
    };
}

function mapRunLog(log: {
    id: string;
    run_id: string;
    level: string;
    message: string;
    created_at: string;
    archived_at: string | null;
}) {
    return {
        id: log.id,
        runId: log.run_id,
        level: log.level,
        message: log.message,
        createdAt: new Date(log.created_at),
        archivedAt: toDate(log.archived_at),
    };
}

function mapJudgement(judgement: {
    id: string;
    run_id: string;
    status: string;
    score: number | null;
    feedback: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}) {
    return {
        id: judgement.id,
        runId: judgement.run_id,
        status: judgement.status,
        score: judgement.score,
        feedback: judgement.feedback,
        createdAt: new Date(judgement.created_at),
        updatedAt: new Date(judgement.updated_at),
        deletedAt: toDate(judgement.deleted_at),
    };
}

@Injectable()
export class RunsService {
    constructor(@Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient) {}

    private async requireSession(authorization?: string) {
        const token = getTokenFromAuthorizationHeader(authorization);
        if (!token) {
            throw new UnauthorizedException(errorKeys.unauthorized);
        }

        const session = await this.supabase.getCurrentUser(authorization);
        if (!session) {
            throw new UnauthorizedException(errorKeys.unauthorized);
        }

        return session;
    }

    private async requireTask(taskId: string) {
        const task = await this.supabase.selectOne<TaskRow>("public", "tasks", {
            id: taskId,
        });

        if (!task) {
            throw new BadRequestException("Task not found");
        }

        return task;
    }

    async createRun(authorization: string | undefined, body: CreateRunInput) {
        const session = await this.requireSession(authorization);
        if (!body?.taskId) {
            throw new BadRequestException(errorKeys.taskIdRequired);
        }

        await this.requireTask(body.taskId);

        const run = await this.supabase.insertRow<RunRow>("public", "runs", {
            user_id: session.id,
            task_id: body.taskId,
            status: "queued",
            input: body.input ?? null,
            output: null,
            error: null,
            runtime_ms: null,
            memory_kb: null,
            started_at: null,
            finished_at: null,
            submitted_at: new Date().toISOString(),
            deleted_at: null,
        });

        await this.supabase.insertRow<SandboxJobRow>("public", "sandbox_jobs", {
            run_id: run.id,
            status: "queued",
            retry_count: 0,
            queue_name: "default",
            resource_limit: null,
            deleted_at: null,
        });

        return mapRun(run);
    }

    async listRuns(authorization?: string) {
        const session = await this.requireSession(authorization);
        const runs = await this.supabase.selectRows<RunRow>(
            "public",
            "runs",
            {
                user_id: session.id,
                deleted_at: null,
            },
            "*",
            {
                column: "created_at",
                ascending: false,
            }
        );

        return {
            items: runs.map((run) => mapRun(run)),
        };
    }

    async getRun(runId: string, authorization?: string) {
        const session = await this.requireSession(authorization);
        const run = await this.supabase.selectOne<RunRow>("public", "runs", {
            id: runId,
            user_id: session.id,
            deleted_at: null,
        });

        return run ? mapRun(run) : null;
    }

    async getRunLogs(runId: string, authorization?: string) {
        const session = await this.requireSession(authorization);
        const run = await this.supabase.selectOne<RunRow>("public", "runs", {
            id: runId,
            user_id: session.id,
            deleted_at: null,
        });

        if (!run) {
            throw new BadRequestException(errorKeys.runNotFound);
        }

        const logs = await this.supabase.selectRows<RunLogRow>(
            "public",
            "run_logs",
            {
                run_id: runId,
                archived_at: null,
            },
            "*",
            {
                column: "created_at",
                ascending: true,
            }
        );

        return {
            runId,
            items: logs.map((log) => mapRunLog(log)),
        };
    }

    async getJudgement(judgementId: string) {
        const judgement = await this.supabase.selectOne<JudgementRow>("public", "judgements", {
            id: judgementId,
        });

        return judgement ? mapJudgement(judgement) : null;
    }
}
