import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { PageHeader, Panel, SimpleTable, TextList } from "$/lib/app-page-primitives";

export const Route = createFileRoute("/app/account/security")({
    component: SecurityRoute,
});

function SecurityRoute() {
    const { t } = useTranslation("app-pages");

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow={t("account.security.header.eyebrow")}
                title={t("account.security.header.title")}
                description={t("account.security.header.description")}
            />
            <div className="grid gap-4 xl:grid-cols-2">
                <Panel
                    title={t("account.security.panels.checks.title")}
                    description={t("account.security.panels.checks.description")}>
                    <TextList
                        items={[
                            {
                                title: t("account.security.signals.mfa.title"),
                                detail: t("account.security.signals.mfa.detail"),
                                tone: "success",
                            },
                            {
                                title: t("account.security.signals.recoveryEmail.title"),
                                detail: t("account.security.signals.recoveryEmail.detail"),
                                tone: "success",
                            },
                            {
                                title: t("account.security.signals.passwordAge.title"),
                                detail: t("account.security.signals.passwordAge.detail"),
                                tone: "warning",
                            },
                        ]}
                    />
                </Panel>
                <Panel
                    title={t("account.security.panels.devices.title")}
                    description={t("account.security.panels.devices.description")}>
                    <SimpleTable
                        columns={[
                            t("account.security.table.device"),
                            t("account.security.table.location"),
                            t("account.security.table.state"),
                        ]}
                        rows={[
                            ["MacBook Pro", "Shanghai", "Current session"],
                            ["iPhone 15", "Shenzhen", "Last active 12m ago"],
                            ["Windows desktop", "Hong Kong", "Revoked"],
                        ]}
                    />
                </Panel>
            </div>
        </div>
    );
}
