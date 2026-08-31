import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@shared/ui";
import { PageHeader, Panel, SimpleTable } from "$/lib/app-page-primitives";

export const Route = createFileRoute("/app/account/membership")({
    component: MembershipRoute,
});

function MembershipRoute() {
    const { t } = useTranslation("app-pages");

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow={t("account.membership.header.eyebrow")}
                title={t("account.membership.header.title")}
                description={t("account.membership.header.description")}
                actions={<Button size="sm">{t("account.membership.header.upgradePlan")}</Button>}
            />
            <Panel title={t("account.membership.panel.title")} description={t("account.membership.panel.description")}>
                <SimpleTable
                    columns={[t("account.membership.table.field"), t("account.membership.table.value")]}
                    rows={[
                        ["Current plan", "Pro Student"],
                        ["Billing cycle", "Monthly"],
                        ["Next invoice", "2026-09-18"],
                        ["Support level", "Priority"],
                    ]}
                />
            </Panel>
        </div>
    );
}
