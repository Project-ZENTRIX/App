import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@shared/ui";
import { MetricGrid, PageHeader, Panel, SimpleTable } from "$/lib/app-page-primitives";

export const Route = createFileRoute("/app/admin/")({
    component: AdminHomeRoute,
});

function AdminHomeRoute() {
    const { t } = useTranslation("app-pages");

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow={t("admin.home.header.eyebrow")}
                title={t("admin.home.header.title")}
                description={t("admin.home.header.description")}
                actions={<Button size="sm">{t("admin.home.header.openSystemStatus")}</Button>}
            />
            <MetricGrid
                metrics={[
                    {
                        label: t("admin.home.metrics.managedUsers.label"),
                        value: "1,908",
                        detail: t("admin.home.metrics.managedUsers.detail"),
                    },
                    {
                        label: t("admin.home.metrics.openIncidents.label"),
                        value: "4",
                        detail: t("admin.home.metrics.openIncidents.detail"),
                        tone: "warning",
                    },
                    {
                        label: t("admin.home.metrics.activeLicenses.label"),
                        value: "612",
                        detail: t("admin.home.metrics.activeLicenses.detail"),
                        tone: "success",
                    },
                    {
                        label: t("admin.home.metrics.blockedActions.label"),
                        value: "7",
                        detail: t("admin.home.metrics.blockedActions.detail"),
                        tone: "destructive",
                    },
                ]}
            />
            <div className="grid gap-4 xl:grid-cols-3">
                <Panel title={t("admin.home.panels.users.title")} description={t("admin.home.panels.users.description")}>
                    <SimpleTable
                        columns={[
                            t("admin.home.table.name"),
                            t("admin.home.table.role"),
                            t("admin.home.table.access"),
                            t("admin.home.table.note"),
                        ]}
                        rows={[
                            ["Jim Lin", "Admin", "Enabled", "2FA on"],
                            ["Maya Chen", "Teacher", "Enabled", "1 overdue review"],
                            ["Ethan Wang", "Student", "Suspended", "License expired"],
                        ]}
                    />
                </Panel>
                <Panel title={t("admin.home.panels.licenses.title")} description={t("admin.home.panels.licenses.description")}>
                    <SimpleTable
                        columns={[
                            t("admin.home.table.tier"),
                            t("admin.home.table.seats"),
                            t("admin.home.table.usage"),
                            t("admin.home.table.note"),
                        ]}
                        rows={[
                            ["Enterprise", "412 seats", "378 used", "Renewal in 41 days"],
                            ["Classroom", "120 seats", "89 used", "Auto-renew enabled"],
                            ["Trial", "16 seats", "16 used", "Action needed"],
                        ]}
                    />
                </Panel>
                <Panel title={t("admin.home.panels.system.title")} description={t("admin.home.panels.system.description")}>
                    <SimpleTable
                        columns={[
                            t("admin.home.table.service"),
                            t("admin.home.table.state"),
                            t("admin.home.table.slo"),
                            t("admin.home.table.note"),
                        ]}
                        rows={[
                            ["API gateway", "Healthy", "99.98%", "Last check 2m ago"],
                            ["Search index", "Degraded", "93.2%", "Rebuild queued"],
                            ["Media pipeline", "Healthy", "100%", "No backlog"],
                        ]}
                    />
                </Panel>
            </div>
        </div>
    );
}
