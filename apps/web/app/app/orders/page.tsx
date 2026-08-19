"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ReceiptText } from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@workspace/ui/components/empty";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table";
import { listOrders, type OrderItem } from "@/lib/api/endpoints/commerce-api";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { useDictionary, useLocale } from "@/lib/i18n";

const copy = {
    "zh-CN": {
        paymentInitiated: "已发起",
        details: "详情",
    },
    "en-GB": {
        paymentInitiated: "initiated",
        details: "Details",
    },
} as const;

export default function OrdersPage() {
    const t = useDictionary();
    const locale = useLocale();
    const text = copy[locale];
    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        const loadOrders = async () => {
            try {
                const result = await listOrders();
                if (!active) {
                    return;
                }

                setOrders(result.items);
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void loadOrders();
        return () => {
            active = false;
        };
    }, []);

    return (
        <section className="flex flex-col gap-5">
            <header className="border-border/60 bg-muted/20 rounded-2xl border p-5">
                <div className="text-muted-foreground text-xs tracking-[0.28em] uppercase">{t.portal.ordersTitle}</div>
                <h1 className="mt-1 text-2xl font-semibold">{t.portal.ordersTitle}</h1>
                <p className="text-muted-foreground mt-1 text-sm">{t.portal.ordersDescription}</p>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>{t.portal.orderList}</CardTitle>
                    <CardDescription>{t.portal.ordersDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <Skeleton key={index} className="h-12 w-full" />
                            ))}
                        </div>
                    ) : orders.length ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t.portal.orderNo}</TableHead>
                                    <TableHead>{t.portal.status}</TableHead>
                                    <TableHead>{t.portal.total}</TableHead>
                                    <TableHead>{t.portal.created}</TableHead>
                                    <TableHead>{t.portal.payment}</TableHead>
                                    <TableHead>{text.details}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">{order.orderNo}</TableCell>
                                        <TableCell>
                                            <Badge variant={order.status === "paid" ? "secondary" : "outline"}>
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{formatCurrency(order.totalAmount, order.currency, locale)}</TableCell>
                                        <TableCell>{formatDateTime(order.createdAt, locale)}</TableCell>
                                        <TableCell>{order.payments[0]?.status ?? text.paymentInitiated}</TableCell>
                                        <TableCell>
                                            <Link className="inline-flex items-center gap-1 text-sm underline-offset-4 hover:underline" href={`/app/orders/${order.id}`}>
                                                {t.portal.viewDetails}
                                                <ArrowRight className="size-3.5" />
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <Empty className="border-border/60 bg-background border">
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <ReceiptText />
                                </EmptyMedia>
                                <EmptyTitle>{t.portal.noOrdersYet}</EmptyTitle>
                                <EmptyContent>
                                    <EmptyDescription>{t.portal.ordersDescription}</EmptyDescription>
                                </EmptyContent>
                            </EmptyHeader>
                        </Empty>
                    )}
                </CardContent>
            </Card>
        </section>
    );
}
