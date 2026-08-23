import { Module } from "@nestjs/common";
import { SupabaseModule } from "../common/supabase/supabase.module.js";
import { RunsController } from "./runs.controller.js";
import { RunsService } from "./runs.service.js";

@Module({
    imports: [SupabaseModule],
    controllers: [RunsController],
    providers: [RunsService],
})
export class RunsModule {}
