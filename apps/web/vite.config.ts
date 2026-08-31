import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
    plugins: [
        tanstackRouter({
            target: "react",
            autoCodeSplitting: true,
        }),
        react(),
        tailwindcss(),
    ],
    server: {
        host: "127.20.0.1",
        port: 3000,
    },
    resolve: {
        tsconfigPaths: true,
        alias: {
            "@shared/i18n": path.resolve(import.meta.dirname, "../../packages/i18n/src"),
        },
    },
});
