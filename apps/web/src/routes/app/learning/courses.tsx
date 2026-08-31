import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@shared/ui";
import { Badge } from "@shared/ui/components/badge";
import { PageHeader, Panel, SimpleTable } from "$/lib/app-page-primitives";

export const Route = createFileRoute("/app/learning/courses")({
    component: LearningCoursesRoute,
});

function LearningCoursesRoute() {
    const { t } = useTranslation("app-pages");

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow={t("learning.courses.header.eyebrow")}
                title={t("learning.courses.header.title")}
                description={t("learning.courses.header.description")}
                actions={<Button size="sm">{t("learning.courses.header.createCourse")}</Button>}
            />
            <Panel
                title={t("learning.courses.panel.title")}
                description={t("learning.courses.panel.description")}
                action={<Badge variant="outline">{t("learning.courses.panel.liveSync")}</Badge>}>
                <SimpleTable
                    columns={[
                        t("learning.courses.table.title"),
                        t("learning.courses.table.owner"),
                        t("learning.courses.table.progress"),
                        t("learning.courses.table.status"),
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
