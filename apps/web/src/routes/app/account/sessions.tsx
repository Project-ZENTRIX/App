import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@shared/ui";
import { PageHeader, Panel, SimpleTable } from "$/lib/app-page-primitives";

export const Route = createFileRoute("/app/account/sessions")({
    component: SessionsRoute,
});

function SessionsRoute() {
    const { t } = useTranslation("app-pages");

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow={t("account.sessions.header.eyebrow")}
                title={t("account.sessions.header.title")}
                description={t("account.sessions.header.description")}
                actions={<Button size="sm">{t("account.sessions.header.signOutAll")}</Button>}
            />
            <Panel title={t("account.sessions.panel.title")} description={t("account.sessions.panel.description")}>
                <SimpleTable
                    columns={[
                        t("account.sessions.table.device"),
                        t("account.sessions.table.location"),
                        t("account.sessions.table.status"),
                    ]}
                    rows={[
                        ["MacBook Pro", "Shanghai", "Current session"],
                        ["iPhone 15", "Shenzhen", "Last active 12m ago"],
                        ["Windows desktop", "Hong Kong", "Revoked"],
                    ]}
                />
            </Panel>
        </div>
    );
}
