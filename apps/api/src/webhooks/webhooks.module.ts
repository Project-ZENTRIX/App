import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module.js";
import { WebhooksController } from "./webhooks.controller.js";
import { WebhooksService } from "./webhooks.service.js";

@Module({
    imports: [PrismaModule],
    controllers: [WebhooksController],
    providers: [WebhooksService],
})
export class WebhooksModule {}
