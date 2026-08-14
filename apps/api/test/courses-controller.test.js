const assert = require("node:assert/strict");
const test = require("node:test");

const { CoursesController } = require("../dist/src/courses/courses.controller.js");

test("lists published courses with pagination", () => {
    const controller = new CoursesController();
    const result = controller.listCourses({ status: "published", page: 1, pageSize: 1 });

    assert.equal(result.pagination.total, 2);
    assert.equal(result.pagination.totalPages, 2);
    assert.equal(result.items.length, 1);
    assert.equal(result.items[0].statusLabel, "已发布");
});

test("returns chapter, lesson and asset details for a course", () => {
    const controller = new CoursesController();
    const course = controller.getCourse("course-frontend-foundation");

    assert.ok(course);
    assert.equal(course.chapterCount, 2);
    assert.equal(course.chapters.length, 2);
    assert.equal(course.releases.length, 2);
    assert.equal(course.includedAssets.length > 0, true);
    assert.equal(course.entitlement.isPurchased, true);
});

test("returns null for missing lesson and empty chapter listings", () => {
    const controller = new CoursesController();

    assert.equal(controller.getLesson("missing"), null);
    assert.deepEqual(controller.getChapterLessons("missing-chapter"), { chapterId: "missing-chapter", items: [] });
});

