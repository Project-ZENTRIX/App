import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { PageHeader, Panel, SimpleTable } from "$/lib/app-page-primitives";

export const Route = createFileRoute("/app/settings/preferences")({
    component: PreferencesRoute,
});

function PreferencesRoute() {
    const { t } = useTranslation("app-pages");

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow={t("settings.preferences.header.eyebrow")}
                title={t("settings.preferences.header.title")}
                description={t("settings.preferences.header.description")}
            />
            <Panel title={t("settings.preferences.panel.title")} description={t("settings.preferences.panel.description")}>
                <SimpleTable
                    columns={[t("settings.preferences.table.preference"), t("settings.preferences.table.value")]}
                    rows={[
                        ["Compact density", "Enabled"],
                        ["Auto-save drafts", "Enabled"],
                        ["Motion reduction", "Disabled"],
                        ["Email summaries", "Weekly"],
                    ]}
                />
            </Panel>
        </div>
    );
}
