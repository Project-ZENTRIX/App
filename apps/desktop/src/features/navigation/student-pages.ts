export type StudentPageId =
    "startup" | "pack-selection" | "workspace" | "lesson-details" | "runs-and-submissions" | "sync-cache" | "settings";

export interface StudentPageSection {
    heading: string;
    items: readonly string[];
}

export interface StudentPage {
    id: StudentPageId;
    label: string;
    title: string;
    summary: string;
    sections: readonly StudentPageSection[];
}

export const defaultStudentPageId: StudentPageId = "startup";

export const studentPages: readonly StudentPage[] = [
    {
        id: "startup",
        label: "连接与启动",
        title: "连接与启动",
        summary: "Web 登录、Device Flow / Auth Code Flow 授权接力、本地缓存恢复都在这里串起来。",
        sections: [
            {
                heading: "验证接力",
                items: ["Web 登录", "Device Flow / Auth Code Flow", "Desktop 授权确认", "会话落地"],
            },
            {
                heading: "启动检查",
                items: ["本地课包索引", "缓存完整性", "设备绑定", "最近学习位置"],
            },
        ],
    },
    {
        id: "pack-selection",
        label: "本地课包",
        title: "本地课包",
        summary: "缓存状态、更新可用性和离线学习在这里集中呈现。",
        sections: [
            {
                heading: "可用资产",
                items: ["最近使用课包", "已授权课包", "Manifest 版本", "离线可用包体"],
            },
            {
                heading: "更新动作",
                items: ["继续学习", "查看目录", "检查版本", "刷新缓存"],
            },
        ],
    },
    {
        id: "workspace",
        label: "学习工作台",
        title: "学习工作台",
        summary: "阅读、编辑、运行、提交和反馈在同一工作区内完成。",
        sections: [
            {
                heading: "主区域",
                items: ["课时说明", "代码编辑器", "本地运行状态", "实时输出"],
            },
            {
                heading: "辅助区",
                items: ["题目要求", "提示说明", "Rust 后端命令", "提交结果"],
            },
        ],
    },
    {
        id: "lesson-details",
        label: "课时与验证",
        title: "课时与验证",
        summary: "展示当前课时的目标、前置条件和完成要求。",
        sections: [
            {
                heading: "课时信息",
                items: ["学习目标", "前置条件", "完成标准", "资源链接"],
            },
            {
                heading: "完成检查",
                items: ["已读说明", "已改代码", "已运行", "已提交"],
            },
        ],
    },
    {
        id: "runs-and-submissions",
        label: "运行与提交",
        title: "运行与提交",
        summary: "集中查看最近运行、提交和判题结果。",
        sections: [
            {
                heading: "历史记录",
                items: ["最近运行", "最近提交", "判题状态", "资源消耗"],
            },
            {
                heading: "操作入口",
                items: ["重新运行", "重新提交", "查看日志", "对比结果"],
            },
        ],
    },
    {
        id: "sync-cache",
        label: "同步与离线",
        title: "同步与离线",
        summary: "管理离线内容、本地草稿和待同步队列。",
        sections: [
            {
                heading: "缓存范围",
                items: ["课包 Manifest", "课时内容", "资源索引", "本地草稿"],
            },
            {
                heading: "同步状态",
                items: ["待同步", "同步中", "同步失败", "恢复重放"],
            },
        ],
    },
    {
        id: "settings",
        label: "设备与配置",
        title: "设备与配置",
        summary: "调整设备、外观和诊断选项。",
        sections: [
            {
                heading: "外观与编辑",
                items: ["主题", "字号", "缩进", "快捷键"],
            },
            {
                heading: "诊断与维护",
                items: ["日志导出", "缓存清理", "网络诊断", "版本信息"],
            },
        ],
    },
] as const;

export function getStudentPage(id: StudentPageId): StudentPage {
    const page = studentPages.find((item) => item.id === id);

    if (!page) {
        throw new Error(`Unknown student page: ${id}`);
    }

    return page;
}
