import { Module } from "@nestjs/common";
import { SupabaseModule } from "../common/supabase/supabase.module.js";
import { ProgressController } from "./progress.controller.js";
import { ProgressService } from "./progress.service.js";

@Module({
    imports: [SupabaseModule],
    controllers: [ProgressController],
    providers: [ProgressService],
})
export class ProgressModule {}
