import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service.js";
import { errorKeys } from "../common/errors/error-keys.js";
import { getSessionFromAuthorizationHeader } from "../auth/auth-session.js";

type CreateRunInput = {
    taskId: string;
    input?: string | null;
};

function mapRun(run: {
    id: string;
    userId: string;
    taskId: string;
    status: string;
    input: string | null;
    output: string | null;
    error: string | null;
    runtimeMs: number | null;
    memoryKb: number | null;
    startedAt: Date | null;
    finishedAt: Date | null;
    createdAt: Date;
    submittedAt: Date | null;
    deletedAt: Date | null;
}) {
    return {
        id: run.id,
        userId: run.userId,
        taskId: run.taskId,
        status: run.status,
        input: run.input,
        output: run.output,
        error: run.error,
        runtimeMs: run.runtimeMs,
        memoryKb: run.memoryKb,
        startedAt: run.startedAt,
        finishedAt: run.finishedAt,
        createdAt: run.createdAt,
        submittedAt: run.submittedAt,
        deletedAt: run.deletedAt,
    };
}

function mapRunLog(log: {
    id: string;
    runId: string;
    level: string;
    message: string;
    createdAt: Date;
    archivedAt: Date | null;
}) {
    return {
        id: log.id,
        runId: log.runId,
        level: log.level,
        message: log.message,
        createdAt: log.createdAt,
        archivedAt: log.archivedAt,
    };
}

function mapJudgement(judgement: {
    id: string;
    runId: string;
    status: string;
    score: number | null;
    feedback: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}) {
    return {
        id: judgement.id,
        runId: judgement.runId,
        status: judgement.status,
        score: judgement.score,
        feedback: judgement.feedback,
        createdAt: judgement.createdAt,
        updatedAt: judgement.updatedAt,
        deletedAt: judgement.deletedAt,
    };
}

@Injectable()
export class RunsService {
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

        const run = await this.prisma.$transaction(async (tx) => {
            const createdRun = await tx.run.create({
                data: {
                    userId: session.user.id as string,
                    taskId: body.taskId,
                    status: "queued",
                    input: body.input ?? null,
                    submittedAt: new Date(),
                },
            });

            await tx.sandboxJob.create({
                data: {
                    runId: createdRun.id,
                    status: "queued",
                    retryCount: 0,
                    queueName: "default",
                    resourceLimit: Prisma.JsonNull,
                },
            });

            return createdRun;
        });

        return mapRun(run);
    }

    async listRuns(authorization?: string) {
        const session = await this.requireSession(authorization);
        const runs = await this.prisma.run.findMany({
            where: {
                userId: session.user.id as string,
                deletedAt: null,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return {
            items: runs.map((run) => mapRun(run)),
        };
    }

    async getRun(runId: string, authorization?: string) {
        const session = await this.requireSession(authorization);
        const run = await this.prisma.run.findFirst({
            where: {
                id: runId,
                userId: session.user.id as string,
                deletedAt: null,
            },
        });

        return run ? mapRun(run) : null;
    }

    async getRunLogs(runId: string, authorization?: string) {
        const session = await this.requireSession(authorization);
        const run = await this.prisma.run.findFirst({
            where: {
                id: runId,
                userId: session.user.id as string,
                deletedAt: null,
            },
        });

        if (!run) {
            throw new BadRequestException(errorKeys.runNotFound);
        }

        const logs = await this.prisma.runLog.findMany({
            where: {
                runId,
                archivedAt: null,
            },
            orderBy: {
                createdAt: "asc",
            },
        });

        return {
            runId,
            items: logs.map((log) => mapRunLog(log)),
        };
    }

    async getJudgement(judgementId: string) {
        const judgement = await this.prisma.judgement.findUnique({
            where: {
                id: judgementId,
            },
        });

        return judgement ? mapJudgement(judgement) : null;
    }
}
