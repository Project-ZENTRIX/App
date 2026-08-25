import { describe, expect, it } from "vitest";

import { defaultStudentPageId, getStudentPage, studentPages } from "./student-pages";

describe("studentPages", () => {
    it("exposes the planned student client pages in order", () => {
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

    it("describes each page with a title, summary, and sections", () => {
        for (const page of studentPages) {
            expect(page.title).toBeTruthy();
            expect(page.summary).toBeTruthy();
            expect(page.sections.length).toBeGreaterThan(0);
        }
    });

    it("uses the startup page as the default landing surface", () => {
        expect(defaultStudentPageId).toBe("startup");
        expect(getStudentPage(defaultStudentPageId).title).toBe("启动与恢复");
    });
});
