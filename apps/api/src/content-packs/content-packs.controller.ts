import { Controller, Get, Param, Query } from "@nestjs/common";
import { ContentPacksService } from "./content-packs.service.js";
import type { ContentPackState } from "./content-packs.types.js";

@Controller()
export class ContentPacksController {
    constructor(private readonly contentPacksService: ContentPacksService) {}

    @Get("content-packs")
    listContentPacks() {
        return this.contentPacksService.listContentPacks();
    }

    @Get("content-packs/:contentPackCode")
    getContentPack(@Param("contentPackCode") contentPackCode: string) {
        return this.contentPacksService.getContentPack(contentPackCode);
    }

    @Get("content-packs/:contentPackCode/manifest")
    getContentPackManifest(@Param("contentPackCode") contentPackCode: string, @Query("state") state?: ContentPackState) {
        return this.contentPacksService.getContentPackManifest(contentPackCode, state ?? "published");
    }

    @Get("content-packs/:contentPackCode/index")
    getContentPackIndex(@Param("contentPackCode") contentPackCode: string, @Query("state") state?: ContentPackState) {
        return this.contentPacksService.getContentPackIndex(contentPackCode, state ?? "published");
    }

    @Get("content-packs/:contentPackCode/files")
    getContentPackFiles(@Param("contentPackCode") contentPackCode: string, @Query("state") state?: ContentPackState) {
        return this.contentPacksService.getContentPackFiles(contentPackCode, state ?? "published");
    }

    @Get("content-packs/:contentPackCode/roles")
    getRolePlan(@Param("contentPackCode") contentPackCode: string) {
        return this.contentPacksService.getRolePlan(contentPackCode);
    }

    @Get("content-packs/:contentPackCode/storage")
    getStorage(@Param("contentPackCode") contentPackCode: string) {
        return this.contentPacksService.getStorage(contentPackCode);
    }
}
