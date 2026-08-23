import { Module } from "@nestjs/common";
import { SupabaseModule } from "../common/supabase/supabase.module.js";
import { CommerceController } from "./commerce.controller.js";
import { CommerceService } from "./commerce.service.js";

@Module({
    imports: [SupabaseModule],
    controllers: [CommerceController],
    providers: [CommerceService],
})
export class CommerceModule {}
