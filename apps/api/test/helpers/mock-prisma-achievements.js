function createMockPrismaAchievements(state, clone, now) {
    let tick = 0;
    const nextTimestamp = () => new Date(Date.parse(now().toISOString()) + tick++ * 1000).toISOString();

    const findAchievementById = (id) => state.achievements.find((achievement) => achievement.id === id) ?? null;
    const findLevelById = (id) => state.levels.find((level) => level.id === id) ?? null;

    return {
        achievement: {
            findMany: async ({ where } = {}) =>
                state.achievements
                    .filter((achievement) => achievement.deletedAt === where?.deletedAt)
                    .map((achievement) => clone(achievement)),
            findUnique: async ({ where } = {}) => {
                const achievement = findAchievementById(where?.id) ?? state.achievements.find((item) => item.code === where?.code) ?? null;
                return achievement ? clone(achievement) : null;
            },
        },
        userAchievement: {
            findMany: async ({ where, include, orderBy } = {}) => {
                const userAchievements = state.userAchievements.filter((item) => item.userId === where?.userId);
                if (orderBy?.achievedAt === "desc") {
                    userAchievements.sort((left, right) => right.achievedAt.localeCompare(left.achievedAt));
                }

                return userAchievements.map((item) => ({
                    ...clone(item),
                    achievement: include?.achievement ? findAchievementById(item.achievementId) : undefined,
                }));
            },
        },
        level: {
            findMany: async ({ where, orderBy } = {}) => {
                const levels = state.levels.filter((level) => level.deletedAt === where?.deletedAt);
                if (orderBy?.rank === "asc") {
                    levels.sort((left, right) => left.rank - right.rank);
                }
                return levels.map((level) => clone(level));
            },
            findUnique: async ({ where } = {}) => {
                const level = findLevelById(where?.id) ?? state.levels.find((item) => item.code === where?.code) ?? null;
                return level ? clone(level) : null;
            },
        },
        userLevelProgress: {
            findMany: async ({ where, include } = {}) => {
                const items = state.userLevelProgresses.filter((item) => item.userId === where?.userId);
                return items.map((item) => ({
                    ...clone(item),
                    level: include?.level ? findLevelById(item.levelId) : undefined,
                }));
            },
        },
        seed: {
            achievement(data) {
                state.achievements.push({
                    id: data.id,
                    code: data.code,
                    name: data.name,
                    description: data.description ?? null,
                    deletedAt: data.deletedAt ?? null,
                    createdAt: data.createdAt ?? nextTimestamp(),
                    updatedAt: data.updatedAt ?? nextTimestamp(),
                });
            },
            userAchievement(data) {
                state.userAchievements.push({
                    id: data.id,
                    userId: data.userId,
                    achievementId: data.achievementId,
                    achievedAt: data.achievedAt ?? nextTimestamp(),
                });
            },
            level(data) {
                state.levels.push({
                    id: data.id,
                    code: data.code,
                    name: data.name,
                    rank: data.rank,
                    deletedAt: data.deletedAt ?? null,
                    createdAt: data.createdAt ?? nextTimestamp(),
                    updatedAt: data.updatedAt ?? nextTimestamp(),
                });
            },
            userLevelProgress(data) {
                state.userLevelProgresses.push({
                    id: data.id,
                    userId: data.userId,
                    levelId: data.levelId,
                    progress: data.progress ?? 0,
                    createdAt: data.createdAt ?? nextTimestamp(),
                    updatedAt: data.updatedAt ?? nextTimestamp(),
                });
            },
        },
    };
}

module.exports = {
    createMockPrismaAchievements,
};
