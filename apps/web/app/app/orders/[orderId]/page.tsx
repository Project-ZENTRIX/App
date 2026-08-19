"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, XCircle } from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@workspace/ui/components/empty";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
    cancelOrder,
    getOrder,
    payOrder,
    type OrderDetail,
} from "@/lib/api/endpoints/commerce-api";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { useLocale } from "@/lib/i18n";

const copy = {
    "zh-CN": {
        title: "订单详情",
        description: "查看订单项、支付状态和下一步操作。",
        orderSummary: "订单概览",
        orderItems: "订单项",
        paymentHistory: "支付记录",
        paymentInitiated: "已发起",
        payNow: "继续支付",
        cancelOrder: "取消订单",
        payPending: "正在支付...",
        cancelPending: "正在取消...",
        noItems: "暂无订单项",
        noPayments: "暂无支付记录",
        status: "状态",
        totalAmount: "总金额",
        createdAt: "创建时间",
        updatedAt: "更新时间",
        orderNo: "订单号",
        backToOrders: "返回订单列表",
    },
    "en-GB": {
        title: "Order detail",
        description: "Review the order items, payment status, and next actions.",
        orderSummary: "Order summary",
        orderItems: "Order items",
        paymentHistory: "Payment history",
        paymentInitiated: "initiated",
        payNow: "Pay now",
        cancelOrder: "Cancel order",
        payPending: "Paying...",
        cancelPending: "Cancelling...",
        noItems: "No order items",
        noPayments: "No payment records",
        status: "Status",
        totalAmount: "Total amount",
        createdAt: "Created at",
        updatedAt: "Updated at",
        orderNo: "Order no.",
        backToOrders: "Back to orders",
    },
} as const;

