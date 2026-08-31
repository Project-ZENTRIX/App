import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@shared/ui";
import { PageHeader, Panel, SimpleTable } from "$/lib/app-page-primitives";

export const Route = createFileRoute("/app/content/packages")({
    component: ContentPackagesRoute,
});

function ContentPackagesRoute() {
    const { t } = useTranslation("app-pages");

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow={t("content.packages.header.eyebrow")}
                title={t("content.packages.header.title")}
                description={t("content.packages.header.description")}
                actions={<Button size="sm">{t("content.packages.header.draftPackage")}</Button>}
            />
            <Panel title={t("content.packages.panel.title")} description={t("content.packages.panel.description")}>
                <SimpleTable
                    columns={[
                        t("content.packages.table.package"),
                        t("content.packages.table.status"),
                        t("content.packages.table.version"),
                        t("content.packages.table.updated"),
                    ]}
                    rows={[
                        ["Design Tokens 101", "Draft", "v0.8", "Updated 2h ago"],
                        ["Safe API Bootcamp", "Review", "v1.2", "Awaiting publish"],
                        ["Frontend Lab Kit", "Published", "v3.0", "Live in 4 regions"],
                    ]}
                />
            </Panel>
        </div>
    );
}
