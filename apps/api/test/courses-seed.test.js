const assert = require("node:assert/strict");
const test = require("node:test");

const { seedCourseCatalog } = require("../dist/src/courses/courses.seed.js");

function createMockPrisma() {
    const state = {
        courses: [],
        chapters: [],
        lessons: [],
        tasks: [],
        contentAssets: [],
    };

    const clone = (value) => JSON.parse(JSON.stringify(value));
    const createMany = (key) => async ({ data }) => {
        state[key].push(...data.map((item) => clone(item)));
    };

    return {
        state,
        course: {
            count: async () => state.courses.length,
            createMany: createMany("courses"),
        },
        chapter: {
            createMany: createMany("chapters"),
        },
        lesson: {
            createMany: createMany("lessons"),
        },
        task: {
            createMany: createMany("tasks"),
        },
        contentAsset: {
            createMany: createMany("contentAssets"),
        },
        $transaction: async (callback) =>
            callback({
                course: {
                    createMany: createMany("courses"),
                },
                chapter: {
                    createMany: createMany("chapters"),
                },
                lesson: {
                    createMany: createMany("lessons"),
                },
                task: {
                    createMany: createMany("tasks"),
                },
                contentAsset: {
                    createMany: createMany("contentAssets"),
                },
            }),
    };
}

test("seeds the course catalog once when the table is empty", async () => {
    const prisma = createMockPrisma();
    const result = await seedCourseCatalog(prisma);

    assert.equal(result.seeded, true);
    assert.equal(prisma.state.courses.length > 0, true);
    assert.equal(prisma.state.chapters.length > 0, true);
    assert.equal(prisma.state.lessons.length > 0, true);
    assert.equal(prisma.state.tasks.length > 0, true);
    assert.equal(prisma.state.contentAssets.length > 0, true);
});

test("skips seeding when courses already exist", async () => {
    const prisma = createMockPrisma();
    prisma.state.courses.push({ id: "course-existing" });

    const result = await seedCourseCatalog(prisma);

    assert.equal(result.seeded, false);
    assert.equal(prisma.state.courses.length, 1);
});
