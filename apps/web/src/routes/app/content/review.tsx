import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@shared/ui";
import { PageHeader, Panel, SimpleTable } from "$/lib/app-page-primitives";

export const Route = createFileRoute("/app/content/review")({
    component: ReviewRoute,
});

function ReviewRoute() {
    const { t } = useTranslation("app-pages");

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow={t("content.review.header.eyebrow")}
                title={t("content.review.header.title")}
                description={t("content.review.header.description")}
                actions={<Button size="sm">{t("content.review.header.openNextReview")}</Button>}
            />
            <Panel title={t("content.review.panel.title")} description={t("content.review.panel.description")}>
                <SimpleTable
                    columns={[
                        t("content.review.table.item"),
                        t("content.review.table.owner"),
                        t("content.review.table.state"),
                        t("content.review.table.notes"),
                    ]}
                    rows={[
                        ["Accessibility audit", "Teacher", "Pending", "3 notes"],
                        ["Course outline", "Content team", "Changes requested", "1 blocker"],
                        ["Exam bank", "Admin", "Approved", "Ready"],
                    ]}
                />
            </Panel>
        </div>
    );
}
