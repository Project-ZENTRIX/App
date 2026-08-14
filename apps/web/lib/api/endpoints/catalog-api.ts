import { apiRequest } from "../client";

export type CourseStatus = "published" | "draft" | "archived";

export type CourseItem = {
    id: string;
    title: string;
    summary: string;
    cover: string;
    category: string;
    language: string;
    difficulty: string;
    tags: string[];
    price: number;
    currency: string;
    status: CourseStatus;
    isPurchased: boolean;
    isLearnable: boolean;
    isOffline: boolean;
    unlockScope: string;
    lessonCount: number;
    chapterCount: number;
    taskCount: number;
    version: string;
    statusLabel: string;
    purchaseState: string;
};

export type CourseChapter = {
    id: string;
    title: string;
    summary: string;
    lessonCount: number;
    lessonIds: string[];
};

export type LessonItem = {
    id: string;
    title: string;
    summary: string;
    durationMinutes: number;
    taskIds: string[];
    assetIds: string[];
};

export type CourseRelease = {
    id: string;
    version: string;
    status: string;
    releasedAt: string;
};

export type CourseVersion = {
    version: string;
    status: string;
    releaseId: string;
};

export type CourseDetail = CourseItem & {
    chapters: CourseChapter[];
    releases: CourseRelease[];
    versions: CourseVersion[];
    includedAssets: Array<{
        id: string;
        title: string;
        type: string;
        version: string;
        sizeLabel: string;
        mimeType: string;
        status: string;
    }>;
    entitlement: {
        isPurchased: boolean;
        isLearnable: boolean;
        isOffline: boolean;
    };
};

export type CourseListResponse = {
    items: CourseItem[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
};

function buildQueryString(params: Record<string, string | number | undefined>) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
            searchParams.set(key, String(value));
        }
    });

    const query = searchParams.toString();
    return query ? `?${query}` : "";
}

export function listCourses(
    params: {
        keyword?: string;
        category?: string;
        language?: string;
        difficulty?: string;
        status?: string;
        sort?: string;
        page?: number;
        pageSize?: number;
    } = {}
) {
    return apiRequest<CourseListResponse>(`/courses${buildQueryString(params)}`, {
        method: "GET",
    });
}

export function getCourse(courseId: string) {
    return apiRequest<CourseDetail | null>(`/courses/${courseId}`, {
        method: "GET",
    });
}

export function getCourseChapters(courseId: string) {
    return apiRequest<{ courseId: string; items: CourseChapter[] }>(`/courses/${courseId}/chapters`, {
        method: "GET",
    });
}

export function getChapterLessons(chapterId: string) {
    return apiRequest<{ chapterId: string; items: LessonItem[] }>(`/chapters/${chapterId}/lessons`, {
        method: "GET",
    });
}
