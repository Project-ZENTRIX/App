import { Module } from "@nestjs/common";
import { ContentPacksController } from "./content-packs.controller.js";
import { ContentPacksService } from "./content-packs.service.js";

@Module({
    controllers: [ContentPacksController],
    providers: [ContentPacksService],
})
export class ContentPacksModule {}
