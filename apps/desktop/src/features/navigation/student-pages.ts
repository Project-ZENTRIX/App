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
        label: "启动与恢复",
        title: "启动与恢复",
        summary: "启动态检查、授权校验、本地缓存恢复都在这里完成。",
        sections: [
            {
                heading: "启动检查",
                items: ["登录态", "设备授权", "缓存完整性", "最近课包"],
            },
            {
                heading: "恢复动作",
                items: ["继续上次学习", "刷新授权", "修复缓存", "重新同步"],
            },
        ],
    },
    {
        id: "pack-selection",
        label: "课包选择",
        title: "课包选择",
        summary: "从已授权课包中选择今天要学习的内容。",
        sections: [
            {
                heading: "可用资产",
                items: ["最近使用课包", "已授权课包", "已缓存包体", "更新可用包"],
            },
            {
                heading: "选择动作",
                items: ["继续学习", "查看目录", "查看版本", "刷新列表"],
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
                items: ["课时说明", "代码编辑器", "文件视图", "实时输出"],
            },
            {
                heading: "辅助区",
                items: ["题目要求", "提示说明", "运行日志", "提交结果"],
            },
        ],
    },
    {
        id: "lesson-details",
        label: "课时详情",
        title: "课时详情",
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
        label: "同步与缓存",
        title: "同步与缓存",
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
        label: "设置",
        title: "设置",
        summary: "调整编辑器、外观和诊断选项。",
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
