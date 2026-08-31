import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { PageHeader, Panel, SimpleTable } from "$/lib/app-page-primitives";

export const Route = createFileRoute("/app/admin/content")({
    component: AdminContentRoute,
});

function AdminContentRoute() {
    const { t } = useTranslation("app-pages");

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow={t("admin.content.header.eyebrow")}
                title={t("admin.content.header.title")}
                description={t("admin.content.header.description")}
            />
            <Panel title={t("admin.content.panel.title")} description={t("admin.content.panel.description")}>
                <SimpleTable
                    columns={[
                        t("admin.content.table.item"),
                        t("admin.content.table.owner"),
                        t("admin.content.table.state"),
                        t("admin.content.table.notes"),
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
