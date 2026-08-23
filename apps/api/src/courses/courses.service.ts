import { Inject, Injectable } from "@nestjs/common";
import { SUPABASE_CLIENT } from "../common/supabase/supabase.module.js";
import { SupabaseClient } from "../common/supabase/supabase.client.js";
import { CourseQueryDto } from "./dto/course-query.dto.js";
import {
    buildCourseReleases,
    buildCourseVersions,
    mapChapterItem,
    mapContentAssetItem,
    mapCourseDetail,
    mapCourseItem,
    mapLessonItem,
    mapTaskItem,
    type ChapterRecord,
    type ContentAssetRecord,
    type CourseDetail,
    type CourseItem,
    type CourseListResponse,
    type CourseRecord,
    type LessonRecord,
    type TaskRecord,
} from "./courses.mappers.js";

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
    status: CourseRecord["status"];
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
    status: ChapterRecord["status"];
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
    status: LessonRecord["status"];
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
    status: TaskRecord["status"];
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

type CourseCatalog = {
    courses: CourseRecord[];
    chapters: ChapterRecord[];
    lessons: LessonRecord[];
    tasks: TaskRecord[];
    contentAssets: ContentAssetRecord[];
};

function toDate(value: string | Date) {
    return value instanceof Date ? value : new Date(value);
}

function toCourseRecord(row: CourseRow): CourseRecord {
    return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        summary: row.summary,
        cover: row.cover,
        category: row.category,
        language: row.language,
        difficulty: row.difficulty,
        tags: row.tags,
        price: row.price,
        currency: row.currency,
        status: row.status,
        version: row.version,
        versionLabel: row.version_label,
        unlockScope: row.unlock_scope,
        isPurchased: row.is_purchased,
        isLearnable: row.is_learnable,
        isOffline: row.is_offline,
        supportedLanguages: row.supported_languages,
        chapterCount: row.chapter_count,
        lessonCount: row.lesson_count,
        taskCount: row.task_count,
        createdAt: toDate(row.created_at),
        updatedAt: toDate(row.updated_at),
    };
}

function toChapterRecord(row: ChapterRow): ChapterRecord {
    return {
        id: row.id,
        courseId: row.course_id,
        title: row.title,
        summary: row.summary,
        sortOrder: row.sort_order,
        status: row.status,
        createdAt: toDate(row.created_at),
        updatedAt: toDate(row.updated_at),
    };
}

function toLessonRecord(row: LessonRow): LessonRecord {
    return {
        id: row.id,
        courseId: row.course_id,
        chapterId: row.chapter_id,
        title: row.title,
        summary: row.summary,
        durationMinutes: row.duration_minutes,
        sortOrder: row.sort_order,
        status: row.status,
        createdAt: toDate(row.created_at),
        updatedAt: toDate(row.updated_at),
    };
}

function toTaskRecord(row: TaskRow): TaskRecord {
    return {
        id: row.id,
        courseId: row.course_id,
        lessonId: row.lesson_id,
        title: row.title,
        description: row.description,
        type: row.type,
        points: row.points,
        sortOrder: row.sort_order,
        status: row.status,
        createdAt: toDate(row.created_at),
        updatedAt: toDate(row.updated_at),
    };
}

function toAssetRecord(row: ContentAssetRow): ContentAssetRecord {
    return {
        id: row.id,
        courseId: row.course_id,
        lessonId: row.lesson_id,
        taskId: row.task_id,
        fileName: row.file_name,
        mimeType: row.mime_type,
        url: row.url,
        metadata: row.metadata,
        createdAt: toDate(row.created_at),
    };
}

@Injectable()
export class CoursesService {
    constructor(@Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient) {}

    private async loadCatalog(): Promise<CourseCatalog> {
        const [courses, chapters, lessons, tasks, contentAssets] = await Promise.all([
            this.supabase.selectRows<CourseRow>("public", "courses", {}, "*", { column: "created_at", ascending: true }),
            this.supabase.selectRows<ChapterRow>("public", "chapters", {}, "*", { column: "sort_order", ascending: true }),
            this.supabase.selectRows<LessonRow>("public", "lessons", {}, "*", { column: "sort_order", ascending: true }),
            this.supabase.selectRows<TaskRow>("public", "tasks", {}, "*", { column: "sort_order", ascending: true }),
            this.supabase.selectRows<ContentAssetRow>("public", "content_assets", {}, "*", {
                column: "created_at",
                ascending: true,
            }),
        ]);

        return {
            courses: courses.map(toCourseRecord),
            chapters: chapters.map(toChapterRecord),
            lessons: lessons.map(toLessonRecord),
            tasks: tasks.map(toTaskRecord),
            contentAssets: contentAssets.map(toAssetRecord),
        };
    }

    private filterCourses(courses: CourseRecord[], query: CourseQueryDto) {
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
                    course.unlockScope,
                    ...course.tags,
                ];
                const matched = fields.some((field) => field.toLowerCase().includes(keyword));
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

    private sortCourses(courses: CourseRecord[], sort?: CourseQueryDto["sort"]) {
        const list = [...courses];

        if (sort === "latest") {
            return list.sort((left, right) => toDate(right.createdAt).getTime() - toDate(left.createdAt).getTime());
        }

        if (sort === "popular") {
            return list.sort((left, right) => {
                const purchased = Number(right.isPurchased) - Number(left.isPurchased);
                if (purchased !== 0) {
                    return purchased;
                }

                const taskDelta = right.taskCount - left.taskCount;
                if (taskDelta !== 0) {
                    return taskDelta;
                }

                return toDate(right.updatedAt).getTime() - toDate(left.updatedAt).getTime();
            });
        }

        return list.sort((left, right) => {
            const purchased = Number(right.isPurchased) - Number(left.isPurchased);
            if (purchased !== 0) {
                return purchased;
            }

            const learnable = Number(right.isLearnable) - Number(left.isLearnable);
            if (learnable !== 0) {
                return learnable;
            }

            return toDate(right.createdAt).getTime() - toDate(left.createdAt).getTime();
        });
    }

