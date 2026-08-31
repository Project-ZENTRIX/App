import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@shared/ui";
import { PageHeader, MetricGrid, Panel, QuickAction, TextList } from "$/lib/app-page-primitives";
import { LayoutDashboardIcon, PackageIcon, ShieldAlertIcon } from "lucide-react";

export const Route = createFileRoute("/app/dashboard")({
    component: DashboardRoute,
});

function DashboardRoute() {
    const { t } = useTranslation("app-pages");

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow={t("dashboard.header.eyebrow")}
                title={t("dashboard.header.title")}
                description={t("dashboard.header.description")}
                actions={
                    <>
                        <Button variant="outline" size="sm">
                            {t("dashboard.header.exportReport")}
                        </Button>
                        <Button size="sm">{t("dashboard.header.openLearningPath")}</Button>
                    </>
                }
            />
            <MetricGrid
                metrics={[
                    {
                        label: t("dashboard.metrics.activeLearners.label"),
                        value: "1,284",
                        detail: t("dashboard.metrics.activeLearners.detail"),
                        tone: "success",
                    },
                    {
                        label: t("dashboard.metrics.inReview.label"),
                        value: "18",
                        detail: t("dashboard.metrics.inReview.detail"),
                        tone: "warning",
                    },
                    {
                        label: t("dashboard.metrics.publishedPacks.label"),
                        value: "42",
                        detail: t("dashboard.metrics.publishedPacks.detail"),
                    },
                    {
                        label: t("dashboard.metrics.openSessions.label"),
                        value: "316",
                        detail: t("dashboard.metrics.openSessions.detail"),
                    },
                ]}
            />
            <div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
                <Panel
                    title={t("dashboard.quickActions.panel.title")}
                    description={t("dashboard.quickActions.panel.description")}>
                    <div className="grid gap-3">
                        <QuickAction
                            title={t("dashboard.quickActions.continueLearning.title")}
                            description={t("dashboard.quickActions.continueLearning.description")}
                            icon={<LayoutDashboardIcon className="size-4" />}
                            href="/app/learning/courses"
                        />
                        <QuickAction
                            title={t("dashboard.quickActions.openContentStudio.title")}
                            description={t("dashboard.quickActions.openContentStudio.description")}
                            icon={<PackageIcon className="size-4" />}
                            href="/app/content/packages"
                        />
                        <QuickAction
                            title={t("dashboard.quickActions.checkAdminQueue.title")}
                            description={t("dashboard.quickActions.checkAdminQueue.description")}
                            icon={<ShieldAlertIcon className="size-4" />}
                            href="/app/admin"
                        />
                    </div>
                </Panel>
                <Panel title={t("dashboard.recentStatus.title")} description={t("dashboard.recentStatus.description")}>
                    <TextList
                        items={[
                            {
                                title: t("dashboard.recentStatus.weeklyStreak.title"),
                                detail: t("dashboard.recentStatus.weeklyStreak.detail"),
                                tone: "success",
                            },
                            {
                                title: t("dashboard.recentStatus.readingBacklog.title"),
                                detail: t("dashboard.recentStatus.readingBacklog.detail"),
                                tone: "warning",
                            },
                            {
                                title: t("dashboard.recentStatus.practiceDue.title"),
                                detail: t("dashboard.recentStatus.practiceDue.detail"),
                                tone: "destructive",
                            },
                        ]}
                    />
                </Panel>
            </div>
        </div>
    );
}
