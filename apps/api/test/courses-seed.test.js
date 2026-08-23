const assert = require("node:assert/strict");
const test = require("node:test");

const { seedCourseCatalog } = require("../dist/courses/courses.seed.js");
const { createMockSupabaseCourses } = require("./helpers/mock-supabase-courses.js");

test("seeds the course catalog once when the table is empty", async () => {
    const supabase = createMockSupabaseCourses();
    const result = await seedCourseCatalog(supabase);

    assert.equal(result.seeded, true);
    assert.equal(supabase.state.courses.length > 0, true);
    assert.equal(supabase.state.chapters.length > 0, true);
    assert.equal(supabase.state.lessons.length > 0, true);
    assert.equal(supabase.state.tasks.length > 0, true);
    assert.equal(supabase.state.contentAssets.length > 0, true);

    for (const row of [...supabase.state.chapters, ...supabase.state.lessons, ...supabase.state.tasks, ...supabase.state.contentAssets]) {
        assert.equal(Object.keys(row).some((key) => /[A-Z]/.test(key)), false);
    }
});

test("backfills missing catalog rows when courses already exist", async () => {
    const supabase = createMockSupabaseCourses({
        courses: [{ id: "course-existing" }],
    });

    const result = await seedCourseCatalog(supabase);

    assert.equal(result.seeded, true);
    assert.equal(supabase.state.courses.length > 0, true);
    assert.equal(supabase.state.chapters.length > 0, true);
    assert.equal(supabase.state.lessons.length > 0, true);
    assert.equal(supabase.state.tasks.length > 0, true);
    assert.equal(supabase.state.contentAssets.length > 0, true);
});
