import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { SUPABASE_CLIENT } from "../common/supabase/supabase.module.js";
import { SupabaseClient } from "../common/supabase/supabase.client.js";
import { chapterSeedData, contentAssetSeedData, courseSeedData, lessonSeedData, taskSeedData } from "./courses.seed-data.js";

function toCourseRow(row: (typeof courseSeedData)[number]) {
    return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        summary: row.summary,
        cover: row.cover,
        category: row.category,
        language: row.language,
        difficulty: row.difficulty,
        tags: [...row.tags],
        price: row.price,
        currency: row.currency,
        status: row.status,
        version: row.version,
        version_label: row.versionLabel,
        unlock_scope: row.unlockScope,
        is_purchased: row.isPurchased,
        is_learnable: row.isLearnable,
        is_offline: row.isOffline,
        supported_languages: [...row.supportedLanguages],
        chapter_count: row.chapterCount,
        lesson_count: row.lessonCount,
        task_count: row.taskCount,
        created_at: row.createdAt,
        updated_at: row.updatedAt,
    };
}

function toChapterRow(row: (typeof chapterSeedData)[number]) {
    return {
        id: row.id,
        course_id: row.courseId,
        title: row.title,
        summary: row.summary,
        sort_order: row.sortOrder,
        status: row.status,
        created_at: row.createdAt,
        updated_at: row.updatedAt,
    };
}

function toLessonRow(row: (typeof lessonSeedData)[number]) {
    return {
        id: row.id,
        course_id: row.courseId,
        chapter_id: row.chapterId,
        title: row.title,
        summary: row.summary,
        duration_minutes: row.durationMinutes,
        sort_order: row.sortOrder,
        status: row.status,
        created_at: row.createdAt,
        updated_at: row.updatedAt,
    };
}

function toTaskRow(row: (typeof taskSeedData)[number]) {
    return {
        id: row.id,
        course_id: row.courseId,
        lesson_id: row.lessonId,
        title: row.title,
        description: row.description,
        type: row.type,
        points: row.points,
        sort_order: row.sortOrder,
        status: row.status,
        created_at: row.createdAt,
        updated_at: row.updatedAt,
    };
}

function toContentAssetRow(row: (typeof contentAssetSeedData)[number]) {
    return {
        id: row.id,
        course_id: row.courseId,
        lesson_id: row.lessonId,
        task_id: row.taskId,
        file_name: row.fileName,
        mime_type: row.mimeType,
        url: row.url,
        metadata: row.metadata,
        created_at: row.createdAt,
    };
}

export async function seedCourseCatalog(supabase: SupabaseClient) {
    await Promise.all(courseSeedData.map((row) => supabase.upsertRow("public", "courses", toCourseRow(row), "id")));
    await Promise.all(chapterSeedData.map((row) => supabase.upsertRow("public", "chapters", toChapterRow(row), "id")));
    await Promise.all(lessonSeedData.map((row) => supabase.upsertRow("public", "lessons", toLessonRow(row), "id")));
    await Promise.all(taskSeedData.map((row) => supabase.upsertRow("public", "tasks", toTaskRow(row), "id")));
    await Promise.all(
        contentAssetSeedData.map((row) => supabase.upsertRow("public", "content_assets", toContentAssetRow(row), "id"))
    );

    return { seeded: true as const };
}

@Injectable()
export class CoursesSeedService implements OnModuleInit {
    constructor(@Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient) {}

    async onModuleInit() {
        await seedCourseCatalog(this.supabase);
    }
}
