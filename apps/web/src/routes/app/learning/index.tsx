import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@shared/ui";
import { MetricGrid, PageHeader, Panel, SimpleTable } from "$/lib/app-page-primitives";

export const Route = createFileRoute("/app/learning/")({
    component: LearningHomeRoute,
});

function LearningHomeRoute() {
    const { t } = useTranslation("app-pages");

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow={t("learning.home.header.eyebrow")}
                title={t("learning.home.header.title")}
                description={t("learning.home.header.description")}
                actions={<Button size="sm">{t("learning.home.header.startNewLesson")}</Button>}
            />
            <MetricGrid
                metrics={[
                    {
                        label: t("learning.home.metrics.enrolledCourses.label"),
                        value: "14",
                        detail: t("learning.home.metrics.enrolledCourses.detail"),
                    },
                    {
                        label: t("learning.home.metrics.lessonsCompleted.label"),
                        value: "3,219",
                        detail: t("learning.home.metrics.lessonsCompleted.detail"),
                        tone: "success",
                    },
                    {
                        label: t("learning.home.metrics.atRiskLearners.label"),
                        value: "7",
                        detail: t("learning.home.metrics.atRiskLearners.detail"),
                        tone: "warning",
                    },
                    {
                        label: t("learning.home.metrics.assessmentsDue.label"),
                        value: "11",
                        detail: t("learning.home.metrics.assessmentsDue.detail"),
                        tone: "destructive",
                    },
                ]}
            />
            <Panel title={t("learning.home.panel.title")} description={t("learning.home.panel.description")}>
                <SimpleTable
                    columns={[
                        t("learning.home.table.course"),
                        t("learning.home.table.audience"),
                        t("learning.home.table.progress"),
                        t("learning.home.table.state"),
                    ]}
                    rows={[
                        ["Intro to TypeScript", "Student", "72%", "Running"],
                        ["React System Design", "Teacher", "58%", "Draft"],
                        ["Platform Onboarding", "Student", "93%", "Completed"],
                    ]}
                />
            </Panel>
        </div>
    );
}
