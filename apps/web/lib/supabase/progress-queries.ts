import { getCurrentUser, selectOne, selectRows } from "./browser-client";

type EnrollmentRow = {
    id: string;
    user_id: string;
    course_id: string;
    status: string;
    enrolled_at: string;
    completed_at: string | null;
};

type LessonRow = {
    id: string;
    course_id: string;
    title: string;
    summary: string | null;
    sort_order: number;
    status: string;
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

type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

export type ProgressOverview = {
    userId: string;
    enrollments: Array<{
        id: string;
        courseId: string;
        status: string;
        enrolledAt: string;
        completedAt: string | null;
    }>;
    lessonProgress: {
        totalLessons: number;
        completedLessons: number;
        completionRate: number;
        items: Array<{
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
        }>;
    };
    recentEvents: Array<{
        id: string;
        eventType: string;
        courseId: string | null;
        lessonId: string | null;
        taskId: string | null;
        payload: unknown;
        createdAt: string;
    }>;
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

async function requireCurrentUser(token?: string | null): Promise<CurrentUser> {
    const user = await getCurrentUser(token);
    if (!user) {
        throw new Error("Unauthorized");
    }

    return user;
}

async function loadLessons(courseId: string) {
    return selectRows<LessonRow>("public", "lessons", { course_id: courseId }, "*", { column: "sort_order", ascending: true });
}

async function loadLessonProgress(userId: string) {
    return selectRows<LessonProgressRow>("public", "lesson_progress", { user_id: userId }, "*", {
        column: "updated_at",
        ascending: false,
    });
}

function mapEnrollment(enrollment: EnrollmentRow) {
    return {
        id: enrollment.id,
        courseId: enrollment.course_id,
        status: enrollment.status,
        enrolledAt: enrollment.enrolled_at,
        completedAt: enrollment.completed_at,
    };
}

function mapProgressEvent(event: ProgressEventRow) {
    return {
        id: event.id,
        userId: event.user_id,
        courseId: event.course_id,
        lessonId: event.lesson_id,
        taskId: event.task_id,
        eventType: event.event_type,
        payload: event.payload,
        createdAt: event.created_at,
    };
}

export async function getProgressOverview(token?: string | null): Promise<ProgressOverview> {
    const session = await requireCurrentUser(token);
    const [enrollments, lessonProgresses, recentEvents] = await Promise.all([
        selectRows<EnrollmentRow>("public", "enrollments", { user_id: session.id }),
        loadLessonProgress(session.id),
        selectRows<ProgressEventRow>("public", "progress_events", { user_id: session.id }, "*", {
            column: "created_at",
            ascending: false,
        }),
    ]);

    const courseIds = Array.from(new Set(enrollments.map((enrollment) => enrollment.course_id)));
    const lessonTotals = await Promise.all(courseIds.map((courseId) => loadLessons(courseId)));
    const totalLessons = lessonTotals.reduce((total, lessons) => total + lessons.length, 0);
    const completedLessons = lessonProgresses.filter((progress) => ["completed", "passed"].includes(progress.status)).length;

    const lessonLookups = await Promise.all(
        lessonProgresses.map((progress) => selectOne<LessonRow>("public", "lessons", { id: progress.lesson_id }))
    );

    return {
        userId: session.id,
        enrollments: enrollments.map(mapEnrollment),
        lessonProgress: {
            totalLessons,
            completedLessons,
            completionRate: totalLessons > 0 ? completedLessons / totalLessons : 0,
            items: lessonProgresses.map((progress, index) => toLessonProgressSummary(progress, lessonLookups[index])),
        },
        recentEvents: recentEvents.map(mapProgressEvent),
    };
}

export async function listProgressEnrollments(token?: string | null) {
    const session = await requireCurrentUser(token);
    const items = await selectRows<EnrollmentRow>("public", "enrollments", { user_id: session.id });

    return {
        items: items.map(mapEnrollment),
    };
}

export async function getCourseProgress(courseId: string, token?: string | null) {
    const session = await requireCurrentUser(token);
    const [lessons, lessonProgresses] = await Promise.all([loadLessons(courseId), loadLessonProgress(session.id)]);

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

export async function getLessonProgress(lessonId: string, token?: string | null) {
    const session = await requireCurrentUser(token);
    const progress = await selectOne<LessonProgressRow>("public", "lesson_progress", {
        user_id: session.id,
        lesson_id: lessonId,
    });

    if (!progress) {
        return null;
    }

    const lesson = await selectOne<LessonRow>("public", "lessons", { id: lessonId });
    return toLessonProgressSummary(progress, lesson);
}

export async function listProgressEvents(token?: string | null) {
    const session = await requireCurrentUser(token);
    const items = await selectRows<ProgressEventRow>("public", "progress_events", { user_id: session.id }, "*", {
        column: "created_at",
        ascending: false,
    });

    return {
        items: items.map(mapProgressEvent),
    };
}
