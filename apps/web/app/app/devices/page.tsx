"use client";

import { useEffect, useState } from "react";
import { MonitorSmartphone } from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@workspace/ui/components/empty";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Separator } from "@workspace/ui/components/separator";
import { getLicenseOverview, listDevices } from "@/lib/api/endpoints/license-api";
import { formatDateTime } from "@/lib/format";
import { useDictionary, useLocale } from "@/lib/i18n";

export default function DevicesPage() {
    const t = useDictionary();
    const locale = useLocale();
    const [deviceCount, setDeviceCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [devices, setDevices] = useState<
        Array<{ id: string; name: string; platform: string; bindingCount: number; createdAt: string }>
    >([]);

    useEffect(() => {
        let active = true;

        const loadDevices = async () => {
            try {
                const [license, result] = await Promise.all([getLicenseOverview(), listDevices()]);
                if (!active) {
                    return;
                }

                setDeviceCount(license.license?.deviceCount ?? 0);
                setDevices(result.devices);
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void loadDevices();
        return () => {
            active = false;
        };
    }, []);

    return (
        <section className="flex flex-col gap-5">
            <header className="border-border/60 bg-muted/20 rounded-2xl border p-5">
                <div className="text-muted-foreground text-xs tracking-[0.28em] uppercase">{t.portal.devicesTitle}</div>
                <h1 className="mt-1 text-2xl font-semibold">{t.portal.devicesTitle}</h1>
                <p className="text-muted-foreground mt-1 text-sm">{t.portal.devicesDescription}</p>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>{t.portal.licenseSummary}</CardTitle>
                    <CardDescription>{t.portal.devicesDescription}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-3">
                        <div className="rounded-xl border p-4">
                            <div className="text-muted-foreground text-sm">{t.portal.boundDevices}</div>
                            <div className="mt-1 text-2xl font-semibold">{deviceCount}</div>
                        </div>
                        <div className="rounded-xl border p-4">
                            <div className="text-muted-foreground text-sm">{t.portal.bindingStatus}</div>
                            <div className="mt-1 text-2xl font-semibold">{t.portal.active}</div>
                        </div>
                        <div className="rounded-xl border p-4">
                            <div className="text-muted-foreground text-sm">{t.portal.lastRefresh}</div>
                            <div className="mt-1 text-2xl font-semibold">{t.common.now}</div>
                        </div>
                    </div>
                    <Separator />
                    <Button variant="outline">{t.portal.reloadDevices}</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t.portal.registeredDevices}</CardTitle>
                    <CardDescription>{t.portal.devicesDescription}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {loading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <Skeleton key={index} className="h-20 w-full" />
                            ))}
                        </div>
                    ) : devices.length ? (
                        devices.map((device) => (
                            <div key={device.id} className="rounded-xl border p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="font-medium">{device.name}</div>
                                        <div className="text-muted-foreground text-sm">{device.platform}</div>
                                    </div>
                                    <Badge variant="outline">
                                        {device.bindingCount} {t.portal.boundDevices}
                                    </Badge>
                                </div>
                                <div className="text-muted-foreground mt-2 text-sm">
                                    {t.portal.created} {formatDateTime(device.createdAt, locale)}
                                </div>
                            </div>
                        ))
                    ) : (
                        <Empty className="border-border/60 bg-background border">
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <MonitorSmartphone />
                                </EmptyMedia>
                                <EmptyTitle>{t.portal.noDevicesLinked}</EmptyTitle>
                                <EmptyContent>
                                    <EmptyDescription>{t.portal.noDevicesLinked}</EmptyDescription>
                                </EmptyContent>
                            </EmptyHeader>
                        </Empty>
                    )}
                </CardContent>
            </Card>
        </section>
    );
}
