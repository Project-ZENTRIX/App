import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
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
    type CourseRelease,
    type CourseVersion,
    type LessonRecord,
    type TaskRecord,
} from "./courses.mappers.js";

type CourseCatalog = {
    courses: CourseRecord[];
    chapters: ChapterRecord[];
    lessons: LessonRecord[];
    tasks: TaskRecord[];
    contentAssets: ContentAssetRecord[];
};

function toDate(value: Date | string) {
    return value instanceof Date ? value : new Date(value);
}

@Injectable()
export class CoursesService {
    constructor(private readonly prisma: PrismaService) {}

    private async loadCatalog(): Promise<CourseCatalog> {
        const [courses, chapters, lessons, tasks, contentAssets] = await Promise.all([
            this.prisma.course.findMany({ orderBy: { createdAt: "asc" } }),
            this.prisma.chapter.findMany({ orderBy: { sortOrder: "asc" } }),
            this.prisma.lesson.findMany({ orderBy: { sortOrder: "asc" } }),
            this.prisma.task.findMany({ orderBy: { sortOrder: "asc" } }),
            this.prisma.contentAsset.findMany({ orderBy: { createdAt: "asc" } }),
        ]);

        return {
            courses,
            chapters,
            lessons,
            tasks,
            contentAssets,
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

    private mapChapterLessons(chapterId: string, lessons: LessonRecord[], tasks: TaskRecord[], contentAssets: ContentAssetRecord[]) {
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
            if (asset.courseId === courseId || lessonIds.includes(asset.lessonId ?? "") || taskIds.includes(asset.taskId ?? "")) {
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
                const lessonIds = catalog.lessons.filter((lesson) => lesson.chapterId === chapter.id).map((lesson) => lesson.id);
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

    async listCourses(query: CourseQueryDto = {}): Promise<{ items: CourseItem[]; pagination: CourseListResponse["pagination"] }> {
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
                    const lessonIds = catalog.lessons.filter((lesson) => lesson.chapterId === chapter.id).map((lesson) => lesson.id);
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
