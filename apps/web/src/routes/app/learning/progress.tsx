import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@shared/ui";
import { PageHeader, Panel, TextList } from "$/lib/app-page-primitives";

export const Route = createFileRoute("/app/learning/progress")({
    component: LearningProgressRoute,
});

function LearningProgressRoute() {
    const { t } = useTranslation("app-pages");

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow={t("learning.progress.header.eyebrow")}
                title={t("learning.progress.header.title")}
                description={t("learning.progress.header.description")}
                actions={<Button size="sm">{t("learning.progress.header.openCheckIn")}</Button>}
            />
            <Panel title={t("learning.progress.panel.title")} description={t("learning.progress.panel.description")}>
                <TextList
                    items={[
                        {
                            title: t("learning.progress.signals.weeklyStreak.title"),
                            detail: t("learning.progress.signals.weeklyStreak.detail"),
                            tone: "success",
                        },
                        {
                            title: t("learning.progress.signals.readingBacklog.title"),
                            detail: t("learning.progress.signals.readingBacklog.detail"),
                            tone: "warning",
                        },
                        {
                            title: t("learning.progress.signals.practiceDue.title"),
                            detail: t("learning.progress.signals.practiceDue.detail"),
                            tone: "destructive",
                        },
                    ]}
                />
            </Panel>
        </div>
    );
}
