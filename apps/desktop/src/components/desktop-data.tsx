import { CircleCheckBig, HardDriveDownload, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

export interface CourseItem {
    id: string;
    title: string;
    summary: string;
    tags: string[];
    level: string;
    price: string;
    lessonCount: number;
    purchased: boolean;
}

export interface LocalPackItem {
    id: string;
    title: string;
    summary: string;
    manifestVersion: string;
    contentVersion: string;
    cacheState: string;
    offlineState: string;
    updatedAt: string;
    progress: number;
}

export interface DeviceItem {
    id: string;
    name: string;
    platform: string;
    status: string;
    binding: string;
    lastSeen: string;
    primary: boolean;
}

export const courseItems: CourseItem[] = [
    {
        id: "react-workbench",
        title: "React 组件工作台",
        summary: "用真实工作台拆解页面结构、状态流和可复用组件。",
        tags: ["React", "UI", "状态"],
        level: "入门到进阶",
        price: "¥199",
        lessonCount: 12,
        purchased: true,
    },
    {
        id: "typescript-engineering",
        title: "TypeScript 工程化入门",
        summary: "在 monorepo、类型与接口边界中建立可维护的前端结构。",
        tags: ["TypeScript", "Monorepo", "工程化"],
        level: "基础",
        price: "¥159",
        lessonCount: 9,
        purchased: true,
    },
    {
        id: "desktop-shell",
        title: "Desktop 壳层与授权接力",
        summary: "从 Web 登录到 Desktop 会话落地，构建可验证的连接路径。",
        tags: ["Tauri", "Auth", "Device Flow"],
        level: "进阶",
        price: "¥259",
        lessonCount: 15,
        purchased: false,
    },
];

export const localPacks: LocalPackItem[] = [
    {
        id: "pack-connect-client",
        title: "连接客户端与系统",
        summary: "对应 stage5 的 Web 登录、授权接力、本地课包与 Rust 后端。",
        manifestVersion: "1.0.3",
        contentVersion: "2026.08.25",
        cacheState: "已缓存",
        offlineState: "可离线阅读",
        updatedAt: "2026-08-25 09:18",
        progress: 0.72,
    },
    {
        id: "pack-class-system",
        title: "课包内容与课程系统",
        summary: "课程、课时、资源与测验的文件化课包来源。",
        manifestVersion: "1.1.0",
        contentVersion: "2026.08.18",
        cacheState: "已缓存",
        offlineState: "可离线学习",
        updatedAt: "2026-08-24 16:40",
        progress: 0.51,
    },
];

export const deviceItems: DeviceItem[] = [
    {
        id: "device-main",
        name: "Jim Workstation",
        platform: "Windows 11",
        status: "已绑定",
        binding: "Primary",
        lastSeen: "2026-08-25 09:28",
        primary: true,
    },
    {
        id: "device-lab",
        name: "Lab PC 2",
        platform: "Windows 11",
        status: "已绑定",
        binding: "Secondary",
        lastSeen: "2026-08-24 21:03",
        primary: false,
    },
];

export const recentRuns = [
    { name: "npm test", result: "通过", time: "2026-08-25 09:26" },
    { name: "npm run lint", result: "通过", time: "2026-08-25 09:10" },
    { name: "submit lesson-002", result: "判题中", time: "2026-08-24 19:42" },
] as const;

export const orders = [
    { orderNo: "ZX-10021", status: "已支付", total: "¥199", createdAt: "2026-08-21 12:04" },
    { orderNo: "ZX-10033", status: "已支付", total: "¥259", createdAt: "2026-08-18 16:18" },
] as const;

export const membershipHistory = [
    { plan: "Student Pro", status: "有效", period: "2026-08-01 至 2026-09-01" },
    { plan: "Desktop Add-on", status: "有效", period: "2026-08-15 至 2026-09-15" },
] as const;

export const progressEvents = [
    { label: "完成 lesson-002", detail: "已提交并同步到 API", icon: CircleCheckBig },
    { label: "授权刷新", detail: "Web 登录会话已同步到 Desktop", icon: ShieldCheck },
    { label: "本地缓存更新", detail: "pack-connect-client manifest 已刷新", icon: HardDriveDownload },
] as const;

export function pageShell(title: string, description: string, right?: ReactNode) {
    return (
        <header className="border-border/60 bg-muted/20 flex flex-wrap items-start justify-between gap-4 rounded-2xl border p-5">
            <div className="min-w-0">
                <div className="text-muted-foreground text-xs tracking-[0.28em] uppercase">{title}</div>
                <h1 className="mt-1 text-2xl font-semibold">{title}</h1>
                <p className="text-muted-foreground mt-1 max-w-3xl text-sm">{description}</p>
            </div>
            {right ? <div className="flex flex-wrap items-center gap-2">{right}</div> : null}
        </header>
    );
}

export function statGrid(items: Array<{ label: string; value: string; helper: string }>) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            {items.map((item) => (
                <div key={item.label} className="bg-card rounded-xl border p-4 shadow-sm">
                    <div className="text-muted-foreground text-sm">{item.label}</div>
                    <div className="mt-1 text-2xl font-semibold">{item.value}</div>
                    <div className="text-muted-foreground mt-1 text-xs">{item.helper}</div>
                </div>
            ))}
        </div>
    );
}
