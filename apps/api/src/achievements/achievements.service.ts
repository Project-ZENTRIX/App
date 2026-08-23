import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { errorKeys } from "../common/errors/error-keys.js";
import { SUPABASE_CLIENT } from "../common/supabase/supabase.module.js";
import { SupabaseClient } from "../common/supabase/supabase.client.js";

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

function toDate(value: string | null) {
    return value ? new Date(value) : null;
}

function mapAchievement(achievement: AchievementRow) {
    return {
        id: achievement.id,
        code: achievement.code,
        name: achievement.name,
        description: achievement.description,
        deletedAt: toDate(achievement.deleted_at),
        createdAt: new Date(achievement.created_at),
        updatedAt: new Date(achievement.updated_at),
    };
}

function mapLevel(level: LevelRow) {
    return {
        id: level.id,
        code: level.code,
        name: level.name,
        rank: level.rank,
        deletedAt: toDate(level.deleted_at),
        createdAt: new Date(level.created_at),
        updatedAt: new Date(level.updated_at),
    };
}

@Injectable()
export class AchievementsService {
    constructor(@Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient) {}

    private async requireSession(authorization?: string) {
        const session = await this.supabase.getCurrentUser(authorization);
        if (!session) {
            throw new UnauthorizedException(errorKeys.unauthorized);
        }

        return session;
    }

    async listAchievements() {
        const achievements = await this.supabase.selectRows<AchievementRow>(
            "public",
            "achievements",
            {
                deleted_at: null,
            },
            "*",
            {
                column: "created_at",
                ascending: false,
            }
        );

        return {
            items: achievements.map((achievement) => mapAchievement(achievement)),
        };
    }

    async getAchievement(achievementId: string) {
        const achievement = await this.supabase.selectOne<AchievementRow>("public", "achievements", {
            id: achievementId,
        });

        return achievement ? mapAchievement(achievement) : null;
    }

    async listUserAchievements(authorization?: string) {
        const session = await this.requireSession(authorization);
        const userAchievements = await this.supabase.selectRows<UserAchievementRow>(
            "public",
            "user_achievements",
            {
                user_id: session.id,
            },
            "*",
            {
                column: "achieved_at",
                ascending: false,
            }
        );

        const achievements = await Promise.all(
            userAchievements.map((item) =>
                this.supabase.selectOne<AchievementRow>("public", "achievements", {
                    id: item.achievement_id,
                })
            )
        );

        return {
            items: userAchievements.map((item, index) => ({
                id: item.id,
                achievedAt: new Date(item.achieved_at),
                achievement: achievements[index] ? mapAchievement(achievements[index] as AchievementRow) : null,
            })),
        };
    }

    async listLevels() {
        const levels = await this.supabase.selectRows<LevelRow>(
            "public",
            "levels",
            {
                deleted_at: null,
            },
            "*",
            {
                column: "rank",
                ascending: true,
            }
        );

        return {
            items: levels.map((level) => mapLevel(level)),
        };
    }

    async getLevelProgress(authorization?: string) {
        const session = await this.requireSession(authorization);
        const [levels, userLevelProgresses] = await Promise.all([
            this.supabase.selectRows<LevelRow>(
                "public",
                "levels",
                {
                    deleted_at: null,
                },
                "*",
                {
                    column: "rank",
                    ascending: true,
                }
            ),
            this.supabase.selectRows<UserLevelProgressRow>("public", "user_level_progress", {
                user_id: session.id,
            }),
        ]);

        const levelById = new Map(levels.map((level) => [level.id, level]));
        const items = userLevelProgresses
            .map((item) => ({
                id: item.id,
                progress: item.progress,
                level: levelById.get(item.level_id) ? mapLevel(levelById.get(item.level_id) as LevelRow) : null,
                createdAt: new Date(item.created_at),
                updatedAt: new Date(item.updated_at),
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
}
