import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

export default defineConfig({
    plugins: [
        tanstackRouter({
            routesDirectory: "./src/routes",
            generatedRouteTree: "./src/routeTree.gen.ts",
            disableLogging: true,
        }),
        react(),
    ],

    test: {
        environment: "jsdom",
        setupFiles: ["./src/test/setup.ts"],
        globals: true,
        typecheck: {
            enabled: true,
        },
    },
});
