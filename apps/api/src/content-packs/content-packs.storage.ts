const CONTENT_PACK_BUCKET = "content-packs";

function readEnv(name: string, fallback?: string) {
    return process.env[name] ?? fallback ?? "";
}

export function getContentPackStorageConfig() {
    const baseUrl = readEnv("SUPABASE_URL", "http://127.0.0.1:54321").replace(/\/$/, "");

    return {
        bucket: CONTENT_PACK_BUCKET,
        s3Endpoint: `${baseUrl}/storage/v1/s3`,
        region: "local",
    };
}

export function buildContentPackStorageKey(contentPackCode: string, state: "authoring" | "published", filePath: string) {
    return `${CONTENT_PACK_BUCKET}/${contentPackCode}/${state}/${filePath}`;
}
