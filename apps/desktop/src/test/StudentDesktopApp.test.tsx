import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { DesktopPortalSnapshot } from "../lib/desktop-api";

const mockedSnapshot = {
    loading: false,
    error: null,
    account: {
        id: "user-1",
        email: "jim@example.com",
        name: "Jim Lin",
        image: null,
        emailVerified: true,
        createdAt: "2026-08-25T01:00:00.000Z",
        updatedAt: "2026-08-25T01:05:00.000Z",
        userProfile: null,
    },
    accessProfile: {
        primaryRole: "student",
        roles: ["student"],
        allowedSurfaces: ["student"],
        permissions: ["read:student"],
    },
    license: {
        id: "license-1",
        licenseKey: "ZX-123456",
        status: "active",
        maxDevices: 2,
        deviceCount: 1,
        issuedAt: "2026-08-25T01:00:00.000Z",
        expiresAt: null,
        latestEventAt: null,
    },
    courses: [
        {
            id: "react-workbench",
            title: "React 组件工作台",
            summary: "用真实工作台拆解页面结构、状态流和可复用组件。",
            tags: ["React", "UI", "状态"],
            difficulty: "入门到进阶",
            price: "¥199",
            lessonCount: 12,
            version: "v1.0.0",
            purchased: true,
            learnable: true,
            offline: true,
            status: "published",
        },
        {
            id: "typescript-engineering",
            title: "TypeScript 工程化入门",
            summary: "在 monorepo、类型与接口边界中建立可维护的前端结构。",
            tags: ["TypeScript", "Monorepo", "工程化"],
            difficulty: "基础",
            price: "¥159",
            lessonCount: 9,
            version: "v1.0.0",
            purchased: true,
            learnable: true,
            offline: true,
            status: "published",
        },
    ],
    contentPacks: [
        {
            id: "pack-connect-client",
            title: "连接客户端与系统",
            summary: "对应 stage5 的 Web 登录、授权接力、本地课包与 Rust 后端。",
            manifestVersion: "1.0.3 · rev 12",
            contentVersion: "2026-08-25 09:18",
            cacheState: "已发布",
            offlineState: "zh-CN · 12 files",
            updatedAt: "2026-08-25 09:18",
            progress: 0.72,
        },
    ],
    devices: [
        {
            id: "device-main",
            name: "Jim Workstation",
            platform: "Windows 11",
            status: "已绑定",
            binding: "Primary",
            lastSeen: "2026-08-25 09:28",
            primary: true,
        },
    ],
    orders: [
        {
            orderNo: "ZX-10021",
            status: "已支付",
            total: "¥199",
            createdAt: "2026-08-21 12:04",
        },
    ],
    memberships: [
        {
            plan: "Student Pro",
            status: "有效",
            period: "2026-08-01 至 2026-09-01",
        },
    ],
    progressEvents: [{ label: "完成 lesson-002", detail: "已提交并同步到 API" }],
    runs: [{ name: "npm test", result: "completed", time: "2026-08-25 09:26" }],
    progress: {
        userId: "user-1",
        enrollments: [
            {
                id: "enrollment-1",
                courseId: "react-workbench",
                status: "active",
                enrolledAt: "2026-08-20T01:00:00.000Z",
                completedAt: null,
            },
        ],
        lessonProgress: {
            totalLessons: 12,
            completedLessons: 7,
            completionRate: 0.583,
            items: [],
        },
        recentEvents: [
            {
                id: "event-1",
                eventType: "lesson_completed",
                courseId: "react-workbench",
                lessonId: "lesson-002",
                taskId: null,
                payload: { message: "已提交并同步到 API" },
                createdAt: "2026-08-25T01:10:00.000Z",
            },
        ],
    },
    cacheCount: 1,
} satisfies DesktopPortalSnapshot;

vi.mock("../lib/desktop-api", () => ({
    loadDesktopPortalSnapshot: vi.fn(async () => mockedSnapshot),
}));

import { StudentDesktopApp } from "../app/StudentDesktopApp";

describe("StudentDesktopApp", () => {
    it("renders the shared app chrome and the stage 5 startup surface", async () => {
        render(<StudentDesktopApp />);

        expect(await screen.findByText("ZENTRIX Student Client")).toBeTruthy();
        expect(screen.getAllByText("Web 登录已连接").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Desktop 授权有效").length).toBeGreaterThan(0);
        expect(screen.getAllByText("本地课包已缓存").length).toBeGreaterThan(0);
        expect(screen.getByRole("heading", { name: "连接与启动" })).toBeTruthy();
        expect(
            screen.getAllByText(/Web 登录、Device Flow \/ Auth Code Flow 授权接力、本地缓存恢复都在这里串起来。/).length
        ).toBeGreaterThan(0);
    });

    it("filters courses and opens the settings surface", async () => {
        render(<StudentDesktopApp />);

        fireEvent.click(screen.getByRole("button", { name: /本地课包/ }));
        expect(screen.getByRole("heading", { name: "本地课包" })).toBeTruthy();

        fireEvent.change(screen.getByLabelText("搜索课包"), { target: { value: "React" } });
        await waitFor(() => expect(screen.getByRole("heading", { name: "React 组件工作台" })).toBeTruthy());
        expect(screen.queryByRole("heading", { name: "TypeScript 工程化入门" })).toBeNull();

        fireEvent.click(screen.getByRole("button", { name: /设备与配置/ }));
        expect(screen.getByRole("heading", { name: "设备与配置" })).toBeTruthy();
        expect(screen.getByLabelText("显示名称")).toBeTruthy();
        expect(screen.getByLabelText("邮箱")).toBeTruthy();
        expect(screen.getByRole("tab", { name: "安全与授权" })).toBeTruthy();
    });
});
