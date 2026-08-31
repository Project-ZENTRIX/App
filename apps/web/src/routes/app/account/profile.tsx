import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { PageHeader, Panel, SimpleTable } from "$/lib/app-page-primitives";

export const Route = createFileRoute("/app/account/profile")({
    component: ProfileRoute,
});

function ProfileRoute() {
    const { t } = useTranslation("app-pages");

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow={t("account.profile.header.eyebrow")}
                title={t("account.profile.header.title")}
                description={t("account.profile.header.description")}
            />
            <Panel title={t("account.profile.panel.title")} description={t("account.profile.panel.description")}>
                <SimpleTable
                    columns={[t("account.profile.table.field"), t("account.profile.table.value")]}
                    rows={[
                        ["Display name", "Jim Lin"],
                        ["Email", "jim.lin@nexora-studios.tech"],
                        ["Role", "Admin"],
                        ["Time zone", "UTC+8"],
                    ]}
                />
            </Panel>
        </div>
    );
}
