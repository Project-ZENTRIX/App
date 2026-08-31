import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { PageHeader, Panel, SimpleTable } from "$/lib/app-page-primitives";

export const Route = createFileRoute("/app/admin/licenses")({
    component: AdminLicensesRoute,
});

function AdminLicensesRoute() {
    const { t } = useTranslation("app-pages");

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow={t("admin.licenses.header.eyebrow")}
                title={t("admin.licenses.header.title")}
                description={t("admin.licenses.header.description")}
            />
            <Panel title={t("admin.licenses.panel.title")} description={t("admin.licenses.panel.description")}>
                <SimpleTable
                    columns={[
                        t("admin.licenses.table.tier"),
                        t("admin.licenses.table.seats"),
                        t("admin.licenses.table.usage"),
                        t("admin.licenses.table.note"),
                    ]}
                    rows={[
                        ["Enterprise", "412 seats", "378 used", "Renewal in 41 days"],
                        ["Classroom", "120 seats", "89 used", "Auto-renew enabled"],
                        ["Trial", "16 seats", "16 used", "Action needed"],
                    ]}
                />
            </Panel>
        </div>
    );
}
