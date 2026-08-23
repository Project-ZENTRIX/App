const assert = require("node:assert/strict");
const test = require("node:test");

const { CoursesService } = require("../dist/courses/courses.service.js");
const {
    chapterSeedData,
    contentAssetSeedData,
    courseSeedData,
    lessonSeedData,
    taskSeedData,
} = require("../dist/courses/courses.seed-data.js");
const { createMockSupabaseCourses } = require("./helpers/mock-supabase-courses.js");

function createService() {
    const supabase = createMockSupabaseCourses({
        courses: courseSeedData,
        chapters: chapterSeedData,
        lessons: lessonSeedData,
        tasks: taskSeedData,
        contentAssets: contentAssetSeedData,
    });

    return new CoursesService(supabase);
}

test("lists and filters courses from Supabase records", async () => {
    const service = createService();
    const result = await service.listCourses({ keyword: "API", pageSize: 2 });

    assert.equal(result.pagination.total, 1);
    assert.equal(result.items.length, 1);
    assert.equal(result.items[0].id, "course-api-design");
    assert.equal(result.items[0].statusLabel, "已发布");
    assert.equal(result.items[0].purchaseState, "available");
    assert.equal(result.items[0].version, "v2.1.0");
});

test("loads course detail and nested content from Supabase records", async () => {
    const service = createService();
    const course = await service.getCourse("course-api-design");

    assert.ok(course);
    assert.equal(course.id, "course-api-design");
    assert.equal(course.chapterCount, 3);
    assert.equal(course.chapters.length, 3);
    assert.equal(course.releases.length, 1);
    assert.equal(course.versions.length, 1);
    assert.equal(course.includedAssets.length, 2);
    assert.equal(course.entitlement.isPurchased, false);

    const chapters = await service.getCourseChapters("course-api-design");
    assert.equal(chapters.items.length, 3);

    const chapterLessons = await service.getChapterLessons("chapter-api-1");
    assert.equal(chapterLessons.items.length > 0, true);
    assert.equal(chapterLessons.items[0].taskIds.length > 0, true);

    const lesson = await service.getLesson("lesson-api-1");
    assert.ok(lesson);
    assert.equal(lesson.assetIds.includes("asset-api-1"), true);

    const task = await service.getTask("task-api-1");
    assert.ok(task);
    assert.equal(task.assetIds.includes("asset-api-1"), true);

    const asset = await service.getContentAsset("asset-api-1");
    assert.ok(asset);
    assert.equal(asset.title, "资源分层说明");
    assert.equal(asset.type, "document");
});

test("returns empty payloads for missing course content", async () => {
    const service = createService();

    assert.equal(await service.getCourse("missing"), null);
    assert.deepEqual(await service.getCourseChapters("missing"), { courseId: "missing", items: [] });
    assert.deepEqual(await service.getChapterLessons("missing"), { chapterId: "missing", items: [] });
    assert.equal(await service.getLesson("missing"), null);
    assert.equal(await service.getTask("missing"), null);
    assert.equal(await service.getContentAsset("missing"), null);
});
