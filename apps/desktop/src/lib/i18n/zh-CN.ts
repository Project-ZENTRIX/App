import type { DesktopDictionary } from "./types";

export const zhCN: DesktopDictionary = {
    appName: "ZENTRIX Student Client",
    localeNames: {
        "zh-CN": "简体中文",
        "en-GB": "English",
    },
    navigation: {
        language: "语言",
        theme: "主题",
        light: "浅色",
        dark: "深色",
    },
    shell: {
        portalLabel: "学习执行端",
        mainNavigation: "主导航",
        management: "管理",
        currentPage: "当前页面",
        recentSync: "最近同步",
        overviewAndQuickAccess: "概览和快捷入口",
        browseAndBuyCourses: "浏览并购买课程",
        ownedContentAndAccess: "已拥有的内容与访问权限",
        subscriptionStatusAndPerks: "订阅状态与权益",
        orderAndPaymentStatus: "订单和支付状态",
        achievementsAndLevels: "成就与等级",
        licencesAndBindings: "许可证和绑定",
        profilePasswordAndSessions: "资料、密码与会话",
        expandSidebar: "展开侧栏",
        collapseSidebar: "折叠侧栏",
        connectionGroup: "连接与内容",
        executionGroup: "执行与记录",
        systemGroup: "系统",
        webLoginConnected: "Web 登录已连接",
        desktopAuthValid: "Desktop 授权有效",
        localPackCached: "本地课包已缓存",
        recentSyncBody: "本地课包、授权与运行状态都以 API 为准，离线时保留最近一次可用快照。",
    },
    pages: {
        startup: {
            label: "连接与启动",
            title: "连接与启动",
            summary: "Web 登录、Device Flow / Auth Code Flow 授权接力、本地缓存恢复都在这里串起来。",
        },
        "pack-selection": {
            label: "本地课包",
            title: "本地课包",
            summary: "缓存状态、更新可用性和离线学习在这里集中呈现。",
        },
        workspace: {
            label: "学习工作台",
            title: "学习工作台",
            summary: "阅读、编辑、运行、提交和反馈在同一工作区内完成。",
        },
        "lesson-details": {
            label: "课时与验证",
            title: "课时与验证",
            summary: "展示当前课时的目标、前置条件和完成要求。",
        },
        "runs-and-submissions": {
            label: "运行与提交",
            title: "运行与提交",
            summary: "集中查看最近运行、提交和判题结果。",
        },
        "sync-cache": {
            label: "同步与离线",
            title: "同步与离线",
            summary: "管理离线内容、本地草稿和待同步队列。",
        },
        settings: {
            label: "设备与配置",
            title: "设备与配置",
            summary: "调整设备、外观和诊断选项。",
        },
    },
};
