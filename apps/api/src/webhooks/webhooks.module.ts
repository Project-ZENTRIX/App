import { Module } from "@nestjs/common";
import { SupabaseModule } from "../common/supabase/supabase.module.js";
import { WebhooksController } from "./webhooks.controller.js";
import { WebhooksService } from "./webhooks.service.js";

@Module({
    imports: [SupabaseModule],
    controllers: [WebhooksController],
    providers: [WebhooksService],
})
export class WebhooksModule {}
