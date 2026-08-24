import type {
    ContentPackDetail,
    ContentPackFileRecord,
    ContentPackIndex,
    ContentPackManifest,
    ContentPackRolePlanItem,
    ContentPackSnapshot,
    ContentPackState,
    ContentPackSummary,
} from "./content-packs.types.js";
import { buildContentPackStorageKey, getContentPackStorageConfig } from "./content-packs.storage.js";

type SnapshotSeed = {
    state: ContentPackState;
    sourceOfTruth: "authoring" | "published";
    manifest: Omit<ContentPackManifest, "packState" | "sourceOfTruth" | "contentPackCode" | "contentPackId">;
    index: Omit<ContentPackIndex, "sourceOfTruth" | "contentPackCode" | "contentPackId">;
    files: Array<Omit<ContentPackFileRecord, "storageKey">>;
};

const rolePlan: ContentPackRolePlanItem[] = [
    {
        role: "student",
        description: "Read published content, follow the learning path, and submit work through the later client.",
        permissions: ["read:manifest", "read:index", "read:course", "read:lesson", "read:quiz"],
    },
    {
        role: "teacher",
        description: "Review authoring snapshots, inspect lesson structure, and annotate content packages.",
        permissions: ["read:authoring", "comment:content", "review:quiz", "manage:release-notes"],
    },
    {
        role: "admin",
        description: "Publish snapshots, manage tenant visibility, and control storage access boundaries.",
        permissions: ["publish:content", "archive:content", "manage:tenant-scope", "manage:storage-paths"],
    },
];

const publishedSeed: SnapshotSeed = {
    state: "published",
    sourceOfTruth: "published",
    manifest: {
        manifestVersion: "1.1",
        title: "AI 基础入门模拟课包",
        subtitle: "用于验证可编辑内容包结构的示例",
        summary: "这是一套发布态课包输出，供客户端稳定读取。",
        language: "zh-CN",
        version: "0.1.0",
        revision: 2,
        stableIds: true,
        tenantScope: { mode: "shared", tenantIds: [] },
        indexRef: "content-index.json",
        contentRoots: {
            courses: "courses",
            lessons: "lessons",
            quizzes: "quizzes",
        },
        delivery: {
            offlineFriendly: true,
            clientMinVersion: "0.9.0",
            supportedRenderers: ["web", "desktop", "local"],
        },
        integrity: {
            checksum: "sha256:demo-published-placeholder",
            fileHashes: {},
        },
        publishing: {
            publishedAt: "2026-08-23T08:00:00Z",
            publishedBy: "content-editor",
            releaseChannel: "stable",
        },
        files: {
            courses: ["courses/course-001.json", "courses/course-002.json"],
            lessons: ["lessons/lesson-001.md", "lessons/lesson-002.md", "lessons/lesson-003.md"],
            quizzes: ["quizzes/quiz-001.json"],
            resources: ["resources/README.md"],
        },
    },
    index: {
        indexVersion: "1.0",
        generatedAt: "2026-08-23T08:00:00Z",
        items: [
            {
                id: "course_001",
                type: "course",
                title: "什么是课包",
                path: "courses/course-001.json",
                chapterId: "ch_01",
                dependsOn: ["lesson_001", "lesson_002"],
            },
            {
                id: "course_002",
                type: "course",
                title: "认识测验模板",
                path: "courses/course-002.json",
                chapterId: "ch_02",
                dependsOn: ["lesson_003", "quiz_001"],
            },
            {
                id: "lesson_001",
                type: "lesson",
                title: "课包内容层概念",
                path: "lessons/lesson-001.md",
            },
            {
                id: "lesson_002",
                type: "lesson",
                title: "Manifest 结构",
                path: "lessons/lesson-002.md",
            },
            {
                id: "lesson_003",
                type: "lesson",
                title: "测验模板概览",
                path: "lessons/lesson-003.md",
            },
            {
                id: "quiz_001",
                type: "quiz",
                title: "测验模板检查",
                path: "quizzes/quiz-001.json",
                dependsOn: ["lesson_003"],
            },
        ],
        relations: [
            {
                from: "chapter:ch_01",
                to: ["course_001"],
            },
            {
                from: "chapter:ch_02",
                to: ["course_002"],
            },
        ],
    },
    files: [
        { id: "manifest", type: "manifest", title: "Manifest", path: "manifest.json" },
        { id: "index", type: "index", title: "Content index", path: "content-index.json" },
        {
            id: "course_001",
            type: "course",
            title: "什么是课包",
            path: "courses/course-001.json",
            dependsOn: ["lesson_001", "lesson_002"],
        },
        {
            id: "course_002",
            type: "course",
            title: "认识测验模板",
            path: "courses/course-002.json",
            dependsOn: ["lesson_003", "quiz_001"],
        },
        { id: "lesson_001", type: "lesson", title: "课包内容层概念", path: "lessons/lesson-001.md" },
        { id: "lesson_002", type: "lesson", title: "Manifest 结构", path: "lessons/lesson-002.md" },
        { id: "lesson_003", type: "lesson", title: "测验模板概览", path: "lessons/lesson-003.md" },
        { id: "quiz_001", type: "quiz", title: "测验模板检查", path: "quizzes/quiz-001.json", dependsOn: ["lesson_003"] },
        { id: "resource_overview", type: "resource", title: "资源说明", path: "resources/README.md" },
    ],
};

