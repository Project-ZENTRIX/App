import { Module } from "@nestjs/common";
import { SupabaseModule } from "../common/supabase/supabase.module.js";
import { AchievementsController } from "./achievements.controller.js";
import { AchievementsService } from "./achievements.service.js";

@Module({
    imports: [SupabaseModule],
    controllers: [AchievementsController],
    providers: [AchievementsService],
})
export class AchievementsModule {}
