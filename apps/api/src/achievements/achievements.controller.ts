import { Controller, Get, Headers, Param } from "@nestjs/common";
import { AchievementsService } from "./achievements.service.js";

@Controller()
export class AchievementsController {
    constructor(private readonly achievementsService: AchievementsService) {}

    @Get("achievements")
    listAchievements() {
        return this.achievementsService.listAchievements();
    }

    @Get("achievements/:achievementId")
    getAchievement(@Param("achievementId") achievementId: string) {
        return this.achievementsService.getAchievement(achievementId);
    }

    @Get("levels")
    listLevels() {
        return this.achievementsService.listLevels();
    }

    @Get("me/achievements")
    listUserAchievements(@Headers("authorization") authorization?: string) {
        return this.achievementsService.listUserAchievements(authorization);
    }

    @Get("me/level-progress")
    getLevelProgress(@Headers("authorization") authorization?: string) {
        return this.achievementsService.getLevelProgress(authorization);
    }
}
