import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { QuickAction, PageHeader } from "$/lib/app-page-primitives";
import { LayoutDashboardIcon, SparklesIcon } from "lucide-react";

export const Route = createFileRoute("/app/settings/")({
    component: SettingsHomeRoute,
});

function SettingsHomeRoute() {
    const { t } = useTranslation("app-pages");

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow={t("settings.home.header.eyebrow")}
                title={t("settings.home.header.title")}
                description={t("settings.home.header.description")}
            />
            <div className="grid gap-4 xl:grid-cols-2">
                <QuickAction
                    title={t("settings.home.actions.general.title")}
                    description={t("settings.home.actions.general.description")}
                    icon={<LayoutDashboardIcon className="size-4" />}
                    href="/app/settings/general"
                />
                <QuickAction
                    title={t("settings.home.actions.preferences.title")}
                    description={t("settings.home.actions.preferences.description")}
                    icon={<SparklesIcon className="size-4" />}
                    href="/app/settings/preferences"
                />
            </div>
        </div>
    );
}
