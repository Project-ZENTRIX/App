import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { PageHeader, Panel, SimpleTable } from "$/lib/app-page-primitives";

export const Route = createFileRoute("/app/account/orders")({
    component: OrdersRoute,
});

function OrdersRoute() {
    const { t } = useTranslation("app-pages");

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow={t("account.orders.header.eyebrow")}
                title={t("account.orders.header.title")}
                description={t("account.orders.header.description")}
            />
            <Panel title={t("account.orders.panel.title")} description={t("account.orders.panel.description")}>
                <SimpleTable
                    columns={[
                        t("account.orders.table.order"),
                        t("account.orders.table.product"),
                        t("account.orders.table.amount"),
                        t("account.orders.table.status"),
                    ]}
                    rows={[
                        ["#10421", "Annual plan", "$2,400", "Paid"],
                        ["#10422", "Course bundle", "$180", "Refund requested"],
                        ["#10423", "Device license", "$32", "Pending"],
                    ]}
                />
            </Panel>
        </div>
    );
}
