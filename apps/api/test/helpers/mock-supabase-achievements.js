function createMockSupabaseAchievements(seed = {}) {
    const clone = (value) => JSON.parse(JSON.stringify(value));
    const now = () => new Date("2026-08-20T00:00:00.000Z").toISOString();

    const state = {
        users: clone(seed.users ?? []),
        achievements: clone(seed.achievements ?? []),
        levels: clone(seed.levels ?? []),
        userAchievements: clone(seed.userAchievements ?? []),
        userLevelProgress: clone(seed.userLevelProgress ?? []),
    };

    return {
        state,
        seed: {
            user(data) {
                state.users.push({ id: data.id, email: data.email, created_at: now(), updated_at: now(), user_metadata: { name: data.name ?? data.email } });
            },
            achievement(data) {
                state.achievements.push({
                    id: data.id,
                    code: data.code,
                    name: data.name,
                    description: data.description ?? null,
                    deleted_at: data.deletedAt ?? null,
                    created_at: data.createdAt ?? now(),
                    updated_at: data.updatedAt ?? now(),
                });
            },
            level(data) {
                state.levels.push({
                    id: data.id,
                    code: data.code,
                    name: data.name,
                    rank: data.rank,
                    deleted_at: data.deletedAt ?? null,
                    created_at: data.createdAt ?? now(),
                    updated_at: data.updatedAt ?? now(),
                });
            },
            userAchievement(data) {
                state.userAchievements.push({
                    id: data.id,
                    user_id: data.userId,
                    achievement_id: data.achievementId,
                    achieved_at: data.achievedAt ?? now(),
                });
            },
            userLevelProgress(data) {
                state.userLevelProgress.push({
                    id: data.id,
                    user_id: data.userId,
                    level_id: data.levelId,
                    progress: data.progress ?? 0,
                    created_at: data.createdAt ?? now(),
                    updated_at: data.updatedAt ?? now(),
                });
            },
        },
        async getCurrentUser(authorization) {
            if (!authorization) {
                return null;
            }

            const token = authorization.split(" ")[1] ?? authorization;
            const userId = token.replace("token-", "");
            const user = state.users.find((item) => item.id === userId);
            return user ? { ...clone(user), access_token: token } : null;
        },
        async selectRows(schema, table, filters = {}, select = "*", orderBy) {
            if (schema !== "public") {
                return [];
            }

            let rows = [];
            if (table === "achievements") {
                rows = state.achievements.filter((item) => item.deleted_at === filters.deleted_at);
            }

            if (table === "levels") {
                rows = state.levels.filter((item) => item.deleted_at === filters.deleted_at);
            }

            if (table === "user_achievements") {
                rows = state.userAchievements.filter((item) => item.user_id === filters.user_id);
            }

            if (table === "user_level_progress") {
                rows = state.userLevelProgress.filter((item) => item.user_id === filters.user_id);
            }

            if (orderBy?.column === "created_at") {
                rows = [...rows].sort((left, right) => {
                    const leftValue = String(left.created_at ?? "");
                    const rightValue = String(right.created_at ?? "");
                    return orderBy.ascending === false ? rightValue.localeCompare(leftValue) : leftValue.localeCompare(rightValue);
                });
            }

            if (orderBy?.column === "achieved_at") {
                rows = [...rows].sort((left, right) => {
                    const leftValue = String(left.achieved_at ?? "");
                    const rightValue = String(right.achieved_at ?? "");
                    return orderBy.ascending === false ? rightValue.localeCompare(leftValue) : leftValue.localeCompare(rightValue);
                });
            }

            if (orderBy?.column === "rank") {
                rows = [...rows].sort((left, right) => {
                    return orderBy.ascending === false ? right.rank - left.rank : left.rank - right.rank;
                });
            }

            return clone(rows);
        },
        async selectOne(schema, table, filters = {}) {
            if (schema !== "public") {
                return null;
            }

            if (table === "achievements") {
                const row = state.achievements.find((item) => item.id === filters.id);
                return row ? clone(row) : null;
            }

            if (table === "levels") {
                const row = state.levels.find((item) => item.id === filters.id);
                return row ? clone(row) : null;
            }

            return null;
        },
    };
}

module.exports = {
    createMockSupabaseAchievements,
};
