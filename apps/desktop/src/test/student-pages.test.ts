import { describe, expect, it } from "vitest";

import { defaultStudentPageId, getStudentPage, studentPages } from "../features/navigation/student-pages";

describe("studentPages", () => {
    it("keeps the stage 5 navigation order", () => {
        expect(studentPages.map((page) => page.id)).toEqual([
            "startup",
            "pack-selection",
            "workspace",
            "lesson-details",
            "runs-and-submissions",
            "sync-cache",
            "settings",
        ]);
    });

    it("describes the startup and local pack surfaces with stage 5 wording", () => {
        expect(defaultStudentPageId).toBe("startup");
        expect(getStudentPage("startup").title).toBe("连接与启动");
        expect(getStudentPage("pack-selection").title).toBe("本地课包");
        expect(getStudentPage("workspace").title).toBe("学习工作台");
    });

    it("keeps every page populated with useful sections", () => {
        for (const page of studentPages) {
            expect(page.summary).toBeTruthy();
            expect(page.sections.length).toBeGreaterThan(0);
            expect(page.sections.every((section) => section.items.length > 0)).toBe(true);
        }
    });
});
