import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@shared/ui";
import { PageHeader, Panel, SimpleTable } from "$/lib/app-page-primitives";

export const Route = createFileRoute("/app/content/publishing")({
    component: PublishingRoute,
});

function PublishingRoute() {
    const { t } = useTranslation("app-pages");

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow={t("content.publishing.header.eyebrow")}
                title={t("content.publishing.header.title")}
                description={t("content.publishing.header.description")}
                actions={<Button size="sm">{t("content.publishing.header.scheduleRelease")}</Button>}
            />
            <Panel title={t("content.publishing.panel.title")} description={t("content.publishing.panel.description")}>
                <SimpleTable
                    columns={[
                        t("content.publishing.table.package"),
                        t("content.publishing.table.status"),
                        t("content.publishing.table.window"),
                        t("content.publishing.table.note"),
                    ]}
                    rows={[
                        ["Frontend Lab Kit", "Scheduled", "Today 14:30", "Next release"],
                        ["Safety Review Pack", "Queued", "Needs approval", "Waiting"],
                        ["Mentor Toolkit", "Live", "Published 3 days ago", "Synced"],
                    ]}
                />
            </Panel>
        </div>
    );
}
