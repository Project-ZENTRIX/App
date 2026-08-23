import { selectOne, selectRows } from "./browser-client";

export type CourseStatus = "published" | "draft" | "archived";

type CourseRow = {
    id: string;
    slug: string;
    title: string;
    summary: string | null;
    cover: string | null;
    category: string | null;
    language: string | null;
    difficulty: string | null;
    tags: string[];
    price: string | number;
    currency: string;
    status: CourseStatus;
    version: number;
    version_label: string | null;
    unlock_scope: string;
    is_purchased: boolean;
    is_learnable: boolean;
    is_offline: boolean;
    supported_languages: string[];
    chapter_count: number;
    lesson_count: number;
    task_count: number;
    created_at: string;
    updated_at: string;
};

type ChapterRow = {
    id: string;
    course_id: string;
    title: string;
    summary: string | null;
    sort_order: number;
    status: CourseStatus;
    created_at: string;
    updated_at: string;
};

type LessonRow = {
    id: string;
    course_id: string;
    chapter_id: string | null;
    title: string;
    summary: string | null;
    duration_minutes: number;
    sort_order: number;
    status: CourseStatus;
    created_at: string;
    updated_at: string;
};

type TaskRow = {
    id: string;
    course_id: string;
    lesson_id: string | null;
    title: string;
    description: string | null;
    type: string | null;
    points: number;
    sort_order: number;
    status: CourseStatus;
    created_at: string;
    updated_at: string;
};

type ContentAssetRow = {
    id: string;
    course_id: string | null;
    lesson_id: string | null;
    task_id: string | null;
    file_name: string;
    mime_type: string | null;
    url: string;
    metadata: unknown;
    created_at: string;
};

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
    supportedLanguages: string[];
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

