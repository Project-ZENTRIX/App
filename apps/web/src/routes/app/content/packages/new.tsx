import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@shared/ui";
import { PageHeader, Panel, TextList } from "$/lib/app-page-primitives";

export const Route = createFileRoute("/app/content/packages/new")({
    component: NewPackageRoute,
});

function NewPackageRoute() {
    const { t } = useTranslation("app-pages");

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow={t("content.new.header.eyebrow")}
                title={t("content.new.header.title")}
                description={t("content.new.header.description")}
                actions={
                    <>
                        <Button variant="outline" size="sm">
                            {t("content.new.header.saveDraft")}
                        </Button>
                        <Button size="sm">{t("content.new.header.submitReview")}</Button>
                    </>
                }
            />
            <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <Panel title={t("content.new.checklist.title")} description={t("content.new.checklist.description")}>
                    <TextList
                        items={[
                            {
                                title: t("content.new.checklist.outline.title"),
                                detail: t("content.new.checklist.outline.detail"),
                                tone: "success",
                            },
                            {
                                title: t("content.new.checklist.assets.title"),
                                detail: t("content.new.checklist.assets.detail"),
                                tone: "warning",
                            },
                            {
                                title: t("content.new.checklist.review.title"),
                                detail: t("content.new.checklist.review.detail"),
                                tone: "destructive",
                            },
                        ]}
                    />
                </Panel>
                <Panel title={t("content.new.preview.title")} description={t("content.new.preview.description")}>
                    <div className="text-muted-foreground space-y-3 text-sm">
                        <p className="text-foreground">{t("content.new.preview.packageName")}</p>
                        <p>Frontend Lab Kit</p>
                        <p className="text-foreground">{t("content.new.preview.owner")}</p>
                        <p>Content team</p>
                        <p className="text-foreground">{t("content.new.preview.releaseTarget")}</p>
                        <p>2026-09-02 14:30</p>
                    </div>
                </Panel>
            </div>
        </div>
    );
}
