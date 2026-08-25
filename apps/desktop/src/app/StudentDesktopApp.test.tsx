import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StudentDesktopApp } from "./StudentDesktopApp";

describe("StudentDesktopApp", () => {
    it("renders the startup page first and switches pages from the navigation", () => {
        render(<StudentDesktopApp />);

        expect(screen.getByRole("heading", { name: "启动与恢复" })).toBeTruthy();
        expect(screen.getByText("启动态检查、授权校验、本地缓存恢复都在这里完成。")).toBeTruthy();

        fireEvent.click(screen.getByRole("button", { name: "学习工作台" }));

        expect(screen.getByRole("heading", { name: "学习工作台" })).toBeTruthy();
        expect(screen.getByText("阅读、编辑、运行、提交和反馈在同一工作区内完成。")).toBeTruthy();
    });
});
