import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@shared/ui";
import { PageHeader, Panel, SimpleTable } from "$/lib/app-page-primitives";

export const Route = createFileRoute("/app/account/")({
    component: AccountHomeRoute,
});

function AccountHomeRoute() {
    const { t } = useTranslation("app-pages");

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow={t("account.home.header.eyebrow")}
                title={t("account.home.header.title")}
                description={t("account.home.header.description")}
                actions={<Button size="sm">{t("account.home.header.editProfile")}</Button>}
            />
            <div className="grid gap-4 xl:grid-cols-2">
                <Panel
                    title={t("account.home.panels.profile.title")}
                    description={t("account.home.panels.profile.description")}>
                    <SimpleTable
                        columns={[t("account.home.table.field"), t("account.home.table.value")]}
                        rows={[
                            ["Display name", "Jim Lin"],
                            ["Email", "jim.lin@nexora-studios.tech"],
                            ["Role", "Admin"],
                            ["Time zone", "UTC+8"],
                        ]}
                    />
                </Panel>
                <Panel
                    title={t("account.home.panels.membership.title")}
                    description={t("account.home.panels.membership.description")}>
                    <SimpleTable
                        columns={[t("account.home.table.item"), t("account.home.table.value")]}
                        rows={[
                            ["Current plan", "Pro Student"],
                            ["Billing cycle", "Monthly"],
                            ["Next invoice", "2026-09-18"],
                            ["Support level", "Priority"],
                        ]}
                    />
                </Panel>
            </div>
        </div>
    );
}
