import { Controller, Get, Param, Query } from "@nestjs/common";
import { CourseQueryDto } from "./dto/course-query.dto.js";

type CourseStatus = "published" | "draft" | "archived";

type CourseItem = {
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
    supportedLanguages: string[];
};

type CourseChapter = {
    id: string;
    title: string;
    summary: string;
    lessonCount: number;
    lessonIds: string[];
};

type LessonItem = {
    id: string;
    title: string;
    summary: string;
    durationMinutes: number;
    taskIds: string[];
    assetIds: string[];
};

type TaskItem = {
    id: string;
    title: string;
    type: string;
    points: number;
    assetIds: string[];
};

type ContentAsset = {
    id: string;
    title: string;
    type: string;
    version: string;
    sizeLabel: string;
    mimeType: string;
    status: string;
};

type CourseRelease = {
    id: string;
    version: string;
    status: string;
    releasedAt: string;
};

const courses: CourseItem[] = [
    {
        id: "course-frontend-foundation",
        title: "前端工程基础课包",
        summary: "覆盖工程化、组件化、状态管理和常见页面开发流程。",
        cover: "/images/courses/frontend-foundation.png",
        category: "frontend",
        language: "zh-CN",
        difficulty: "beginner",
        tags: ["基础", "工程化", "Web"],
        price: 199,
        currency: "CNY",
        status: "published",
        isPurchased: true,
        isLearnable: true,
        isOffline: false,
        unlockScope: "full",
        lessonCount: 6,
        chapterCount: 2,
        taskCount: 4,
        version: "v1.3.0",
        supportedLanguages: ["zh-CN", "en-GB"],
    },
    {
        id: "course-api-design",
        title: "API 设计与后端契约课包",
        summary: "聚焦接口建模、状态字段、分页返回与前后端协作。",
        cover: "/images/courses/api-design.png",
        category: "backend",
        language: "zh-CN",
        difficulty: "intermediate",
        tags: ["API", "契约", "NestJS"],
        price: 299,
        currency: "CNY",
        status: "published",
        isPurchased: false,
        isLearnable: false,
        isOffline: false,
        unlockScope: "preview",
        lessonCount: 8,
        chapterCount: 3,
        taskCount: 6,
        version: "v2.1.0",
        supportedLanguages: ["zh-CN", "en-GB"],
    },
    {
        id: "course-creative-workflows",
        title: "内容制作与创作流程课包",
        summary: "适合内容生产、项目协作和交付流程的系统化训练。",
        cover: "/images/courses/creative-workflows.png",
        category: "productivity",
        language: "zh-CN",
        difficulty: "advanced",
        tags: ["内容", "流程", "协作"],
        price: 399,
        currency: "CNY",
        status: "archived",
        isPurchased: false,
        isLearnable: false,
        isOffline: false,
        unlockScope: "none",
        lessonCount: 5,
        chapterCount: 2,
        taskCount: 3,
        version: "v1.0.0",
        supportedLanguages: ["zh-CN", "en-GB"],
    },
];

const courseChapters: Record<string, CourseChapter[]> = {
    "course-frontend-foundation": [
        {
            id: "chapter-frontend-1",
            title: "工程基础",
            summary: "认识项目结构、工具链和核心规范。",
            lessonCount: 3,
            lessonIds: ["lesson-frontend-1", "lesson-frontend-2", "lesson-frontend-3"],
        },
        {
            id: "chapter-frontend-2",
            title: "页面交付",
            summary: "围绕页面开发、状态流与交互收尾。",
            lessonCount: 3,
            lessonIds: ["lesson-frontend-4", "lesson-frontend-5", "lesson-frontend-6"],
        },
    ],
    "course-api-design": [
        {
            id: "chapter-api-1",
            title: "领域划分",
            summary: "从资源和职责开始组织接口。",
            lessonCount: 3,
            lessonIds: ["lesson-api-1", "lesson-api-2", "lesson-api-3"],
        },
        {
            id: "chapter-api-2",
            title: "查询契约",
            summary: "统一分页、过滤和状态返回。",
            lessonCount: 3,
            lessonIds: ["lesson-api-4", "lesson-api-5", "lesson-api-6"],
        },
        {
            id: "chapter-api-3",
            title: "联调落地",
            summary: "处理边界、错误码和兼容策略。",
            lessonCount: 2,
            lessonIds: ["lesson-api-7", "lesson-api-8"],
        },
    ],
};

