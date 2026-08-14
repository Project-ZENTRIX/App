import { apiRequest } from "../client";
import { getAuthorizedHeaders } from "../auth";

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

export function listAchievements() {
    return apiRequest<{ items: AchievementItem[] }>("/achievements", {
        method: "GET",
    });
}

export function listUserAchievements() {
    return apiRequest<{ items: UserAchievementItem[] }>("/me/achievements", {
        method: "GET",
        headers: getAuthorizedHeaders(),
    });
}

export function listLevels() {
    return apiRequest<{ items: LevelItem[] }>("/levels", {
        method: "GET",
    });
}

export function getLevelProgress() {
    return apiRequest<{
        currentLevel: { id: string; progress: number; level: LevelItem | null; createdAt: string; updatedAt: string } | null;
        nextLevel: LevelItem | null;
        items: Array<{ id: string; progress: number; level: LevelItem | null; createdAt: string; updatedAt: string }>;
    }>("/me/level-progress", {
        method: "GET",
        headers: getAuthorizedHeaders(),
    });
}
