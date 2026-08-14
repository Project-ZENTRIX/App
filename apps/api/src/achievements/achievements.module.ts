import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module.js";
import { AchievementsController } from "./achievements.controller.js";
import { AchievementsService } from "./achievements.service.js";

@Module({
    imports: [PrismaModule],
    controllers: [AchievementsController],
    providers: [AchievementsService],
})
export class AchievementsModule {}
