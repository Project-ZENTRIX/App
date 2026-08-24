import { apiRequest } from "@/lib/api/client";

export type ContentPackState = "authoring" | "published";

export type ContentPackSummary = {
    contentPackId: string;
    contentPackCode: string;
    title: string;
    summary: string;
    language: string;
    currentState: ContentPackState;
    version: string;
    revision: number;
    snapshotCount: number;
    fileCount: number;
    publishedAt: string;
};

export type ContentPackFile = {
    id: string;
    type: "manifest" | "index" | "course" | "lesson" | "quiz" | "resource";
    title: string;
    path: string;
    storageKey: string;
    dependsOn?: string[];
};

export type ContentPackManifest = {
    manifestVersion: string;
    contentPackId: string;
    contentPackCode: string;
    title: string;
    subtitle?: string;
    summary: string;
    language: string;
    packState: ContentPackState;
    version: string;
    revision: number;
    sourceOfTruth: "authoring" | "published";
    stableIds: boolean;
    tenantScope: {
        mode: "shared" | "tenant";
        tenantIds: string[];
    };
    audience?: string[];
    learningGoals?: string[];
    databaseRef?: {
        packRowId: string;
        courseRowIds: string[];
        quizRowIds: string[];
        updatedAt: string;
        source: string;
    };
    indexRef: string;
    contentRoots: {
        courses: string;
        lessons: string;
        quizzes: string;
    };
    delivery: {
        offlineFriendly: boolean;
        clientMinVersion: string;
        supportedRenderers: string[];
    };
    integrity: {
        checksum: string;
        fileHashes: Record<string, string>;
    };
    publishing: {
        publishedAt?: string;
        publishedBy?: string;
        releaseChannel: string;
        targetManifest?: string;
        targetIndex?: string;
    };
    files: {
        courses: string[];
        lessons?: string[];
        quizzes: string[];
        resources?: string[];
    };
};

export type ContentPackIndex = {
    indexVersion: string;
    contentPackId: string;
    contentPackCode: string;
    sourceOfTruth: "authoring" | "published";
    generatedAt: string;
    items: Array<{
        id: string;
        type: "course" | "lesson" | "quiz";
        title: string;
        path: string;
        chapterId?: string;
        draftPath?: string;
        publishedPath?: string;
        dependsOn?: string[];
    }>;
    relations: Array<{
        from: string;
        to: string[];
    }>;
};

export type ContentPackRolePlanItem = {
    role: "student" | "teacher" | "admin";
    description: string;
    permissions: string[];
};

export type ContentPackDetail = ContentPackSummary & {
    snapshots: Array<{
        state: ContentPackState;
        sourceOfTruth: "authoring" | "published";
        manifest: ContentPackManifest;
        index: ContentPackIndex;
        files: ContentPackFile[];
    }>;
    manifest: ContentPackManifest;
    index: ContentPackIndex;
    files: ContentPackFile[];
    rolePlan: ContentPackRolePlanItem[];
    storage: {
        bucket: string;
        s3Endpoint: string;
        region: string;
    };
};

export async function listContentPacks() {
    return apiRequest<ContentPackSummary[]>("/content-packs");
}

export async function getContentPack(contentPackCode: string) {
    return apiRequest<ContentPackDetail | null>(`/content-packs/${contentPackCode}`);
}

export async function getContentPackManifest(contentPackCode: string, state?: ContentPackState) {
    const query = state ? `?state=${encodeURIComponent(state)}` : "";
    return apiRequest<ContentPackManifest | null>(`/content-packs/${contentPackCode}/manifest${query}`);
}

export async function getContentPackIndex(contentPackCode: string, state?: ContentPackState) {
    const query = state ? `?state=${encodeURIComponent(state)}` : "";
    return apiRequest<ContentPackIndex | null>(`/content-packs/${contentPackCode}/index${query}`);
}

export async function getContentPackFiles(contentPackCode: string, state?: ContentPackState) {
    const query = state ? `?state=${encodeURIComponent(state)}` : "";
    return apiRequest<ContentPackFile[]>(`/content-packs/${contentPackCode}/files${query}`);
}

export async function getContentPackRoles(contentPackCode: string) {
    return apiRequest<ContentPackRolePlanItem[]>(`/content-packs/${contentPackCode}/roles`);
}

export async function getContentPackStorage(contentPackCode: string) {
    return apiRequest<ContentPackDetail["storage"] | null>(`/content-packs/${contentPackCode}/storage`);
}