export default function OrderDetailPage() {
    const locale = useLocale();
    const text = copy[locale];
    const params = useParams<{ orderId: string }>();
    const orderId = params.orderId;
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState<"pay" | "cancel" | null>(null);
    const [error, setError] = useState<string | null>(null);

    const loadOrder = async () => {
        setLoading(true);
        try {
            const detail = await getOrder(orderId);
            setOrder(detail);
            setError(null);
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : locale === "zh-CN" ? "无法加载订单详情" : "Unable to load order detail");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void loadOrder();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId, locale]);

    const handlePay = async () => {
        if (!order) {
            return;
        }

        setSubmitting("pay");
        try {
            await payOrder(order.id);
            await loadOrder();
        } catch (payError) {
            setError(payError instanceof Error ? payError.message : locale === "zh-CN" ? "无法继续支付" : "Unable to continue payment");
        } finally {
            setSubmitting(null);
        }
    };

    const handleCancel = async () => {
        if (!order) {
            return;
        }

        setSubmitting("cancel");
        try {
            await cancelOrder(order.id);
            await loadOrder();
        } catch (cancelError) {
            setError(cancelError instanceof Error ? cancelError.message : locale === "zh-CN" ? "无法取消订单" : "Unable to cancel order");
        } finally {
            setSubmitting(null);
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-72 w-full" />
            </div>
        );
    }

    if (error) {
        return <div className="border-destructive/40 bg-destructive/10 text-destructive rounded-xl border px-4 py-3 text-sm">{error}</div>;
    }

    if (!order) {
        return (
            <Empty className="border-border/60 bg-background border">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <XCircle />
                    </EmptyMedia>
                    <EmptyTitle>{text.title}</EmptyTitle>
                    <EmptyContent>
                        <EmptyDescription>{locale === "zh-CN" ? "未找到订单。" : "The order could not be found."}</EmptyDescription>
                    </EmptyContent>
                </EmptyHeader>
            </Empty>
        );
    }

    return (
        <section className="flex flex-col gap-5">
            <header className="border-border/60 bg-muted/20 flex flex-wrap items-start justify-between gap-4 rounded-2xl border p-5">
                <div className="min-w-0">
                    <div className="text-muted-foreground text-xs tracking-[0.28em] uppercase">{text.title}</div>
                    <h1 className="mt-1 text-2xl font-semibold">{text.title}</h1>
                    <p className="text-muted-foreground mt-1 text-sm">{text.description}</p>
                    <p className="text-muted-foreground mt-2 text-sm">{order.orderNo}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={order.status === "paid" ? "secondary" : "outline"}>{order.status}</Badge>
                    <Badge variant="outline">{formatCurrency(order.totalAmount, order.currency, locale)}</Badge>
                </div>
            </header>

            <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <Card>
                    <CardHeader>
                        <CardTitle>{text.orderSummary}</CardTitle>
                        <CardDescription>{text.orderNo}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border p-4">
                            <div className="text-muted-foreground text-sm">{text.status}</div>
                            <div className="mt-1 font-medium">{order.status}</div>
                        </div>
                        <div className="rounded-xl border p-4">
                            <div className="text-muted-foreground text-sm">{text.totalAmount}</div>
                            <div className="mt-1 font-medium">{formatCurrency(order.totalAmount, order.currency, locale)}</div>
                        </div>
                        <div className="rounded-xl border p-4">
                            <div className="text-muted-foreground text-sm">{text.createdAt}</div>
                            <div className="mt-1 font-medium">{formatDateTime(order.createdAt, locale)}</div>
                        </div>
                        <div className="rounded-xl border p-4">
                            <div className="text-muted-foreground text-sm">{text.updatedAt}</div>
                            <div className="mt-1 font-medium">{formatDateTime(order.updatedAt, locale)}</div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{text.orderSummary}</CardTitle>
                        <CardDescription>{locale === "zh-CN" ? "在这里继续处理付款或取消。" : "Use these actions to finish or cancel the order."}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button className="w-full justify-between" disabled={!order.canPay || submitting !== null} onClick={handlePay}>
                            {submitting === "pay" ? text.payPending : text.payNow}
                            <ArrowRight />
                        </Button>
                        <Button
                            className="w-full justify-between"
                            variant="outline"
                            disabled={!order.canCancel || submitting !== null}
                            onClick={handleCancel}>
                            {submitting === "cancel" ? text.cancelPending : text.cancelOrder}
                            <XCircle />
                        </Button>
                        <Button asChild variant="ghost" className="w-full justify-between">
                            <Link href="/app/orders">
                                {text.backToOrders}
                                <ArrowRight />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>{text.orderItems}</CardTitle>
                        <CardDescription>{locale === "zh-CN" ? "订单中包含的商品。" : "Products included in this order."}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {order.items.length ? (
                            order.items.map((item) => (
                                <div key={item.id} className="rounded-xl border p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <div className="font-medium">{item.name}</div>
                                            <div className="text-muted-foreground text-sm">
                                                {item.quantity} × {formatCurrency(item.unitPrice, order.currency, locale)}
                                            </div>
                                        </div>
                                        <div className="font-medium">{formatCurrency(item.subtotal, order.currency, locale)}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <Empty className="border-border/60 bg-background border">
                                <EmptyHeader>
                                    <EmptyTitle>{text.noItems}</EmptyTitle>
                                    <EmptyContent>
                                        <EmptyDescription>{locale === "zh-CN" ? "订单没有明细。" : "This order has no items."}</EmptyDescription>
                                    </EmptyContent>
                                </EmptyHeader>
                            </Empty>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{text.paymentHistory}</CardTitle>
                        <CardDescription>{locale === "zh-CN" ? "支付记录和状态。" : "Payments attached to this order."}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {order.payments.length ? (
                            order.payments.map((payment) => (
                                <div key={payment.id} className="rounded-xl border p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <div className="font-medium">{payment.paymentNo}</div>
                                            <div className="text-muted-foreground text-sm">{formatDateTime(payment.createdAt, locale)}</div>
                                        </div>
                                        <Badge variant={payment.status === "succeeded" ? "secondary" : "outline"}>{payment.status}</Badge>
                                    </div>
                                    <div className="text-muted-foreground mt-2 text-sm">
                                        {formatCurrency(payment.amount, payment.currency, locale)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <Empty className="border-border/60 bg-background border">
                                <EmptyHeader>
                                    <EmptyTitle>{text.noPayments}</EmptyTitle>
                                    <EmptyContent>
                                        <EmptyDescription>{text.paymentInitiated}</EmptyDescription>
                                    </EmptyContent>
                                </EmptyHeader>
                            </Empty>
                        )}
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
