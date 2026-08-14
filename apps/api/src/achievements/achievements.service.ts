import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import { errorKeys } from "../common/errors/error-keys.js";
import { getSessionFromAuthorizationHeader } from "../auth/auth-session.js";

type AchievementPayload = {
    id: string;
    code: string;
    name: string;
    description: string | null;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
};

type LevelPayload = {
    id: string;
    code: string;
    name: string;
    rank: number;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
};

function mapAchievement(achievement: AchievementPayload) {
    return {
        id: achievement.id,
        code: achievement.code,
        name: achievement.name,
        description: achievement.description,
        deletedAt: achievement.deletedAt,
        createdAt: achievement.createdAt,
        updatedAt: achievement.updatedAt,
    };
}

function mapLevel(level: LevelPayload) {
    return {
        id: level.id,
        code: level.code,
        name: level.name,
        rank: level.rank,
        deletedAt: level.deletedAt,
        createdAt: level.createdAt,
        updatedAt: level.updatedAt,
    };
}

@Injectable()
export class AchievementsService {
    constructor(private readonly prisma: PrismaService) {}

    private async requireSession(authorization?: string) {
        const session = await getSessionFromAuthorizationHeader(this.prisma, authorization);
        if (!session) {
            throw new UnauthorizedException(errorKeys.unauthorized);
        }

        return session;
    }

    async listAchievements() {
        const achievements = await this.prisma.achievement.findMany({
            where: {
                deletedAt: null,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return {
            items: achievements.map((achievement) => mapAchievement(achievement)),
        };
    }

    async getAchievement(achievementId: string) {
        const achievement = await this.prisma.achievement.findUnique({
            where: {
                id: achievementId,
            },
        });

        return achievement ? mapAchievement(achievement) : null;
    }

    async listUserAchievements(authorization?: string) {
        const session = await this.requireSession(authorization);
        const userAchievements = await this.prisma.userAchievement.findMany({
            where: {
                userId: session.user.id as string,
            },
            include: {
                achievement: true,
            },
            orderBy: {
                achievedAt: "desc",
            },
        });

        return {
            items: userAchievements.map((item) => ({
                id: item.id,
                achievedAt: item.achievedAt,
                achievement: item.achievement ? mapAchievement(item.achievement) : null,
            })),
        };
    }

    async listLevels() {
        const levels = await this.prisma.level.findMany({
            where: {
                deletedAt: null,
            },
            orderBy: {
                rank: "asc",
            },
        });

        return {
            items: levels.map((level) => mapLevel(level)),
        };
    }

    async getLevelProgress(authorization?: string) {
        const session = await this.requireSession(authorization);
        const [levels, userLevelProgresses] = await Promise.all([
            this.prisma.level.findMany({
                where: {
                    deletedAt: null,
                },
                orderBy: {
                    rank: "asc",
                },
            }),
            this.prisma.userLevelProgress.findMany({
                where: {
                    userId: session.user.id as string,
                },
                include: {
                    level: true,
                },
            }),
        ]);

        const items = userLevelProgresses
            .filter((item) => item.level)
            .map((item) => ({
                id: item.id,
                progress: item.progress,
                level: item.level ? mapLevel(item.level) : null,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
            }))
            .sort((left, right) => (left.level?.rank ?? 0) - (right.level?.rank ?? 0));

        const currentLevel = items.length
            ? items.reduce((highest, item) => ((item.level?.rank ?? 0) > (highest.level?.rank ?? 0) ? item : highest))
            : null;
        const nextLevel =
            currentLevel?.level && levels.find((level) => level.rank > currentLevel.level!.rank)
                ? mapLevel(levels.find((level) => level.rank > currentLevel.level!.rank) as LevelPayload)
                : null;

        return {
            currentLevel,
            nextLevel,
            items,
        };
    }
}
