const assert = require("node:assert/strict");
const test = require("node:test");

const { AchievementsService } = require("../dist/src/achievements/achievements.service.js");
const { createMockPrisma } = require("./helpers/mock-prisma.js");

function createService() {
    const prisma = createMockPrisma();
    return { prisma, service: new AchievementsService(prisma) };
}

test("lists achievements and loads a single achievement", async () => {
    const { prisma, service } = createService();
    prisma.seed.achievement({
        id: "achievement-1",
        code: "first-login",
        name: "First Login",
        description: "Log in once",
    });
    prisma.seed.achievement({
        id: "achievement-2",
        code: "course-complete",
        name: "Course Complete",
        description: "Finish a course",
    });

    const achievements = await service.listAchievements();
    const achievement = await service.getAchievement("achievement-1");

    assert.equal(achievements.items.length, 2);
    assert.equal(achievement.code, "first-login");
});

test("lists unlocked achievements for the current user", async () => {
    const { prisma, service } = createService();
    prisma.seed.user({ id: "user-1", email: "learner@example.com", name: "Learner" });
    prisma.seed.session({
        id: "session-1",
        userId: "user-1",
        token: "token-123",
        expiresAt: new Date("2026-08-20T00:00:00.000Z").toISOString(),
    });
    prisma.seed.achievement({
        id: "achievement-1",
        code: "first-login",
        name: "First Login",
        description: "Log in once",
    });
    prisma.seed.userAchievement({
        id: "user-achievement-1",
        userId: "user-1",
        achievementId: "achievement-1",
        achievedAt: new Date("2026-08-13T00:00:00.000Z"),
    });

    const owned = await service.listUserAchievements("Bearer token-123");

    assert.equal(owned.items.length, 1);
    assert.equal(owned.items[0].achievement.code, "first-login");
});

test("lists levels and returns current level progress", async () => {
    const { prisma, service } = createService();
    prisma.seed.user({ id: "user-1", email: "learner@example.com", name: "Learner" });
    prisma.seed.session({
        id: "session-1",
        userId: "user-1",
        token: "token-123",
        expiresAt: new Date("2026-08-20T00:00:00.000Z").toISOString(),
    });
    prisma.seed.level({ id: "level-1", code: "bronze", name: "Bronze", rank: 1 });
    prisma.seed.level({ id: "level-2", code: "silver", name: "Silver", rank: 2 });
    prisma.seed.userLevelProgress({
        id: "user-level-1",
        userId: "user-1",
        levelId: "level-1",
        progress: 75,
    });

    const levels = await service.listLevels();
    const levelProgress = await service.getLevelProgress("Bearer token-123");

    assert.equal(levels.items.length, 2);
    assert.equal(levelProgress.currentLevel?.level.code, "bronze");
    assert.equal(levelProgress.items.length, 1);
    assert.equal(levelProgress.nextLevel?.code, "silver");
});