    private mapChapterLessons(
        chapterId: string,
        lessons: LessonRecord[],
        tasks: TaskRecord[],
        contentAssets: ContentAssetRecord[]
    ) {
        const chapterLessons = lessons.filter((lesson) => lesson.chapterId === chapterId);
        return chapterLessons.map((lesson) => this.mapLessonWithRelations(lesson, tasks, contentAssets));
    }

    private mapLessonWithRelations(lesson: LessonRecord, tasks: TaskRecord[], contentAssets: ContentAssetRecord[]) {
        const taskIds = tasks.filter((task) => task.lessonId === lesson.id).map((task) => task.id);
        const assetIds = contentAssets
            .filter((asset) => asset.lessonId === lesson.id || taskIds.includes(asset.taskId ?? ""))
            .map((asset) => asset.id);
        return mapLessonItem(lesson, taskIds, Array.from(new Set(assetIds)));
    }

    private mapTaskWithRelations(task: TaskRecord, contentAssets: ContentAssetRecord[]) {
        const assetIds = contentAssets.filter((asset) => asset.taskId === task.id).map((asset) => asset.id);
        return mapTaskItem(task, assetIds);
    }

    private collectIncludedAssets(
        courseId: string,
        lessons: LessonRecord[],
        tasks: TaskRecord[],
        contentAssets: ContentAssetRecord[]
    ) {
        const lessonIds = lessons.filter((lesson) => lesson.courseId === courseId).map((lesson) => lesson.id);
        const taskIds = tasks.filter((task) => task.courseId === courseId).map((task) => task.id);
        const ids = new Set<string>();

        contentAssets.forEach((asset) => {
            if (
                asset.courseId === courseId ||
                lessonIds.includes(asset.lessonId ?? "") ||
                taskIds.includes(asset.taskId ?? "")
            ) {
                ids.add(asset.id);
            }
        });

        return Array.from(ids)
            .map((assetId) => contentAssets.find((asset) => asset.id === assetId))
            .filter((asset): asset is ContentAssetRecord => Boolean(asset))
            .map((asset) => mapContentAssetItem(asset));
    }

    private mapCourseDetail(course: CourseRecord, catalog: CourseCatalog): CourseDetail {
        const chapters = catalog.chapters
            .filter((chapter) => chapter.courseId === course.id)
            .map((chapter) => {
                const lessonIds = catalog.lessons
                    .filter((lesson) => lesson.chapterId === chapter.id)
                    .map((lesson) => lesson.id);
                return mapChapterItem(chapter, lessonIds);
            });

        return mapCourseDetail(
            course,
            chapters,
            buildCourseReleases(course),
            buildCourseVersions(course),
            this.collectIncludedAssets(course.id, catalog.lessons, catalog.tasks, catalog.contentAssets)
        );
    }

    async listCourses(
        query: CourseQueryDto = {}
    ): Promise<{ items: CourseItem[]; pagination: CourseListResponse["pagination"] }> {
        const catalog = await this.loadCatalog();
        const filtered = this.filterCourses(catalog.courses, query);
        const sorted = this.sortCourses(filtered, query.sort);
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 10;
        const start = (page - 1) * pageSize;
        const items = sorted.slice(start, start + pageSize).map((course) => mapCourseItem(course));

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

    async getCourse(courseId: string): Promise<CourseDetail | null> {
        const catalog = await this.loadCatalog();
        const course = catalog.courses.find((item) => item.id === courseId);
        return course ? this.mapCourseDetail(course, catalog) : null;
    }

    async getCourseChapters(courseId: string) {
        const catalog = await this.loadCatalog();
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
                .filter((chapter) => chapter.courseId === courseId)
                .map((chapter) => {
                    const lessonIds = catalog.lessons
                        .filter((lesson) => lesson.chapterId === chapter.id)
                        .map((lesson) => lesson.id);
                    return mapChapterItem(chapter, lessonIds);
                }),
        };
    }

    async getChapterLessons(chapterId: string) {
        const catalog = await this.loadCatalog();
        const chapter = catalog.chapters.find((item) => item.id === chapterId);
        if (!chapter) {
            return { chapterId, items: [] };
        }

        return {
            chapterId,
            items: this.mapChapterLessons(chapterId, catalog.lessons, catalog.tasks, catalog.contentAssets),
        };
    }

    async getLesson(lessonId: string) {
        const catalog = await this.loadCatalog();
        const lesson = catalog.lessons.find((item) => item.id === lessonId);
        if (!lesson) {
            return null;
        }

        return this.mapLessonWithRelations(lesson, catalog.tasks, catalog.contentAssets);
    }

    async getTask(taskId: string) {
        const catalog = await this.loadCatalog();
        const task = catalog.tasks.find((item) => item.id === taskId);
        if (!task) {
            return null;
        }

        return this.mapTaskWithRelations(task, catalog.contentAssets);
    }

    async getContentAsset(assetId: string) {
        const catalog = await this.loadCatalog();
        const asset = catalog.contentAssets.find((item) => item.id === assetId);
        return asset ? mapContentAssetItem(asset) : null;
    }

    async getCourseReleases(courseId: string) {
        const course = await this.getCourse(courseId);
        return {
            courseId,
            items: course ? course.releases : [],
        };
    }

    async getCourseVersions(courseId: string) {
        const course = await this.getCourse(courseId);
        return {
            courseId,
            items: course ? course.versions : [],
        };
    }
}
