import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function parseEnvFile(content: string) {
    const entries: Array<[string, string]> = [];

    for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith("#")) {
            continue;
        }

        const equalsIndex = line.indexOf("=");
        if (equalsIndex === -1) {
            continue;
        }

        const key = line.slice(0, equalsIndex).trim();
        if (!key) {
            continue;
        }

        let value = line.slice(equalsIndex + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }

        entries.push([key, value.replace(/\\n/g, "\n")]);
    }

    return entries;
}

function loadEnvFile(filePath: string) {
    if (!existsSync(filePath)) {
        return;
    }

    for (const [key, value] of parseEnvFile(readFileSync(filePath, "utf8"))) {
        if (process.env[key] === undefined) {
            process.env[key] = value;
        }
    }
}

export function loadLocalEnv(projectDir: string) {
    const nodeEnv = process.env.NODE_ENV ?? "development";

    const files = nodeEnv === "test" ? [".env.test.local", ".env.test", ".env"] : [".env.local", `.env.${nodeEnv}`, ".env"];

    for (const fileName of files) {
        loadEnvFile(join(projectDir, fileName));
    }
}
