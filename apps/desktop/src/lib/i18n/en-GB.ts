import type { DesktopDictionary } from "./types";

export const enGB: DesktopDictionary = {
    appName: "ZENTRIX Student Client",
    localeNames: {
        "zh-CN": "简体中文",
        "en-GB": "English",
    },
    navigation: {
        language: "Language",
        theme: "Theme",
        light: "Light",
        dark: "Dark",
    },
    shell: {
        portalLabel: "Learning client",
        mainNavigation: "Main navigation",
        management: "Management",
        currentPage: "Current page",
        recentSync: "Recent sync",
        overviewAndQuickAccess: "Overview and quick access",
        browseAndBuyCourses: "Browse and buy courses",
        ownedContentAndAccess: "Owned content and access",
        subscriptionStatusAndPerks: "Subscription status and perks",
        orderAndPaymentStatus: "Order and payment status",
        achievementsAndLevels: "Achievements and levels",
        licencesAndBindings: "Licences and bindings",
        profilePasswordAndSessions: "Profile, password, and sessions",
        expandSidebar: "Expand sidebar",
        collapseSidebar: "Collapse sidebar",
        connectionGroup: "Connection and content",
        executionGroup: "Execution and records",
        systemGroup: "System",
        webLoginConnected: "Web login connected",
        desktopAuthValid: "Desktop authorisation valid",
        localPackCached: "Local packs cached",
        recentSyncBody:
            "Local packs, authorisation, and run state follow the API; the last usable snapshot stays available offline.",
    },
    pages: {
        startup: {
            label: "Startup",
            title: "Startup",
            summary: "Web login, Device Flow / Auth Code Flow handoff, and local cache recovery are coordinated here.",
        },
        "pack-selection": {
            label: "Local packs",
            title: "Local packs",
            summary: "Cache state, update availability, and offline learning are shown together.",
        },
        workspace: {
            label: "Workspace",
            title: "Workspace",
            summary: "Read, edit, run, submit, and review in one working area.",
        },
        "lesson-details": {
            label: "Lesson review",
            title: "Lesson review",
            summary: "The current lesson's goals, prerequisites, and completion requirements.",
        },
        "runs-and-submissions": {
            label: "Runs and submissions",
            title: "Runs and submissions",
            summary: "Recent runs, submissions, and grading results in one place.",
        },
        "sync-cache": {
            label: "Sync and offline",
            title: "Sync and offline",
            summary: "Offline content, local drafts, and queued sync actions.",
        },
        settings: {
            label: "Device and settings",
            title: "Device and settings",
            summary: "Adjust devices, appearance, and diagnostic options.",
        },
    },
};
