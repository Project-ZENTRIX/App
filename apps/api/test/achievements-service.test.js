const assert = require("node:assert/strict");
const test = require("node:test");

const { AchievementsService } = require("../dist/achievements/achievements.service.js");
const { createMockSupabaseAchievements } = require("./helpers/mock-supabase-achievements.js");

function createService() {
    const supabase = createMockSupabaseAchievements();
    return { supabase, service: new AchievementsService(supabase) };
}

test("lists achievements and loads a single achievement", async () => {
    const { supabase, service } = createService();
    supabase.seed.achievement({
        id: "achievement-1",
        code: "first-login",
        name: "First Login",
        description: "Log in once",
    });
    supabase.seed.achievement({
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
    const { supabase, service } = createService();
    supabase.seed.user({ id: "user-1", email: "learner@example.com", name: "Learner" });
    supabase.seed.achievement({
        id: "achievement-1",
        code: "first-login",
        name: "First Login",
        description: "Log in once",
    });
    supabase.seed.userAchievement({
        id: "user-achievement-1",
        userId: "user-1",
        achievementId: "achievement-1",
        achievedAt: new Date("2026-08-13T00:00:00.000Z"),
    });

    const owned = await service.listUserAchievements("Bearer token-user-1");

    assert.equal(owned.items.length, 1);
    assert.equal(owned.items[0].achievement.code, "first-login");
});

test("lists levels and returns current level progress", async () => {
    const { supabase, service } = createService();
    supabase.seed.user({ id: "user-1", email: "learner@example.com", name: "Learner" });
    supabase.seed.level({ id: "level-1", code: "bronze", name: "Bronze", rank: 1 });
    supabase.seed.level({ id: "level-2", code: "silver", name: "Silver", rank: 2 });
    supabase.seed.userLevelProgress({
        id: "user-level-1",
        userId: "user-1",
        levelId: "level-1",
        progress: 75,
    });

    const levels = await service.listLevels();
    const levelProgress = await service.getLevelProgress("Bearer token-user-1");

    assert.equal(levels.items.length, 2);
    assert.equal(levelProgress.currentLevel?.level.code, "bronze");
    assert.equal(levelProgress.items.length, 1);
    assert.equal(levelProgress.nextLevel?.code, "silver");
});
