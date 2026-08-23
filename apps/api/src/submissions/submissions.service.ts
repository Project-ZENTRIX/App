import { BadRequestException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { errorKeys } from "../common/errors/error-keys.js";
import { SUPABASE_CLIENT } from "../common/supabase/supabase.module.js";
import { SupabaseClient } from "../common/supabase/supabase.client.js";
import { getTokenFromAuthorizationHeader } from "../auth/auth-crypto.js";

type CreateSubmissionInput = {
    taskId: string;
    runId?: string | null;
    code?: string | null;
    language?: string | null;
};

type SubmissionRow = {
    id: string;
    user_id: string;
    task_id: string;
    status: string;
    code: string | null;
    language: string | null;
    run_id: string | null;
    submitted_at: string;
    evaluated_at: string | null;
    created_at: string;
    updated_at: string;
};

function toDate(value: string) {
    return new Date(value);
}

function mapSubmission(submission: {
    id: string;
    user_id: string;
    task_id: string;
    status: string;
    code: string | null;
    language: string | null;
    run_id: string | null;
    submitted_at: string;
    evaluated_at: string | null;
    created_at: string;
    updated_at: string;
}) {
    return {
        id: submission.id,
        userId: submission.user_id,
        taskId: submission.task_id,
        status: submission.status,
        code: submission.code,
        language: submission.language,
        runId: submission.run_id,
        submittedAt: toDate(submission.submitted_at),
        evaluatedAt: submission.evaluated_at ? toDate(submission.evaluated_at) : null,
        createdAt: toDate(submission.created_at),
        updatedAt: toDate(submission.updated_at),
    };
}

@Injectable()
export class SubmissionsService {
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
        const task = await this.supabase.selectOne<{
            id: string;
        }>("public", "tasks", {
            id: taskId,
        });

        if (!task) {
            throw new BadRequestException(errorKeys.taskNotFound);
        }

        return task;
    }

    private async requireRun(runId: string, userId: string) {
        const run = await this.supabase.selectOne<{
            id: string;
        }>("public", "runs", {
            id: runId,
            user_id: userId,
            deleted_at: null,
        });

        if (!run) {
            throw new BadRequestException(errorKeys.runNotFound);
        }

        return run;
    }

    async createSubmission(authorization: string | undefined, body: CreateSubmissionInput) {
        const session = await this.requireSession(authorization);
        if (!body?.taskId) {
            throw new BadRequestException(errorKeys.taskIdRequired);
        }

        await this.requireTask(body.taskId);
        if (body.runId) {
            await this.requireRun(body.runId, session.id);
        }

        const submission = await this.supabase.insertRow<SubmissionRow>("public", "task_submissions", {
            user_id: session.id,
            task_id: body.taskId,
            run_id: body.runId ?? null,
            code: body.code ?? null,
            language: body.language ?? null,
            status: body.runId ? "running" : "queued",
            submitted_at: new Date().toISOString(),
        });

        return mapSubmission(submission);
    }

    async listSubmissions(authorization?: string) {
        const session = await this.requireSession(authorization);
        const items = await this.supabase.selectRows<SubmissionRow>(
            "public",
            "task_submissions",
            {
                user_id: session.id,
            },
            "*",
            {
                column: "submitted_at",
                ascending: false,
            }
        );

        return {
            items: items.map((submission) => mapSubmission(submission)),
        };
    }

    async getSubmission(submissionId: string, authorization?: string) {
        const session = await this.requireSession(authorization);
        const submission = await this.supabase.selectOne<SubmissionRow>("public", "task_submissions", {
            id: submissionId,
            user_id: session.id,
        });

        return submission ? mapSubmission(submission) : null;
    }
}
