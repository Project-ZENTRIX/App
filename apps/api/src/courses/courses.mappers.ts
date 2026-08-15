type CourseStatus = "published" | "draft" | "archived";

export type CourseRecord = {
    id: string;
    slug: string;
    title: string;
    summary: string | null;
    cover: string | null;
    category: string | null;
    language: string | null;
    difficulty: string | null;
    tags: string[];
    price: unknown;
    currency: string;
    status: CourseStatus;
    version: number;
    versionLabel: string | null;
    unlockScope: string;
    isPurchased: boolean;
    isLearnable: boolean;
    isOffline: boolean;
    supportedLanguages: string[];
    chapterCount: number;
    lessonCount: number;
    taskCount: number;
    createdAt: Date;
    updatedAt: Date;
};

export type ChapterRecord = {
    id: string;
    courseId: string;
    title: string;
    summary: string | null;
    sortOrder: number;
    status: CourseStatus;
    createdAt: Date;
    updatedAt: Date;
};

export type LessonRecord = {
    id: string;
    courseId: string;
    chapterId: string | null;
    title: string;
    summary: string | null;
    durationMinutes: number;
    sortOrder: number;
    status: CourseStatus;
    createdAt: Date;
    updatedAt: Date;
};

export type TaskRecord = {
    id: string;
    courseId: string;
    lessonId: string | null;
    title: string;
    description: string | null;
    type: string | null;
    points: number;
    sortOrder: number;
    status: CourseStatus;
    createdAt: Date;
    updatedAt: Date;
};

export type ContentAssetRecord = {
    id: string;
    courseId: string | null;
    lessonId: string | null;
    taskId: string | null;
    fileName: string;
    mimeType: string | null;
    url: string;
    metadata: unknown;
    createdAt: Date;
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

export type TaskItem = {
    id: string;
    title: string;
    type: string;
    points: number;
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

function toNumber(value: unknown) {
    if (typeof value === "number") {
        return value;
    }

    if (typeof value === "string") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }

    if (value && typeof (value as { toNumber?: () => number }).toNumber === "function") {
        return (value as { toNumber: () => number }).toNumber();
    }

    return 0;
}

function toDate(value: Date | string) {
    return value instanceof Date ? value : new Date(value);
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

function resolveSupportedLanguages(course: Pick<CourseRecord, "language" | "supportedLanguages">) {
    if (course.supportedLanguages.length > 0) {
        return course.supportedLanguages;
    }

    return course.language ? [course.language] : [];
}

export function mapCourseItem(course: CourseRecord): CourseItem {
    const version = course.versionLabel ?? `v${course.version}`;
    const cover = course.cover ?? "";
    const category = course.category ?? "";
    const language = course.language ?? "";
    const difficulty = course.difficulty ?? "";
    const summary = course.summary ?? "";

    return {
        id: course.id,
        title: course.title,
        summary,
        cover,
        category,
        language,
        difficulty,
        tags: course.tags,
        price: toNumber(course.price),
        currency: course.currency,
        status: course.status,
        isPurchased: course.isPurchased,
        isLearnable: course.isLearnable,
        isOffline: course.isOffline,
        unlockScope: course.unlockScope,
        lessonCount: course.lessonCount,
        chapterCount: course.chapterCount,
        taskCount: course.taskCount,
        version,
        statusLabel: resolveStatusLabel(course.status),
        purchaseState: course.isPurchased ? "owned" : "available",
        supportedLanguages: resolveSupportedLanguages(course),
    };
}

export function mapChapterItem(chapter: ChapterRecord, lessonIds: string[]) {
    return {
        id: chapter.id,
        title: chapter.title,
        summary: chapter.summary ?? "",
        lessonCount: lessonIds.length,
        lessonIds,
    } satisfies CourseChapter;
}

export function mapLessonItem(lesson: LessonRecord, taskIds: string[], assetIds: string[]) {
    return {
        id: lesson.id,
        title: lesson.title,
        summary: lesson.summary ?? "",
        durationMinutes: lesson.durationMinutes,
        taskIds,
        assetIds,
    } satisfies LessonItem;
}

export function mapTaskItem(task: TaskRecord, assetIds: string[]) {
    return {
        id: task.id,
        title: task.title,
        type: task.type ?? "analysis",
        points: task.points,
        assetIds,
    } satisfies TaskItem;
}

export function mapContentAssetItem(asset: ContentAssetRecord) {
    const metadataTitle = resolveMetadataValue(asset.metadata, "title");
    const metadataType = resolveMetadataValue(asset.metadata, "type");
    const version = resolveMetadataText(asset.metadata, "version", "1.0.0");
    const sizeLabel = resolveMetadataText(asset.metadata, "sizeLabel", "");
    const status = resolveMetadataText(asset.metadata, "status", "published");

    return {
        id: asset.id,
        title: metadataTitle ?? asset.fileName,
        type: resolveAssetType(asset.mimeType, metadataType),
        version,
        sizeLabel,
        mimeType: asset.mimeType ?? "application/octet-stream",
        status,
    } satisfies ContentAssetItem;
}

export function buildCourseReleases(course: CourseRecord): CourseRelease[] {
    const version = course.versionLabel ?? `v${course.version}`;
    return [
        {
            id: `release-${course.id}`,
            version,
            status: course.status,
            releasedAt: toDate(course.updatedAt).toISOString(),
        },
    ];
}

export function buildCourseVersions(course: CourseRecord): CourseVersion[] {
    const version = course.versionLabel ?? `v${course.version}`;
    return [
        {
            version,
            status: course.status,
            releaseId: `release-${course.id}`,
        },
    ];
}

export function mapCourseDetail(
    course: CourseRecord,
    chapters: CourseChapter[],
    releases: CourseRelease[],
    versions: CourseVersion[],
    includedAssets: ContentAssetItem[]
): CourseDetail {
    return {
        ...mapCourseItem(course),
        chapters,
        releases,
        versions,
        includedAssets,
        entitlement: {
            isPurchased: course.isPurchased,
            isLearnable: course.isLearnable,
            isOffline: course.isOffline,
        },
    };
}
