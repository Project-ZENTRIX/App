import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { PageHeader, Panel, SimpleTable } from "$/lib/app-page-primitives";

export const Route = createFileRoute("/app/settings/general")({
    component: GeneralSettingsRoute,
});

function GeneralSettingsRoute() {
    const { t } = useTranslation("app-pages");

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow={t("settings.general.header.eyebrow")}
                title={t("settings.general.header.title")}
                description={t("settings.general.header.description")}
            />
            <Panel title={t("settings.general.panel.title")} description={t("settings.general.panel.description")}>
                <SimpleTable
                    columns={[t("settings.general.table.setting"), t("settings.general.table.value")]}
                    rows={[
                        ["Workspace name", "NEXORA Studios"],
                        ["Default language", "English"],
                        ["Date format", "YYYY-MM-DD"],
                        ["Week starts on", "Monday"],
                    ]}
                />
            </Panel>
        </div>
    );
}
