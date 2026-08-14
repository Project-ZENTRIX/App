"use client";

import { useEffect, useState } from "react";
import { Crown, RefreshCcw } from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@workspace/ui/components/empty";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { getCurrentSubscription, listSubscriptions, type SubscriptionItem } from "@/lib/api/endpoints/commerce-api";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { useDictionary, useLocale } from "@/lib/i18n";

const copy = {
    "zh-CN": {
        between: "至",
    },
    "en-GB": {
        between: "to",
    },
} as const;

export default function MembershipPage() {
    const t = useDictionary();
    const locale = useLocale();
    const text = copy[locale];
    const [current, setCurrent] = useState<SubscriptionItem | null>(null);
    const [history, setHistory] = useState<SubscriptionItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        void (async () => {
            try {
                const [currentSubscription, subscriptionHistory] = await Promise.all([
                    getCurrentSubscription(),
                    listSubscriptions(),
                ]);

                if (!active) {
                    return;
                }

                setCurrent(currentSubscription);
                setHistory(subscriptionHistory.items);
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        })();

        return () => {
            active = false;
        };
    }, []);

    return (
        <section className="flex flex-col gap-5">
            <header className="border-border/60 bg-muted/20 flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5">
                <div>
                    <div className="text-muted-foreground text-xs tracking-[0.28em] uppercase">{t.portal.membershipTitle}</div>
                    <h1 className="mt-1 text-2xl font-semibold">{t.portal.membershipTitle}</h1>
                    <p className="text-muted-foreground mt-1 text-sm">{t.portal.membershipDescription}</p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => {
                        setLoading(true);
                        void (async () => {
                            const [currentSubscription, subscriptionHistory] = await Promise.all([
                                getCurrentSubscription(),
                                listSubscriptions(),
                            ]);
                            setCurrent(currentSubscription);
                            setHistory(subscriptionHistory.items);
                            setLoading(false);
                        })();
                    }}>
                    <RefreshCcw />
                    {t.portal.refreshStatus}
                </Button>
            </header>

            <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                <Card>
                    <CardHeader>
                        <CardTitle>{t.portal.currentPlan}</CardTitle>
                        <CardDescription>{t.portal.membershipDescription}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {loading ? (
                            <div className="space-y-3">
                                <Skeleton className="h-20 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ) : current ? (
                            <>
                                <div className="rounded-xl border p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <div className="text-sm font-medium">
                                                {current.product?.name ?? t.portal.currentPlan}
                                            </div>
                                            <div className="text-muted-foreground text-sm">
                                                {t.portal.startedOn} {formatDateTime(current.startedAt, locale)}
                                            </div>
                                        </div>
                                        <Badge variant="secondary">{current.status}</Badge>
                                    </div>
                                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <div className="text-muted-foreground">{t.portal.endsAt}</div>
                                            <div className="font-medium">{formatDateTime(current.endsAt, locale)}</div>
                                        </div>
                                        <div>
                                            <div className="text-muted-foreground">{t.portal.planCode}</div>
                                            <div className="font-medium">{current.product?.code ?? "-"}</div>
                                        </div>
                                    </div>
                                </div>
                                <Button className="w-full" variant="outline">
                                    {current.product
                                        ? `${t.portal.renewPlan} ${formatCurrency(current.product.price, current.product.currency, locale)}`
                                        : t.portal.renewPlan}
                                </Button>
                            </>
                        ) : (
                            <Empty className="border-border/60 bg-background border">
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <Crown />
                                    </EmptyMedia>
                                    <EmptyTitle>{t.portal.noActiveMembership}</EmptyTitle>
                                    <EmptyContent>
                                        <EmptyDescription>{t.portal.noActiveMembershipDescription}</EmptyDescription>
                                    </EmptyContent>
                                </EmptyHeader>
                            </Empty>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t.portal.subscriptionHistory}</CardTitle>
                        <CardDescription>{t.portal.subscriptionHistoryTitle}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {loading ? (
                            <div className="space-y-3">
                                {Array.from({ length: 3 }).map((_, index) => (
                                    <Skeleton key={index} className="h-16 w-full" />
                                ))}
                            </div>
                        ) : history.length ? (
                            history.map((item) => (
                                <div key={item.id} className="rounded-xl border p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="font-medium">{item.product?.name ?? t.portal.currentPlan}</div>
                                        <Badge variant="outline">{item.status}</Badge>
                                    </div>
                                    <div className="text-muted-foreground mt-2 text-sm">
                                        {formatDateTime(item.startedAt, locale)} {text.between}{" "}
                                        {formatDateTime(item.endsAt, locale)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <Empty className="border-border/60 bg-background border">
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <Crown />
                                    </EmptyMedia>
                                    <EmptyTitle>{t.portal.noHistoryYet}</EmptyTitle>
                                    <EmptyContent>
                                        <EmptyDescription>{t.portal.noHistoryYetDescription}</EmptyDescription>
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
