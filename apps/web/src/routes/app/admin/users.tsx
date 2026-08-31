import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { PageHeader, Panel, SimpleTable } from "$/lib/app-page-primitives";

export const Route = createFileRoute("/app/admin/users")({
    component: AdminUsersRoute,
});

function AdminUsersRoute() {
    const { t } = useTranslation("app-pages");

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow={t("admin.users.header.eyebrow")}
                title={t("admin.users.header.title")}
                description={t("admin.users.header.description")}
            />
            <Panel title={t("admin.users.panel.title")} description={t("admin.users.panel.description")}>
                <SimpleTable
                    columns={[
                        t("admin.users.table.name"),
                        t("admin.users.table.role"),
                        t("admin.users.table.access"),
                        t("admin.users.table.note"),
                    ]}
                    rows={[
                        ["Jim Lin", "Admin", "Enabled", "2FA on"],
                        ["Maya Chen", "Teacher", "Enabled", "1 overdue review"],
                        ["Ethan Wang", "Student", "Suspended", "License expired"],
                    ]}
                />
            </Panel>
        </div>
    );
}
