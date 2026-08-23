import { getCurrentUser, selectRows } from "./browser-client";

type AchievementRow = {
    id: string;
    code: string;
    name: string;
    description: string | null;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
};

type LevelRow = {
    id: string;
    code: string;
    name: string;
    rank: number;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
};

type UserAchievementRow = {
    id: string;
    user_id: string;
    achievement_id: string;
    achieved_at: string;
};

type UserLevelProgressRow = {
    id: string;
    user_id: string;
    level_id: string;
    progress: number;
    created_at: string;
    updated_at: string;
};

type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

export type AchievementItem = {
    id: string;
    code: string;
    name: string;
    description: string | null;
};

export type UserAchievementItem = {
    id: string;
    achievedAt: string;
    achievement: AchievementItem | null;
};

export type LevelItem = {
    id: string;
    code: string;
    name: string;
    rank: number;
};

function mapAchievement(achievement: AchievementRow): AchievementItem {
    return {
        id: achievement.id,
        code: achievement.code,
        name: achievement.name,
        description: achievement.description,
    };
}

function mapLevel(level: LevelRow): LevelItem {
    return {
        id: level.id,
        code: level.code,
        name: level.name,
        rank: level.rank,
    };
}

async function requireSession(token?: string | null): Promise<CurrentUser> {
    const session = await getCurrentUser(token);
    if (!session) {
        throw new Error("Unauthorized");
    }

    return session;
}

export async function listAchievements() {
    const achievements = await selectRows<AchievementRow>("public", "achievements", { deleted_at: null }, "*", {
        column: "created_at",
        ascending: false,
    });

    return {
        items: achievements.map(mapAchievement),
    };
}

export async function listUserAchievements(token?: string | null) {
    const session = await requireSession(token);
    const userAchievements = await selectRows<UserAchievementRow>("public", "user_achievements", { user_id: session.id }, "*", {
        column: "achieved_at",
        ascending: false,
    });

    const achievements = await Promise.all(
        userAchievements.map((item) => selectRows<AchievementRow>("public", "achievements", { id: item.achievement_id }))
    );

    return {
        items: userAchievements.map((item, index) => {
            const achievement = achievements[index]?.[0] ?? null;
            return {
                id: item.id,
                achievedAt: item.achieved_at,
                achievement: achievement ? mapAchievement(achievement) : null,
            };
        }),
    };
}

export async function listLevels() {
    const levels = await selectRows<LevelRow>("public", "levels", { deleted_at: null }, "*", {
        column: "rank",
        ascending: true,
    });

    return {
        items: levels.map(mapLevel),
    };
}

export async function getLevelProgress(token?: string | null) {
    const session = await requireSession(token);
    const [levels, userLevelProgresses] = await Promise.all([
        selectRows<LevelRow>("public", "levels", { deleted_at: null }, "*", {
            column: "rank",
            ascending: true,
        }),
        selectRows<UserLevelProgressRow>("public", "user_level_progress", { user_id: session.id }),
    ]);

    const levelById = new Map(levels.map((level) => [level.id, level]));
    const items = userLevelProgresses
        .map((item) => ({
            id: item.id,
            progress: item.progress,
            level: levelById.get(item.level_id) ? mapLevel(levelById.get(item.level_id) as LevelRow) : null,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
        }))
        .filter((item) => item.level);

    const currentLevel = items.length
        ? items.reduce((highest, item) => ((item.level?.rank ?? 0) > (highest.level?.rank ?? 0) ? item : highest))
        : null;
    const nextLevel = currentLevel?.level ? (levels.find((level) => level.rank > currentLevel.level!.rank) ?? null) : null;

    return {
        currentLevel,
        nextLevel: nextLevel ? mapLevel(nextLevel) : null,
        items,
    };
}
