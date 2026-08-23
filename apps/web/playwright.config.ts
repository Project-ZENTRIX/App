import { defineConfig } from "@playwright/test";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadLocalEnv } from "./lib/env/load-local-env";

const webBaseUrl = "http://127.20.0.1:3000";
const apiBaseUrl = "http://127.20.0.1:4000";
const supabaseUrl = "http://127.20.0.1:54321";

const webProjectDir = dirname(fileURLToPath(import.meta.url));
loadLocalEnv(webProjectDir);

function readRequiredEnv(...names: string[]) {
    for (const name of names) {
        const value = process.env[name];
        if (value) {
            return value;
        }
    }

    throw new Error(`Missing required environment variable: ${names.join(" or ")}`);
}

const supabaseAnonKey = readRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const supabaseServiceRoleKey = readRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");

export default defineConfig({
    testDir: "./tests/e2e",
    fullyParallel: false,
    retries: process.env.CI ? 2 : 0,
    reporter: "line",
    use: {
        baseURL: webBaseUrl,
        trace: "on-first-retry",
    },
    webServer: [
        {
            name: "API",
            command:
                "powershell -NoProfile -Command \"Remove-Item -LiteralPath 'tsconfig.build.tsbuildinfo' -ErrorAction SilentlyContinue; & '.\\node_modules\\.bin\\tsc.cmd' -p tsconfig.build.json; node dist/main.js\"",
            cwd: "D:/projects-code/Org.NEXORA-Studios/Project ZENTRIX/apps/api",
            env: {
                HOST: "127.20.0.1",
                PORT: "4000",
                DATABASE_URL: "postgresql://postgres:postgres@127.0.0.1:5432/zentrix?schema=public",
                BETTER_AUTH_SECRET: "WZ0XTxGGiQpb8nSULz7yeuU6RMZsRAhZhxqAdQxqN54=",
                BETTER_AUTH_URL: `${apiBaseUrl}`,
                FRONTEND_URL: webBaseUrl,
                SUPABASE_URL: supabaseUrl,
                SUPABASE_ANON_KEY: supabaseAnonKey,
                SUPABASE_SERVICE_ROLE_KEY: supabaseServiceRoleKey,
                NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
                NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
            },
            url: `${apiBaseUrl}/docs`,
            reuseExistingServer: !process.env.CI,
            timeout: 120_000,
        },
        {
            name: "Web",
            command: "node_modules\\.bin\\next.CMD dev -H 127.20.0.1",
            cwd: "D:/projects-code/Org.NEXORA-Studios/Project ZENTRIX/apps/web",
            env: {
                NEXT_PUBLIC_API_BASE_URL: `${apiBaseUrl}/api`,
                NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
                NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
            },
            url: webBaseUrl,
            reuseExistingServer: !process.env.CI,
            timeout: 120_000,
        },
    ],
});