const authoringSeed: SnapshotSeed = {
    state: "authoring",
    sourceOfTruth: "authoring",
    manifest: {
        manifestVersion: "1.1",
        title: "AI 基础入门模拟课包",
        subtitle: "用于验证可编辑内容包结构的示例",
        summary: "这是一套可编辑的课包源文件，适合 Client 修改、保存和发布。",
        language: "zh-CN",
        version: "0.1.0",
        revision: 2,
        stableIds: true,
        tenantScope: { mode: "shared", tenantIds: [] },
        audience: ["零基础学习者", "课程设计审阅者", "本地 Client 开发者"],
        learningGoals: ["验证 Client 是否可以直接修改课包源文件", "验证索引文件是否足够稳定", "验证发布态和编辑态是否能分离"],
        databaseRef: {
            packRowId: "db_pack_demo_001",
            courseRowIds: ["db_course_demo_001", "db_course_demo_002"],
            quizRowIds: ["db_quiz_demo_001"],
            updatedAt: "2026-08-23T00:00:00Z",
            source: "content-editor",
        },
        indexRef: "content-index.draft.json",
        contentRoots: {
            courses: "courses",
            lessons: "lessons",
            quizzes: "quizzes",
        },
        delivery: {
            offlineFriendly: true,
            clientMinVersion: "0.9.0",
            supportedRenderers: ["web", "desktop", "local"],
        },
        integrity: {
            checksum: "sha256:demo-draft-placeholder",
            fileHashes: {},
        },
        publishing: {
            targetManifest: "../published/manifest.json",
            targetIndex: "../published/content-index.json",
            releaseChannel: "stable",
        },
        files: {
            courses: ["courses/course-001.json", "courses/course-002.json"],
            lessons: ["lessons/lesson-001.md", "lessons/lesson-002.md", "lessons/lesson-003.md"],
            quizzes: ["quizzes/quiz-001.json"],
            resources: ["resources/README.md"],
        },
    },
    index: {
        indexVersion: "1.0",
        generatedAt: "2026-08-23T00:00:00Z",
        items: [
            {
                id: "course_001",
                type: "course",
                title: "什么是课包",
                draftPath: "courses/course-001.json",
                publishedPath: "../published/courses/course-001.json",
                chapterId: "ch_01",
                dependsOn: ["lesson_001", "lesson_002"],
            },
            {
                id: "course_002",
                type: "course",
                title: "认识测验模板",
                draftPath: "courses/course-002.json",
                publishedPath: "../published/courses/course-002.json",
                chapterId: "ch_02",
                dependsOn: ["lesson_003", "quiz_001"],
            },
            {
                id: "lesson_001",
                type: "lesson",
                title: "课包内容层概念",
                draftPath: "lessons/lesson-001.md",
                publishedPath: "../published/lessons/lesson-001.md",
            },
            {
                id: "lesson_002",
                type: "lesson",
                title: "Manifest 结构",
                draftPath: "lessons/lesson-002.md",
                publishedPath: "../published/lessons/lesson-002.md",
            },
            {
                id: "lesson_003",
                type: "lesson",
                title: "测验模板概览",
                draftPath: "lessons/lesson-003.md",
                publishedPath: "../published/lessons/lesson-003.md",
            },
            {
                id: "quiz_001",
                type: "quiz",
                title: "测验模板检查",
                draftPath: "quizzes/quiz-001.json",
                publishedPath: "../published/quizzes/quiz-001.json",
                dependsOn: ["lesson_003"],
            },
        ],
        relations: [
            {
                from: "chapter:ch_01",
                to: ["course_001"],
            },
            {
                from: "chapter:ch_02",
                to: ["course_002"],
            },
        ],
    },
    files: [
        { id: "manifest", type: "manifest", title: "Draft manifest", path: "manifest.draft.json" },
        { id: "index", type: "index", title: "Draft content index", path: "content-index.draft.json" },
        {
            id: "course_001",
            type: "course",
            title: "什么是课包",
            path: "courses/course-001.json",
            dependsOn: ["lesson_001", "lesson_002"],
        },
        {
            id: "course_002",
            type: "course",
            title: "认识测验模板",
            path: "courses/course-002.json",
            dependsOn: ["lesson_003", "quiz_001"],
        },
        { id: "lesson_001", type: "lesson", title: "课包内容层概念", path: "lessons/lesson-001.md" },
        { id: "lesson_002", type: "lesson", title: "Manifest 结构", path: "lessons/lesson-002.md" },
        { id: "lesson_003", type: "lesson", title: "测验模板概览", path: "lessons/lesson-003.md" },
        { id: "quiz_001", type: "quiz", title: "测验模板检查", path: "quizzes/quiz-001.json", dependsOn: ["lesson_003"] },
        { id: "resource_overview", type: "resource", title: "资源说明", path: "resources/README.md" },
    ],
};

