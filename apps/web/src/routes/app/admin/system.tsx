import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { PageHeader, Panel, SimpleTable } from "$/lib/app-page-primitives";

export const Route = createFileRoute("/app/admin/system")({
    component: AdminSystemRoute,
});

function AdminSystemRoute() {
    const { t } = useTranslation("app-pages");

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow={t("admin.system.header.eyebrow")}
                title={t("admin.system.header.title")}
                description={t("admin.system.header.description")}
            />
            <Panel title={t("admin.system.panel.title")} description={t("admin.system.panel.description")}>
                <SimpleTable
                    columns={[
                        t("admin.system.table.service"),
                        t("admin.system.table.state"),
                        t("admin.system.table.slo"),
                        t("admin.system.table.note"),
                    ]}
                    rows={[
                        ["API gateway", "Healthy", "99.98%", "Last check 2m ago"],
                        ["Search index", "Degraded", "93.2%", "Rebuild queued"],
                        ["Media pipeline", "Healthy", "100%", "No backlog"],
                    ]}
                />
            </Panel>
        </div>
    );
}
