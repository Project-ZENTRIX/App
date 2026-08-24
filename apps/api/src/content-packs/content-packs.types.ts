export type ContentPackState = "authoring" | "published";

export type ContentPackRole = "student" | "teacher" | "admin";

export type ContentPackFileType = "manifest" | "index" | "course" | "lesson" | "quiz" | "resource";

export type ContentPackFileRecord = {
    id: string;
    type: ContentPackFileType;
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

export type ContentPackIndexItem = {
    id: string;
    type: "course" | "lesson" | "quiz";
    title: string;
    path?: string;
    chapterId?: string;
    draftPath?: string;
    publishedPath?: string;
    dependsOn?: string[];
};

export type ContentPackIndex = {
    indexVersion: string;
    contentPackId: string;
    contentPackCode: string;
    sourceOfTruth: "authoring" | "published";
    generatedAt: string;
    items: ContentPackIndexItem[];
    relations: Array<{
        from: string;
        to: string[];
    }>;
};

export type ContentPackRolePlanItem = {
    role: ContentPackRole;
    description: string;
    permissions: string[];
};

export type ContentPackSnapshot = {
    state: ContentPackState;
    sourceOfTruth: "authoring" | "published";
    manifest: ContentPackManifest;
    index: ContentPackIndex;
    files: ContentPackFileRecord[];
};

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

export type ContentPackDetail = ContentPackSummary & {
    snapshots: ContentPackSnapshot[];
    manifest: ContentPackManifest;
    index: ContentPackIndex;
    files: ContentPackFileRecord[];
    rolePlan: ContentPackRolePlanItem[];
    storage: {
        bucket: string;
        s3Endpoint: string;
        region: string;
    };
};
