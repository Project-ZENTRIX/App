import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service.js";
import { errorKeys } from "../common/errors/error-keys.js";
import { getSessionFromAuthorizationHeader } from "../auth/auth-session.js";

type CreateSubmissionInput = {
    taskId: string;
    runId?: string | null;
    code?: string | null;
    language?: string | null;
};

function mapSubmission(submission: {
    id: string;
    userId: string;
    taskId: string;
    status: string;
    code: string | null;
    language: string | null;
    runId: string | null;
    submittedAt: Date;
    evaluatedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}) {
    return {
        id: submission.id,
        userId: submission.userId,
        taskId: submission.taskId,
        status: submission.status,
        code: submission.code,
        language: submission.language,
        runId: submission.runId,
        submittedAt: submission.submittedAt,
        evaluatedAt: submission.evaluatedAt,
        createdAt: submission.createdAt,
        updatedAt: submission.updatedAt,
    };
}

@Injectable()
export class SubmissionsService {
    constructor(private readonly prisma: PrismaService) {}

    private async requireSession(authorization?: string) {
        const session = await getSessionFromAuthorizationHeader(this.prisma, authorization);
        if (!session) {
            throw new UnauthorizedException(errorKeys.unauthorized);
        }

        return session;
    }

    private async requireTask(taskId: string) {
        const task = await this.prisma.task.findUnique({
            where: {
                id: taskId,
            },
        });

        if (!task) {
            throw new BadRequestException(errorKeys.taskNotFound);
        }

        return task;
    }

    private async requireRun(runId: string, userId: string) {
        const run = await this.prisma.run.findFirst({
            where: {
                id: runId,
                userId,
                deletedAt: null,
            },
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
            await this.requireRun(body.runId, session.user.id as string);
        }

        const submission = await this.prisma.taskSubmission.create({
            data: {
                userId: session.user.id as string,
                taskId: body.taskId,
                runId: body.runId ?? null,
                code: body.code ?? null,
                language: body.language ?? null,
                status: body.runId ? "running" : "queued",
                submittedAt: new Date(),
            },
        });

        return mapSubmission(submission);
    }

    async listSubmissions(authorization?: string) {
        const session = await this.requireSession(authorization);
        const items = await this.prisma.taskSubmission.findMany({
            where: {
                userId: session.user.id as string,
            },
            orderBy: {
                submittedAt: "desc",
            },
        });

        return {
            items: items.map((submission) => mapSubmission(submission)),
        };
    }

    async getSubmission(submissionId: string, authorization?: string) {
        const session = await this.requireSession(authorization);
        const submission = await this.prisma.taskSubmission.findFirst({
            where: {
                id: submissionId,
                userId: session.user.id as string,
            },
        });

        return submission ? mapSubmission(submission) : null;
    }
}