const contentPackCode = "ai-foundation-demo";
const contentPackId = "pack_ai_foundation_demo";
const storage = getContentPackStorageConfig();

function instantiateSnapshot(seed: SnapshotSeed): ContentPackSnapshot {
    const files = seed.files.map((file) => ({
        ...file,
        storageKey: buildContentPackStorageKey(contentPackCode, seed.state, file.path),
    }));

    return {
        state: seed.state,
        sourceOfTruth: seed.sourceOfTruth,
        manifest: {
            ...seed.manifest,
            contentPackCode,
            contentPackId,
            packState: seed.state,
            sourceOfTruth: seed.sourceOfTruth,
        },
        index: {
            ...seed.index,
            contentPackCode,
            contentPackId,
            sourceOfTruth: seed.sourceOfTruth,
        },
        files,
    };
}

const snapshots = [instantiateSnapshot(authoringSeed), instantiateSnapshot(publishedSeed)];

function buildSummary(snapshot: ContentPackSnapshot): ContentPackSummary {
    return {
        contentPackId,
        contentPackCode,
        title: snapshot.manifest.title,
        summary: snapshot.manifest.summary,
        language: snapshot.manifest.language,
        currentState: snapshot.state,
        version: snapshot.manifest.version,
        revision: snapshot.manifest.revision,
        snapshotCount: snapshots.length,
        fileCount:
            snapshot.manifest.files.courses.length +
            snapshot.manifest.files.lessons!.length +
            snapshot.manifest.files.quizzes.length +
            (snapshot.manifest.files.resources?.length ?? 0),
        publishedAt: snapshot.manifest.publishing.publishedAt ?? "2026-08-23T08:00:00Z",
    };
}

export const contentPackDetail: ContentPackDetail = {
    ...buildSummary(snapshots[1]),
    snapshots,
    manifest: snapshots[1].manifest,
    index: snapshots[1].index,
    files: snapshots[1].files,
    rolePlan,
    storage,
};

export const contentPackSummaries: ContentPackSummary[] = [buildSummary(snapshots[1])];

export function findContentPackSnapshot(state: ContentPackState) {
    return snapshots.find((snapshot) => snapshot.state === state) ?? null;
}
