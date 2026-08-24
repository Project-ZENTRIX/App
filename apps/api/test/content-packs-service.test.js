const assert = require("node:assert/strict");
const test = require("node:test");

const { ContentPacksService } = require("../dist/content-packs/content-packs.service.js");
const {
    buildContentPackStorageKey,
    getContentPackStorageConfig,
} = require("../dist/content-packs/content-packs.storage.js");

function createService() {
    return new ContentPacksService();
}

test("lists the published content pack summary", () => {
    const service = createService();
    const items = service.listContentPacks();

    assert.equal(items.length, 1);
    assert.equal(items[0].contentPackCode, "ai-foundation-demo");
    assert.equal(items[0].currentState, "published");
    assert.equal(items[0].fileCount, 7);
    assert.equal(items[0].snapshotCount, 2);
});

test("loads content pack detail with both authoring and published snapshots", () => {
    const service = createService();
    const pack = service.getContentPack("ai-foundation-demo");

    assert.ok(pack);
    assert.equal(pack.contentPackId, "pack_ai_foundation_demo");
    assert.equal(pack.snapshots.length, 2);
    assert.equal(pack.snapshots[0].state, "authoring");
    assert.equal(pack.snapshots[1].state, "published");
    assert.equal(pack.manifest.contentPackCode, "ai-foundation-demo");
    assert.equal(pack.files.some((file) => file.path === "quizzes/quiz-001.json"), true);
    assert.deepEqual(pack.rolePlan.map((item) => item.role), ["student", "teacher", "admin"]);
    assert.equal(pack.storage.bucket, "content-packs");
    assert.equal(pack.storage.s3Endpoint.endsWith("/storage/v1/s3"), true);
});

test("returns snapshot data for manifest and index endpoints", () => {
    const service = createService();

    const draftManifest = service.getContentPackManifest("ai-foundation-demo", "authoring");
    const publishedManifest = service.getContentPackManifest("ai-foundation-demo");
    const publishedIndex = service.getContentPackIndex("ai-foundation-demo");
    const authoringFiles = service.getContentPackFiles("ai-foundation-demo", "authoring");

    assert.ok(draftManifest);
    assert.equal(draftManifest.sourceOfTruth, "authoring");
    assert.equal(publishedManifest?.packState, "published");
    assert.equal(publishedIndex?.items.length, 6);
    assert.equal(authoringFiles[0].storageKey, "content-packs/ai-foundation-demo/authoring/manifest.json");
});

test("returns null for missing content packs", () => {
    const service = createService();

    assert.equal(service.getContentPack("missing"), null);
    assert.equal(service.getContentPackManifest("missing"), null);
    assert.equal(service.getContentPackIndex("missing"), null);
    assert.deepEqual(service.getContentPackFiles("missing"), []);
});

test("builds stable storage keys without exposing secrets", () => {
    const storage = getContentPackStorageConfig();

    assert.equal(storage.bucket, "content-packs");
    assert.equal(storage.s3Endpoint.endsWith("/storage/v1/s3"), true);
    assert.equal(buildContentPackStorageKey("ai-foundation-demo", "published", "manifest.json"), "content-packs/ai-foundation-demo/published/manifest.json");
});