const lessons: Record<string, LessonItem> = {
    "lesson-frontend-1": {
        id: "lesson-frontend-1",
        title: "项目骨架",
        summary: "建立目录结构与基础约定。",
        durationMinutes: 20,
        taskIds: ["task-frontend-1"],
        assetIds: ["asset-frontend-1"],
    },
    "lesson-frontend-2": {
        id: "lesson-frontend-2",
        title: "组件系统",
        summary: "封装常用布局与交互组件。",
        durationMinutes: 35,
        taskIds: ["task-frontend-2"],
        assetIds: ["asset-frontend-2"],
    },
    "lesson-frontend-3": {
        id: "lesson-frontend-3",
        title: "状态管理",
        summary: "处理页面状态与数据流。",
        durationMinutes: 28,
        taskIds: ["task-frontend-3"],
        assetIds: ["asset-frontend-3"],
    },
    "lesson-api-1": {
        id: "lesson-api-1",
        title: "资源与边界",
        summary: "识别核心资源和职责边界。",
        durationMinutes: 24,
        taskIds: ["task-api-1"],
        assetIds: ["asset-api-1"],
    },
    "lesson-api-2": {
        id: "lesson-api-2",
        title: "分页与筛选",
        summary: "定义通用查询参数和返回格式。",
        durationMinutes: 30,
        taskIds: ["task-api-2"],
        assetIds: ["asset-api-2"],
    },
};

const tasks: Record<string, TaskItem> = {
    "task-frontend-1": {
        id: "task-frontend-1",
        title: "创建 Web 项目骨架",
        type: "implementation",
        points: 10,
        assetIds: ["asset-frontend-1"],
    },
    "task-frontend-2": {
        id: "task-frontend-2",
        title: "实现通用组件",
        type: "implementation",
        points: 20,
        assetIds: ["asset-frontend-2"],
    },
    "task-api-1": {
        id: "task-api-1",
        title: "梳理资源边界",
        type: "analysis",
        points: 12,
        assetIds: ["asset-api-1"],
    },
    "task-api-2": {
        id: "task-api-2",
        title: "统一查询协议",
        type: "analysis",
        points: 18,
        assetIds: ["asset-api-2"],
    },
};

const contentAssets: Record<string, ContentAsset> = {
    "asset-frontend-1": {
        id: "asset-frontend-1",
        title: "项目骨架参考图",
        type: "image",
        version: "1.0.0",
        sizeLabel: "1.2 MB",
        mimeType: "image/png",
        status: "published",
    },
    "asset-frontend-2": {
        id: "asset-frontend-2",
        title: "通用组件清单",
        type: "document",
        version: "1.1.0",
        sizeLabel: "180 KB",
        mimeType: "application/pdf",
        status: "published",
    },
    "asset-api-1": {
        id: "asset-api-1",
        title: "资源分层说明",
        type: "document",
        version: "1.0.0",
        sizeLabel: "96 KB",
        mimeType: "application/pdf",
        status: "published",
    },
    "asset-api-2": {
        id: "asset-api-2",
        title: "查询协议示例",
        type: "document",
        version: "1.0.1",
        sizeLabel: "112 KB",
        mimeType: "application/pdf",
        status: "published",
    },
};

const courseReleases: Record<string, CourseRelease[]> = {
    "course-frontend-foundation": [
        {
            id: "release-frontend-1",
            version: "v1.3.0",
            status: "published",
            releasedAt: "2026-07-01T09:00:00.000Z",
        },
        {
            id: "release-frontend-2",
            version: "v1.2.0",
            status: "archived",
            releasedAt: "2026-05-12T09:00:00.000Z",
        },
    ],
    "course-api-design": [
        {
            id: "release-api-1",
            version: "v2.1.0",
            status: "published",
            releasedAt: "2026-06-15T09:00:00.000Z",
        },
    ],
};

const courseVersions: Record<string, Array<{ version: string; status: string; releaseId: string }>> = {
    "course-frontend-foundation": [
        { version: "v1.3.0", status: "published", releaseId: "release-frontend-1" },
        { version: "v1.2.0", status: "archived", releaseId: "release-frontend-2" },
    ],
    "course-api-design": [{ version: "v2.1.0", status: "published", releaseId: "release-api-1" }],
};

