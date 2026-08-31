import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@shared/ui";
import { MetricGrid, PageHeader, Panel, SimpleTable } from "$/lib/app-page-primitives";

export const Route = createFileRoute("/app/content/")({
    component: ContentHomeRoute,
});

function ContentHomeRoute() {
    const { t } = useTranslation("app-pages");

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow={t("content.home.header.eyebrow")}
                title={t("content.home.header.title")}
                description={t("content.home.header.description")}
                actions={<Button size="sm">{t("content.home.header.newPackage")}</Button>}
            />
            <MetricGrid
                metrics={[
                    {
                        label: t("content.home.metrics.drafts.label"),
                        value: "9",
                        detail: t("content.home.metrics.drafts.detail"),
                    },
                    {
                        label: t("content.home.metrics.inReview.label"),
                        value: "6",
                        detail: t("content.home.metrics.inReview.detail"),
                        tone: "warning",
                    },
                    {
                        label: t("content.home.metrics.published.label"),
                        value: "42",
                        detail: t("content.home.metrics.published.detail"),
                        tone: "success",
                    },
                    {
                        label: t("content.home.metrics.libraryAssets.label"),
                        value: "128",
                        detail: t("content.home.metrics.libraryAssets.detail"),
                    },
                ]}
            />
            <div className="grid gap-4 xl:grid-cols-2">
                <Panel
                    title={t("content.home.panels.pipeline.title")}
                    description={t("content.home.panels.pipeline.description")}>
                    <SimpleTable
                        columns={[
                            t("content.home.table.package"),
                            t("content.home.table.status"),
                            t("content.home.table.version"),
                            t("content.home.table.note"),
                        ]}
                        rows={[
                            ["Design Tokens 101", "Draft", "v0.8", "Updated 2h ago"],
                            ["Safe API Bootcamp", "Review", "v1.2", "Awaiting publish"],
                            ["Frontend Lab Kit", "Published", "v3.0", "Live in 4 regions"],
                        ]}
                    />
                </Panel>
                <Panel title={t("content.home.panels.queue.title")} description={t("content.home.panels.queue.description")}>
                    <SimpleTable
                        columns={[
                            t("content.home.table.package"),
                            t("content.home.table.state"),
                            t("content.home.table.timing"),
                            t("content.home.table.note"),
                        ]}
                        rows={[
                            ["Frontend Lab Kit", "Scheduled", "Today 14:30", "Next release"],
                            ["Safety Review Pack", "Queued", "Needs approval", "Waiting"],
                            ["Mentor Toolkit", "Live", "Published 3 days ago", "Synced"],
                        ]}
                    />
                </Panel>
            </div>
        </div>
    );
}
