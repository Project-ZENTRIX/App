import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { PageHeader, Panel, SimpleTable } from "$/lib/app-page-primitives";

export const Route = createFileRoute("/app/account/notifications")({
    component: NotificationsRoute,
});

function NotificationsRoute() {
    const { t } = useTranslation("app-pages");

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow={t("account.notifications.header.eyebrow")}
                title={t("account.notifications.header.title")}
                description={t("account.notifications.header.description")}
            />
            <Panel title={t("account.notifications.panel.title")} description={t("account.notifications.panel.description")}>
                <SimpleTable
                    columns={[t("account.notifications.table.type"), t("account.notifications.table.setting")]}
                    rows={[
                        ["Review alerts", "On"],
                        ["Release digest", "On"],
                        ["Security alerts", "Immediate"],
                        ["Marketing updates", "Off"],
                    ]}
                />
            </Panel>
        </div>
    );
}
