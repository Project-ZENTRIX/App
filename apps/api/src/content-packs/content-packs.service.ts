import { contentPackDetail, contentPackSummaries } from "./content-packs.data.js";
import type {
    ContentPackDetail,
    ContentPackIndex,
    ContentPackManifest,
    ContentPackSummary,
    ContentPackState,
} from "./content-packs.types.js";

export class ContentPacksService {
    listContentPacks(): ContentPackSummary[] {
        return contentPackSummaries;
    }

    getContentPack(contentPackCode: string): ContentPackDetail | null {
        return contentPackDetail.contentPackCode === contentPackCode ? contentPackDetail : null;
    }

    getContentPackManifest(contentPackCode: string, state: ContentPackState = "published"): ContentPackManifest | null {
        const snapshot = this.getSnapshot(contentPackCode, state);
        return snapshot?.manifest ?? null;
    }

    getContentPackIndex(contentPackCode: string, state: ContentPackState = "published"): ContentPackIndex | null {
        const snapshot = this.getSnapshot(contentPackCode, state);
        return snapshot?.index ?? null;
    }

    getContentPackFiles(contentPackCode: string, state: ContentPackState = "published") {
        const snapshot = this.getSnapshot(contentPackCode, state);
        return snapshot?.files ?? [];
    }

    getRolePlan(contentPackCode: string) {
        return this.getContentPack(contentPackCode)?.rolePlan ?? [];
    }

    getStorage(contentPackCode: string) {
        return this.getContentPack(contentPackCode)?.storage ?? null;
    }

    private getSnapshot(contentPackCode: string, state: ContentPackState) {
        const pack = this.getContentPack(contentPackCode);
        if (!pack) {
            return null;
        }

        return pack.snapshots.find((snapshot) => snapshot.state === state) ?? null;
    }
}
