import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@shared/ui";
import { Link } from "@tanstack/react-router";
import { PageHeader, Panel, TextList } from "$/lib/app-page-primitives";

export const Route = createFileRoute("/app/")({
    component: AppHomeRoute,
});

function AppHomeRoute() {
    const { t } = useTranslation("app-pages");

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow={t("appLanding.header.eyebrow")}
                title={t("appLanding.header.title")}
                description={t("appLanding.header.description")}
                actions={
                    <Button asChild size="sm">
                        <Link to="/app/dashboard">{t("appLanding.header.openDashboard")}</Link>
                    </Button>
                }
            />
            <div className="grid gap-4 xl:grid-cols-2">
                <Panel title={t("appLanding.panels.continue.title")} description={t("appLanding.panels.continue.description")}>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild>
                            <Link to="/app/learning/courses">{t("appLanding.actions.courses")}</Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link to="/app/content/packages">{t("appLanding.actions.packages")}</Link>
                        </Button>
                    </div>
                </Panel>
                <Panel title={t("appLanding.panels.status.title")} description={t("appLanding.panels.status.description")}>
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
