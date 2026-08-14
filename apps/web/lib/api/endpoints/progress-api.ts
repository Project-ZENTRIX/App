import { apiRequest } from "../client";
import { getAuthorizedHeaders } from "../auth";

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

export function getProgressOverview() {
    return apiRequest<ProgressOverview>("/progress/overview", {
        method: "GET",
        headers: getAuthorizedHeaders(),
    });
}

export function listProgressEnrollments() {
    return apiRequest<{ items: ProgressOverview["enrollments"] }>("/progress/enrollments", {
        method: "GET",
        headers: getAuthorizedHeaders(),
    });
}

export function getCourseProgress(courseId: string) {
    return apiRequest<{
        courseId: string;
        totalLessons: number;
        completedLessons: number;
        completionRate: number;
        items: ProgressOverview["lessonProgress"]["items"];
    }>(`/progress/courses/${courseId}`, {
        method: "GET",
        headers: getAuthorizedHeaders(),
    });
}
