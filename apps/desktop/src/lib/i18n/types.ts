import type { Locale } from "./locales";
import type { StudentPageId } from "@/features/navigation/student-pages";

export interface DesktopDictionary {
    appName: string;
    localeNames: Record<Locale, string>;
    navigation: {
        language: string;
        theme: string;
        light: string;
        dark: string;
    };
    shell: {
        portalLabel: string;
        mainNavigation: string;
        management: string;
        currentPage: string;
        recentSync: string;
        overviewAndQuickAccess: string;
        browseAndBuyCourses: string;
        ownedContentAndAccess: string;
        subscriptionStatusAndPerks: string;
        orderAndPaymentStatus: string;
        achievementsAndLevels: string;
        licencesAndBindings: string;
        profilePasswordAndSessions: string;
        expandSidebar: string;
        collapseSidebar: string;
        connectionGroup: string;
        executionGroup: string;
        systemGroup: string;
        webLoginConnected: string;
        desktopAuthValid: string;
        localPackCached: string;
        recentSyncBody: string;
    };
    pages: Record<StudentPageId, { label: string; title: string; summary: string }>;
}
