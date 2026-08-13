import { defineConfig } from "@playwright/test";

const webBaseUrl = "http://127.20.0.1:3000";
const apiBaseUrl = "http://127.20.0.1:4000";

export default defineConfig({
    testDir: "./tests/e2e",
    fullyParallel: false,
    retries: process.env.CI ? 2 : 0,
    reporter: "line",
    use: {
        baseURL: webBaseUrl,
        channel: "chrome",
        trace: "on-first-retry",
    },
    webServer: [
        {
            name: "API",
            command: "node_modules\\.bin\\nest.CMD start --watch",
            cwd: "D:/projects-code/Org.NEXORA-Studios/Project ZENTRIX/apps/api",
            env: {
                HOST: "127.20.0.1",
                PORT: "4000",
                DATABASE_URL: "postgresql://postgres:postgres@127.20.0.1:5432/zentrix?schema=public",
                BETTER_AUTH_SECRET: "WZ0XTxGGiQpb8nSULz7yeuU6RMZsRAhZhxqAdQxqN54=",
                BETTER_AUTH_URL: `${apiBaseUrl}`,
                FRONTEND_URL: webBaseUrl,
            },
            url: `${apiBaseUrl}/api/courses`,
            reuseExistingServer: !process.env.CI,
            timeout: 120_000,
        },
        {
            name: "Web",
            command: "node_modules\\.bin\\next.CMD dev -H 127.20.0.1",
            cwd: "D:/projects-code/Org.NEXORA-Studios/Project ZENTRIX/apps/web",
            env: {
                NEXT_PUBLIC_API_BASE_URL: `${apiBaseUrl}/api`,
            },
            url: webBaseUrl,
            reuseExistingServer: !process.env.CI,
            timeout: 120_000,
        },
    ],
});
