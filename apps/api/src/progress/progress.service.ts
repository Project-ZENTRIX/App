import { BadRequestException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { errorKeys } from "../common/errors/error-keys.js";
import { SUPABASE_CLIENT } from "../common/supabase/supabase.module.js";
import { SupabaseClient } from "../common/supabase/supabase.client.js";

type ProgressEventInput = {
    courseId?: string | null;
    lessonId?: string | null;
    taskId?: string | null;
    eventType: string;
    payload?: Record<string, unknown> | null;
};

type LessonRow = {
    id: string;
    course_id: string;
    title: string;
    summary: string | null;
    sort_order: number;
    status: string;
};

type EnrollmentRow = {
    id: string;
    user_id: string;
    course_id: string;
    status: string;
    enrolled_at: string;
    completed_at: string | null;
};

type LessonProgressRow = {
    id: string;
    user_id: string;
    lesson_id: string;
    status: string;
    progress: number;
    updated_at: string;
    created_at: string;
};

type ProgressEventRow = {
    id: string;
    user_id: string;
    course_id: string | null;
    lesson_id: string | null;
    task_id: string | null;
    event_type: string;
    payload: unknown;
    created_at: string;
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

function toDate(value: string) {
    return new Date(value);
}

function toLessonProgressSummary(progress: LessonProgressRow, lesson?: LessonRow | null): LessonProgressSummary {
    return {
        lessonId: progress.lesson_id,
        status: progress.status,
        progress: progress.progress,
        lesson: lesson
            ? {
                  id: lesson.id,
                  courseId: lesson.course_id,
                  title: lesson.title,
                  summary: lesson.summary,
                  sortOrder: lesson.sort_order,
                  status: lesson.status,
              }
            : null,
    };
}

function toProgressEventPayload(event: ProgressEventRow) {
    return {
        id: event.id,
        userId: event.user_id,
        courseId: event.course_id,
        lessonId: event.lesson_id,
        taskId: event.task_id,
        eventType: event.event_type,
        payload: event.payload,
        createdAt: toDate(event.created_at),
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
    constructor(@Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient) {}

    private async requireCurrentUser(authorization?: string) {
        const user = await this.supabase.getCurrentUser(authorization);
        if (!user) {
            throw new UnauthorizedException(errorKeys.unauthorized);
        }

        return user;
    }

    private async loadLessons(courseId: string) {
        return this.supabase.selectRows<LessonRow>(
            "public",
            "lessons",
            {
                course_id: courseId,
            },
            "*",
            { column: "sort_order", ascending: true }
        );
    }

    private async loadLessonProgress(userId: string) {
        return this.supabase.selectRows<LessonProgressRow>(
            "public",
            "lesson_progress",
            {
                user_id: userId,
            },
            "*",
            { column: "updated_at", ascending: false }
        );
    }

    async getOverview(authorization?: string) {
        const session = await this.requireCurrentUser(authorization);
        const [enrollments, lessonProgresses, recentEvents] = await Promise.all([
            this.supabase.selectRows<EnrollmentRow>("public", "enrollments", { user_id: session.id }),
            this.loadLessonProgress(session.id),
            this.supabase.selectRows<ProgressEventRow>("public", "progress_events", { user_id: session.id }, "*", {
                column: "created_at",
                ascending: false,
            }),
        ]);

        const courseIds = Array.from(new Set(enrollments.map((enrollment) => enrollment.course_id)));
        const lessonTotals = await Promise.all(courseIds.map((courseId) => this.loadLessons(courseId)));
        const totalLessons = lessonTotals.reduce((total, lessons) => total + lessons.length, 0);
        const completedLessons = lessonProgresses.filter((progress) =>
            ["completed", "passed"].includes(progress.status)
        ).length;

        const lessonLookups = await Promise.all(
            lessonProgresses.map((progress) =>
                this.supabase.selectOne<LessonRow>("public", "lessons", { id: progress.lesson_id })
            )
        );

        return {
            userId: session.id,
            enrollments: enrollments.map((enrollment) => ({
                id: enrollment.id,
                courseId: enrollment.course_id,
                status: enrollment.status,
                enrolledAt: toDate(enrollment.enrolled_at),
                completedAt: enrollment.completed_at ? toDate(enrollment.completed_at) : null,
            })),
            lessonProgress: {
                totalLessons,
                completedLessons,
                completionRate: totalLessons > 0 ? completedLessons / totalLessons : 0,
                items: lessonProgresses.map((progress, index) => toLessonProgressSummary(progress, lessonLookups[index])),
            },
            recentEvents: recentEvents.map((event) => toProgressEventPayload(event)),
        };
    }

    async listEnrollments(authorization?: string) {
        const session = await this.requireCurrentUser(authorization);
        const items = await this.supabase.selectRows<EnrollmentRow>("public", "enrollments", { user_id: session.id });

        return {
            items: items.map((enrollment) => ({
                id: enrollment.id,
                courseId: enrollment.course_id,
                status: enrollment.status,
                enrolledAt: toDate(enrollment.enrolled_at),
                completedAt: enrollment.completed_at ? toDate(enrollment.completed_at) : null,
            })),
        };
    }

    async getCourseProgress(courseId: string, authorization?: string) {
        const session = await this.requireCurrentUser(authorization);
        const [lessons, lessonProgresses] = await Promise.all([
            this.loadLessons(courseId),
            this.loadLessonProgress(session.id),
        ]);

        const lessonLookup = new Map(lessons.map((lesson) => [lesson.id, lesson]));
        const items = lessonProgresses
            .filter((progress) => lessonLookup.get(progress.lesson_id)?.course_id === courseId)
            .map((progress) => toLessonProgressSummary(progress, lessonLookup.get(progress.lesson_id) ?? null));
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
        const session = await this.requireCurrentUser(authorization);
        const progress = await this.supabase.selectOne<LessonProgressRow>("public", "lesson_progress", {
            user_id: session.id,
            lesson_id: lessonId,
        });

        if (!progress) {
            return null;
        }

        const lesson = await this.supabase.selectOne<LessonRow>("public", "lessons", { id: lessonId });
        return toLessonProgressSummary(progress, lesson);
    }

    async listEvents(authorization?: string) {
        const session = await this.requireCurrentUser(authorization);
        const items = await this.supabase.selectRows<ProgressEventRow>(
            "public",
            "progress_events",
            { user_id: session.id },
            "*",
            {
                column: "created_at",
                ascending: false,
            }
        );

        return {
            items: items.map((event) => toProgressEventPayload(event)),
        };
    }

    async createEvent(authorization: string | undefined, body: ProgressEventInput) {
        const session = await this.requireCurrentUser(authorization);
        if (!body?.eventType || typeof body.eventType !== "string") {
            throw new BadRequestException(errorKeys.eventTypeRequired);
        }

        const createdEvent = await this.supabase.insertRow<ProgressEventRow>("public", "progress_events", {
            id: randomUUID(),
            user_id: session.id,
            course_id: body.courseId ?? null,
            lesson_id: body.lessonId ?? null,
            task_id: body.taskId ?? null,
            event_type: body.eventType,
            payload: body.payload ?? null,
        });

        const lessonState = body.lessonId ? inferLessonProgressState(body.eventType, body.payload) : null;
        if (body.lessonId && lessonState) {
            await this.supabase.upsertRow(
                "public",
                "lesson_progress",
                {
                    id: randomUUID(),
                    user_id: session.id,
                    lesson_id: body.lessonId,
                    status: lessonState.status,
                    progress: lessonState.progress,
                },
                "user_id,lesson_id"
            );
        }

        return toProgressEventPayload(createdEvent);
    }
}
