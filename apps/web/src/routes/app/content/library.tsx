import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@shared/ui";
import { PageHeader, Panel, SimpleTable } from "$/lib/app-page-primitives";

export const Route = createFileRoute("/app/content/library")({
    component: LibraryRoute,
});

function LibraryRoute() {
    const { t } = useTranslation("app-pages");

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow={t("content.library.header.eyebrow")}
                title={t("content.library.header.title")}
                description={t("content.library.header.description")}
                actions={<Button size="sm">{t("content.library.header.uploadAsset")}</Button>}
            />
            <Panel title={t("content.library.panel.title")} description={t("content.library.panel.description")}>
                <SimpleTable
                    columns={[
                        t("content.library.table.asset"),
                        t("content.library.table.type"),
                        t("content.library.table.size"),
                        t("content.library.table.access"),
                    ]}
                    rows={[
                        ["TypeScript cheatsheet", "PDF", "1.2 MB", "Shared"],
                        ["Onboarding video", "Video", "248 MB", "Restricted"],
                        ["Brand logo pack", "ZIP", "36 MB", "Shared"],
                    ]}
                />
            </Panel>
        </div>
    );
}
