import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service.js";
import { errorKeys } from "../common/errors/error-keys.js";
import { getSessionFromAuthorizationHeader } from "../auth/auth-session.js";

type ProgressEventInput = {
    courseId?: string | null;
    lessonId?: string | null;
    taskId?: string | null;
    eventType: string;
    payload?: Record<string, unknown> | null;
};

type LessonProgressSummary = {
    lessonId: string;
    status: string;
    progress: number;
    lesson: {
        id: string;
        courseId: string;
        title: string;
        summary: string | null;
        sortOrder: number;
        status: string;
    } | null;
};

function toLessonProgressSummary(progress: {
    lessonId: string;
    status: string;
    progress: number;
    lesson?: {
        id: string;
        courseId: string;
        title: string;
        summary: string | null;
        sortOrder: number;
        status: string;
    } | null;
}): LessonProgressSummary {
    return {
        lessonId: progress.lessonId,
        status: progress.status,
        progress: progress.progress,
        lesson: progress.lesson ?? null,
    };
}

function toProgressEventPayload(event: {
    id: string;
    userId: string;
    courseId: string | null;
    lessonId: string | null;
    taskId: string | null;
    eventType: string;
    payload: unknown;
    createdAt: Date;
}) {
    return {
        id: event.id,
        userId: event.userId,
        courseId: event.courseId,
        lessonId: event.lessonId,
        taskId: event.taskId,
        eventType: event.eventType,
        payload: event.payload,
        createdAt: event.createdAt,
    };
}

function inferLessonProgressState(
    eventType: string,
    payload?: Record<string, unknown> | null
): { status: "completed" | "submitted" | "in_progress"; progress: number } | null {
    if (eventType === "lesson_completed") {
        return { status: "completed", progress: 100 };
    }

    if (eventType === "lesson_submitted") {
        return { status: "submitted", progress: 100 };
    }

    if (eventType === "lesson_progressed") {
        const value = payload?.progress;
        if (typeof value === "number" && Number.isFinite(value)) {
            return { status: "in_progress", progress: Math.max(0, Math.min(100, Math.trunc(value))) };
        }
    }

    if (eventType === "lesson_started") {
        return { status: "in_progress", progress: 0 };
    }

    return null;
}

@Injectable()
export class ProgressService {
    constructor(private readonly prisma: PrismaService) {}

    private async requireSession(authorization?: string) {
        const session = await getSessionFromAuthorizationHeader(this.prisma, authorization);
        if (!session) {
            throw new UnauthorizedException(errorKeys.unauthorized);
        }

        return session;
    }

    async getOverview(authorization?: string) {
        const session = await this.requireSession(authorization);
        const userId = session.user.id as string;
        const [enrollments, lessonProgresses, recentEvents] = await Promise.all([
            this.prisma.enrollment.findMany({
                where: {
                    userId,
                },
            }),
            this.prisma.lessonProgress.findMany({
                where: {
                    userId,
                },
                include: {
                    lesson: true,
                },
            }),
            this.prisma.progressEvent.findMany({
                where: {
                    userId,
                },
                orderBy: {
                    createdAt: "desc",
                },
            }),
        ]);

        const courseIds = Array.from(new Set(enrollments.map((enrollment) => enrollment.courseId)));
        const lessonTotals = await Promise.all(
            courseIds.map(async (courseId) => this.prisma.lesson.findMany({ where: { courseId } }))
        );
        const totalLessons = lessonTotals.reduce((total, lessons) => total + lessons.length, 0);
        const completedLessons = lessonProgresses.filter((progress) =>
            ["completed", "passed"].includes(progress.status)
        ).length;

        return {
            userId,
            enrollments: enrollments.map((enrollment) => ({
                id: enrollment.id,
                courseId: enrollment.courseId,
                status: enrollment.status,
                enrolledAt: enrollment.enrolledAt,
                completedAt: enrollment.completedAt,
            })),
            lessonProgress: {
                totalLessons,
                completedLessons,
                completionRate: totalLessons > 0 ? completedLessons / totalLessons : 0,
                items: lessonProgresses.map((progress) => toLessonProgressSummary(progress)),
            },
            recentEvents: recentEvents.map((event) => toProgressEventPayload(event)),
        };
    }

    async listEnrollments(authorization?: string) {
        const session = await this.requireSession(authorization);
        const items = await this.prisma.enrollment.findMany({
            where: {
                userId: session.user.id as string,
            },
        });

        return {
            items: items.map((enrollment) => ({
                id: enrollment.id,
                courseId: enrollment.courseId,
                status: enrollment.status,
                enrolledAt: enrollment.enrolledAt,
                completedAt: enrollment.completedAt,
            })),
        };
    }

    async getCourseProgress(courseId: string, authorization?: string) {
        const session = await this.requireSession(authorization);
        const [lessons, lessonProgresses] = await Promise.all([
            this.prisma.lesson.findMany({
                where: {
                    courseId,
                },
            }),
            this.prisma.lessonProgress.findMany({
                where: {
                    userId: session.user.id as string,
                },
                include: {
                    lesson: true,
                },
            }),
        ]);

        const items = lessonProgresses
            .filter((progress) => progress.lesson?.courseId === courseId)
            .map((progress) => toLessonProgressSummary(progress));
        const completedLessons = items.filter((item) => ["completed", "passed"].includes(item.status)).length;

        return {
            courseId,
            totalLessons: lessons.length,
            completedLessons,
            completionRate: lessons.length > 0 ? completedLessons / lessons.length : 0,
            items,
        };
    }

    async getLessonProgress(lessonId: string, authorization?: string) {
        const session = await this.requireSession(authorization);
        const progress = await this.prisma.lessonProgress.findUnique({
            where: {
                userId_lessonId: {
                    userId: session.user.id as string,
                    lessonId,
                },
            },
            include: {
                lesson: true,
            },
        });

        return progress ? toLessonProgressSummary(progress) : null;
    }

    async listEvents(authorization?: string) {
        const session = await this.requireSession(authorization);
        const items = await this.prisma.progressEvent.findMany({
            where: {
                userId: session.user.id as string,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return {
            items: items.map((event) => toProgressEventPayload(event)),
        };
    }

    async createEvent(authorization: string | undefined, body: ProgressEventInput) {
        const session = await this.requireSession(authorization);
        if (!body?.eventType || typeof body.eventType !== "string") {
            throw new BadRequestException(errorKeys.eventTypeRequired);
        }

        const event = await this.prisma.$transaction(async (tx) => {
            const createdEvent = await tx.progressEvent.create({
                data: {
                    userId: session.user.id as string,
                    courseId: body.courseId ?? null,
                    lessonId: body.lessonId ?? null,
                    taskId: body.taskId ?? null,
                    eventType: body.eventType,
                    payload:
                        body.payload === null
                            ? Prisma.JsonNull
                            : body.payload
                              ? (body.payload as Prisma.InputJsonValue)
                              : undefined,
                },
            });

            const lessonState = body.lessonId ? inferLessonProgressState(body.eventType, body.payload) : null;
            if (body.lessonId && lessonState) {
                await tx.lessonProgress.upsert({
                    where: {
                        userId_lessonId: {
                            userId: session.user.id as string,
                            lessonId: body.lessonId,
                        },
                    },
                    create: {
                        userId: session.user.id as string,
                        lessonId: body.lessonId,
                        status: lessonState.status,
                        progress: lessonState.progress,
                    },
                    update: {
                        status: lessonState.status,
                        progress: lessonState.progress,
                    },
                    include: {
                        lesson: true,
                    },
                });
            }

            return createdEvent;
        });

        return toProgressEventPayload(event);
    }
}