@Controller()
export class CoursesController {
    private filterCourses(query: CourseQueryDto) {
        const keyword = query.keyword?.trim().toLowerCase();
        return courses.filter((course) => {
            if (keyword) {
                const matched = [course.title, course.summary, ...course.tags].some((field) =>
                    field.toLowerCase().includes(keyword)
                );
                if (!matched) {
                    return false;
                }
            }

            if (query.category && course.category !== query.category) {
                return false;
            }

            if (query.language && course.language !== query.language) {
                return false;
            }

            if (query.difficulty && course.difficulty !== query.difficulty) {
                return false;
            }

            if (query.status && course.status !== query.status) {
                return false;
            }

            return true;
        });
    }

    private enrichCourse(course: CourseItem) {
        return {
            ...course,
            statusLabel: course.status === "published" ? "已发布" : course.status === "draft" ? "草稿" : "已归档",
            purchaseState: course.isPurchased ? "owned" : "available",
            supportedLanguages: [course.language],
        };
    }

    @Get("courses")
    listCourses(@Query() query: CourseQueryDto) {
        const filtered = this.filterCourses(query);
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 10;
        const start = (page - 1) * pageSize;
        const items = filtered.slice(start, start + pageSize).map((course) => this.enrichCourse(course));

        return {
            items,
            pagination: {
                page,
                pageSize,
                total: filtered.length,
                totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
            },
        };
    }

    @Get("courses/:courseId")
    getCourse(@Param("courseId") courseId: string) {
        const course = courses.find((item) => item.id === courseId);
        if (!course) {
            return null;
        }

        return {
            ...this.enrichCourse(course),
            chapterCount: courseChapters[courseId]?.length ?? course.chapterCount,
            chapters: courseChapters[courseId] ?? [],
            releases: courseReleases[courseId] ?? [],
            versions: courseVersions[courseId] ?? [],
            includedAssets: this.getRelatedAssets(courseId),
            entitlement: {
                isPurchased: course.isPurchased,
                isLearnable: course.isLearnable,
                isOffline: course.isOffline,
            },
        };
    }

    @Get("courses/:courseId/chapters")
    getCourseChapters(@Param("courseId") courseId: string) {
        return {
            courseId,
            items: courseChapters[courseId] ?? [],
        };
    }

    @Get("chapters/:chapterId/lessons")
    getChapterLessons(@Param("chapterId") chapterId: string) {
        const chapter = Object.values(courseChapters)
            .flat()
            .find((item) => item.id === chapterId);
        if (!chapter) {
            return { chapterId, items: [] };
        }

        return {
            chapterId,
            items: chapter.lessonIds.map((lessonId) => lessons[lessonId]).filter((item): item is LessonItem => Boolean(item)),
        };
    }

    @Get("lessons/:lessonId")
    getLesson(@Param("lessonId") lessonId: string) {
        return lessons[lessonId] ?? null;
    }

    @Get("tasks/:taskId")
    getTask(@Param("taskId") taskId: string) {
        return tasks[taskId] ?? null;
    }

    @Get("content-assets/:assetId")
    getContentAsset(@Param("assetId") assetId: string) {
        return contentAssets[assetId] ?? null;
    }

    @Get("courses/:courseId/releases")
    getCourseReleases(@Param("courseId") courseId: string) {
        return {
            courseId,
            items: courseReleases[courseId] ?? [],
        };
    }

    @Get("courses/:courseId/versions")
    getCourseVersions(@Param("courseId") courseId: string) {
        return {
            courseId,
            items: courseVersions[courseId] ?? [],
        };
    }

    private getRelatedAssets(courseId: string) {
        const chapterList = courseChapters[courseId] ?? [];
        const lessonIds = chapterList.flatMap((chapter) => chapter.lessonIds);
        const assetIds = new Set<string>();

        lessonIds.forEach((lessonId) => {
            const lesson = lessons[lessonId];
            lesson?.assetIds.forEach((assetId) => assetIds.add(assetId));
            lesson?.taskIds.forEach((taskId) => {
                tasks[taskId]?.assetIds.forEach((assetId) => assetIds.add(assetId));
            });
        });

        return Array.from(assetIds)
            .map((assetId) => contentAssets[assetId])
            .filter((item): item is ContentAsset => Boolean(item));
    }
}