export type ContentAssetItem = {
    id: string;
    title: string;
    type: string;
    version: string;
    sizeLabel: string;
    mimeType: string;
    status: string;
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
    includedAssets: ContentAssetItem[];
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

type CourseQuery = {
    keyword?: string;
    category?: string;
    language?: string;
    difficulty?: string;
    status?: string;
    sort?: string;
    page?: number;
    pageSize?: number;
};

type CourseCatalog = {
    courses: CourseRow[];
    chapters: ChapterRow[];
    lessons: LessonRow[];
    tasks: TaskRow[];
    contentAssets: ContentAssetRow[];
};

function toNumber(value: string | number) {
    return typeof value === "number" ? value : Number(value);
}

function toDate(value: string) {
    return new Date(value);
}

function resolveStatusLabel(status: CourseStatus) {
    if (status === "published") {
        return "已发布";
    }

    if (status === "draft") {
        return "草稿";
    }

    return "已归档";
}

function resolveSupportedLanguages(course: Pick<CourseRow, "language" | "supported_languages">) {
    if (course.supported_languages.length > 0) {
        return course.supported_languages;
    }

    return course.language ? [course.language] : [];
}

function resolveAssetType(mimeType: string | null, metadataType: string | null | undefined) {
    if (metadataType) {
        return metadataType;
    }

    if (mimeType?.startsWith("image/")) {
        return "image";
    }

    if (mimeType?.includes("pdf")) {
        return "document";
    }

    return "file";
}

function resolveMetadataValue(metadata: unknown, key: string) {
    if (!metadata || typeof metadata !== "object") {
        return null;
    }

    const value = (metadata as Record<string, unknown>)[key];
    return typeof value === "string" ? value : null;
}

function resolveMetadataText(metadata: unknown, key: string, fallback: string) {
    return resolveMetadataValue(metadata, key) ?? fallback;
}

function mapCourseItem(course: CourseRow): CourseItem {
    const version = course.version_label ?? `v${course.version}`;

    return {
        id: course.id,
        title: course.title,
        summary: course.summary ?? "",
        cover: course.cover ?? "",
        category: course.category ?? "",
        language: course.language ?? "",
        difficulty: course.difficulty ?? "",
        tags: course.tags,
        price: toNumber(course.price),
        currency: course.currency,
        status: course.status,
        isPurchased: course.is_purchased,
        isLearnable: course.is_learnable,
        isOffline: course.is_offline,
        unlockScope: course.unlock_scope,
        lessonCount: course.lesson_count,
        chapterCount: course.chapter_count,
        taskCount: course.task_count,
        version,
        statusLabel: resolveStatusLabel(course.status),
        purchaseState: course.is_purchased ? "owned" : "available",
        supportedLanguages: resolveSupportedLanguages(course),
    };
}

function mapChapterItem(chapter: ChapterRow, lessonIds: string[]): CourseChapter {
    return {
        id: chapter.id,
        title: chapter.title,
        summary: chapter.summary ?? "",
        lessonCount: lessonIds.length,
        lessonIds,
    };
}

function mapLessonItem(lesson: LessonRow, taskIds: string[], assetIds: string[]): LessonItem {
    return {
        id: lesson.id,
        title: lesson.title,
        summary: lesson.summary ?? "",
        durationMinutes: lesson.duration_minutes,
        taskIds,
        assetIds,
    };
}

function mapContentAssetItem(asset: ContentAssetRow): ContentAssetItem {
    const metadataTitle = resolveMetadataValue(asset.metadata, "title");
    const metadataType = resolveMetadataValue(asset.metadata, "type");

    return {
        id: asset.id,
        title: metadataTitle ?? asset.file_name,
        type: resolveAssetType(asset.mime_type, metadataType),
        version: resolveMetadataText(asset.metadata, "version", "1.0.0"),
        sizeLabel: resolveMetadataText(asset.metadata, "sizeLabel", ""),
        mimeType: asset.mime_type ?? "application/octet-stream",
        status: resolveMetadataText(asset.metadata, "status", "published"),
    };
}

function buildCourseReleases(course: CourseRow): CourseRelease[] {
    const version = course.version_label ?? `v${course.version}`;
    return [
        {
            id: `release-${course.id}`,
            version,
            status: course.status,
            releasedAt: toDate(course.updated_at).toISOString(),
        },
    ];
}

function buildCourseVersions(course: CourseRow): CourseVersion[] {
    const version = course.version_label ?? `v${course.version}`;
    return [
        {
            version,
            status: course.status,
            releaseId: `release-${course.id}`,
        },
    ];
}

function filterCourses(courses: CourseRow[], query: CourseQuery) {
    const keyword = query.keyword?.trim().toLowerCase();

    return courses.filter((course) => {
        if (keyword) {
            const fields = [
                course.title,
                course.summary ?? "",
                course.category ?? "",
                course.language ?? "",
                course.difficulty ?? "",
                course.cover ?? "",
                course.unlock_scope,
                ...course.tags,
            ];
            if (!fields.some((field) => field.toLowerCase().includes(keyword))) {
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

function sortCourses(courses: CourseRow[], sort?: string) {
    const list = [...courses];

    if (sort === "latest") {
        return list.sort((left, right) => toDate(right.created_at).getTime() - toDate(left.created_at).getTime());
    }

    if (sort === "popular") {
        return list.sort((left, right) => {
            const purchased = Number(right.is_purchased) - Number(left.is_purchased);
            if (purchased !== 0) {
                return purchased;
            }

            const taskDelta = right.task_count - left.task_count;
            if (taskDelta !== 0) {
                return taskDelta;
            }

            return toDate(right.updated_at).getTime() - toDate(left.updated_at).getTime();
        });
    }

    return list.sort((left, right) => {
        const purchased = Number(right.is_purchased) - Number(left.is_purchased);
        if (purchased !== 0) {
            return purchased;
        }

        const learnable = Number(right.is_learnable) - Number(left.is_learnable);
        if (learnable !== 0) {
            return learnable;
        }

        return toDate(right.created_at).getTime() - toDate(left.created_at).getTime();
    });
}

async function loadCatalog() {
    const [courses, chapters, lessons, tasks, contentAssets] = await Promise.all([
        selectRows<CourseRow>("public", "courses", {}, "*", { column: "created_at", ascending: true }),
        selectRows<ChapterRow>("public", "chapters", {}, "*", { column: "sort_order", ascending: true }),
        selectRows<LessonRow>("public", "lessons", {}, "*", { column: "sort_order", ascending: true }),
        selectRows<TaskRow>("public", "tasks", {}, "*", { column: "sort_order", ascending: true }),
        selectRows<ContentAssetRow>("public", "content_assets", {}, "*", { column: "created_at", ascending: true }),
    ]);

    return {
        courses,
        chapters,
        lessons,
        tasks,
        contentAssets,
    } satisfies CourseCatalog;
}

function mapLessonWithRelations(lesson: LessonRow, tasks: TaskRow[], contentAssets: ContentAssetRow[]) {
    const taskIds = tasks.filter((task) => task.lesson_id === lesson.id).map((task) => task.id);
    const assetIds = contentAssets
        .filter((asset) => asset.lesson_id === lesson.id || taskIds.includes(asset.task_id ?? ""))
        .map((asset) => asset.id);
    return mapLessonItem(lesson, taskIds, Array.from(new Set(assetIds)));
}

function mapTaskWithRelations(task: TaskRow, contentAssets: ContentAssetRow[]) {
    const assetIds = contentAssets.filter((asset) => asset.task_id === task.id).map((asset) => asset.id);
    return {
        id: task.id,
        title: task.title,
        type: task.type ?? "analysis",
        points: task.points,
        assetIds,
    };
}

function collectIncludedAssets(courseId: string, lessons: LessonRow[], tasks: TaskRow[], contentAssets: ContentAssetRow[]) {
    const lessonIds = lessons.filter((lesson) => lesson.course_id === courseId).map((lesson) => lesson.id);
    const taskIds = tasks.filter((task) => task.course_id === courseId).map((task) => task.id);
    const ids = new Set<string>();

    contentAssets.forEach((asset) => {
        if (
            asset.course_id === courseId ||
            lessonIds.includes(asset.lesson_id ?? "") ||
            taskIds.includes(asset.task_id ?? "")
        ) {
            ids.add(asset.id);
        }
    });

    return Array.from(ids)
        .map((assetId) => contentAssets.find((asset) => asset.id === assetId))
        .filter((asset): asset is ContentAssetRow => Boolean(asset))
        .map(mapContentAssetItem);
}

function mapCourseDetail(course: CourseRow, catalog: CourseCatalog): CourseDetail {
    const chapters = catalog.chapters
        .filter((chapter) => chapter.course_id === course.id)
        .map((chapter) => {
            const lessonIds = catalog.lessons.filter((lesson) => lesson.chapter_id === chapter.id).map((lesson) => lesson.id);
            return mapChapterItem(chapter, lessonIds);
        });

    return {
        ...mapCourseItem(course),
        chapters,
        releases: buildCourseReleases(course),
        versions: buildCourseVersions(course),
        includedAssets: collectIncludedAssets(course.id, catalog.lessons, catalog.tasks, catalog.contentAssets),
        entitlement: {
            isPurchased: course.is_purchased,
            isLearnable: course.is_learnable,
            isOffline: course.is_offline,
        },
    };
}

export async function listCourses(query: CourseQuery = {}): Promise<CourseListResponse> {
    const catalog = await loadCatalog();
    const filtered = filterCourses(catalog.courses, query);
    const sorted = sortCourses(filtered, query.sort);
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const start = (page - 1) * pageSize;
    const items = sorted.slice(start, start + pageSize).map(mapCourseItem);

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

export async function getCourse(courseId: string): Promise<CourseDetail | null> {
    const catalog = await loadCatalog();
    const course = catalog.courses.find((item) => item.id === courseId);
    return course ? mapCourseDetail(course, catalog) : null;
}

export async function getCourseChapters(courseId: string) {
    const catalog = await loadCatalog();
    const course = catalog.courses.find((item) => item.id === courseId);
    if (!course) {
        return {
            courseId,
            items: [],
        };
    }

    return {
        courseId,
        items: catalog.chapters
            .filter((chapter) => chapter.course_id === courseId)
            .map((chapter) => {
                const lessonIds = catalog.lessons
                    .filter((lesson) => lesson.chapter_id === chapter.id)
                    .map((lesson) => lesson.id);
                return mapChapterItem(chapter, lessonIds);
            }),
    };
}

export async function getChapterLessons(chapterId: string) {
    const catalog = await loadCatalog();
    const chapter = catalog.chapters.find((item) => item.id === chapterId);
    if (!chapter) {
        return { chapterId, items: [] };
    }

    return {
        chapterId,
        items: catalog.lessons
            .filter((lesson) => lesson.chapter_id === chapterId)
            .map((lesson) => mapLessonWithRelations(lesson, catalog.tasks, catalog.contentAssets)),
    };
}

export async function getLesson(lessonId: string) {
    const catalog = await loadCatalog();
    const lesson = catalog.lessons.find((item) => item.id === lessonId);
    if (!lesson) {
        return null;
    }

    return mapLessonWithRelations(lesson, catalog.tasks, catalog.contentAssets);
}

export async function getTask(taskId: string) {
    const catalog = await loadCatalog();
    const task = catalog.tasks.find((item) => item.id === taskId);
    if (!task) {
        return null;
    }

    return mapTaskWithRelations(task, catalog.contentAssets);
}

export async function getContentAsset(assetId: string) {
    const asset = await selectOne<ContentAssetRow>("public", "content_assets", { id: assetId });
    return asset ? mapContentAssetItem(asset) : null;
}
