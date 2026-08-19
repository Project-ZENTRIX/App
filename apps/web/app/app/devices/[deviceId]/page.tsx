"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowRight, MonitorSmartphone, RefreshCcw } from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@workspace/ui/components/empty";
import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
    bindDevice,
    generateBindingCode,
    getDevice,
    unbindDevice,
    type DeviceItem,
} from "@/lib/api/endpoints/license-api";
import { formatDateTime } from "@/lib/format";
import { useLocale } from "@/lib/i18n";

const copy = {
    "zh-CN": {
        title: "设备详情",
        description: "查看设备、绑定记录和授权操作。",
        details: "设备信息",
        bindings: "绑定记录",
        generateCode: "生成绑定码",
        bindDevice: "绑定设备",
        unbind: "解绑",
        bindingCode: "绑定码",
        slot: "设备槽位",
        fingerprint: "设备指纹",
        generated: "已生成绑定码",
        refresh: "刷新",
        back: "返回设备列表",
        noDevice: "未找到设备",
        noBindings: "暂无绑定记录",
        bindingPending: "绑定中...",
        unbindingPending: "解绑中...",
    },
    "en-GB": {
        title: "Device detail",
        description: "Review the device, binding history, and authorization actions.",
        details: "Device info",
        bindings: "Binding history",
        generateCode: "Generate binding code",
        bindDevice: "Bind device",
        unbind: "Unbind",
        bindingCode: "Binding code",
        slot: "Device slot",
        fingerprint: "Device fingerprint",
        generated: "Binding code generated",
        refresh: "Refresh",
        back: "Back to devices",
        noDevice: "Device not found",
        noBindings: "No binding records",
        bindingPending: "Binding...",
        unbindingPending: "Unbinding...",
    },
} as const;

export default function DeviceDetailPage() {
    const locale = useLocale();
    const text = copy[locale];
    const params = useParams<{ deviceId: string }>();
    const deviceId = params.deviceId;
    const [device, setDevice] = useState<DeviceItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [bindingCode, setBindingCode] = useState("");
    const [slot, setSlot] = useState("1");
    const [fingerprint, setFingerprint] = useState("");
    const [generatedCode, setGeneratedCode] = useState<string | null>(null);
    const [pending, setPending] = useState<"bind" | string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const loadDevice = async () => {
        setLoading(true);
        try {
            const response = await getDevice(deviceId);
            setDevice(response.device);
            setError(null);
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : locale === "zh-CN" ? "无法加载设备详情" : "Unable to load device detail");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void loadDevice();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deviceId, locale]);

    const handleGenerateCode = async () => {
        if (!device) {
            return;
        }

        setPending("generate");
        try {
            const result = await generateBindingCode(device.id);
            setGeneratedCode(result.bindingCode);
            setBindingCode(result.bindingCode);
            setError(null);
        } catch (generateError) {
            setError(generateError instanceof Error ? generateError.message : locale === "zh-CN" ? "无法生成绑定码" : "Unable to generate binding code");
        } finally {
            setPending(null);
        }
    };

    const handleBind = async () => {
        if (!device || !bindingCode.trim()) {
            return;
        }

        setPending("bind");
        try {
            await bindDevice({
                deviceId: device.id,
                bindingCode: bindingCode.trim(),
                deviceFingerprint: fingerprint.trim() || null,
                deviceSlot: Number.parseInt(slot, 10) || 1,
                isPrimary: false,
            });
            setBindingCode("");
            setFingerprint("");
            setGeneratedCode(null);
            await loadDevice();
        } catch (bindError) {
            setError(bindError instanceof Error ? bindError.message : locale === "zh-CN" ? "无法绑定设备" : "Unable to bind device");
        } finally {
            setPending(null);
        }
    };

    const handleUnbind = async (bindingId: string) => {
        setPending(bindingId);
        try {
            await unbindDevice(bindingId);
            await loadDevice();
        } catch (unbindError) {
            setError(unbindError instanceof Error ? unbindError.message : locale === "zh-CN" ? "无法解绑设备" : "Unable to unbind device");
        } finally {
            setPending(null);
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

    if (!device) {
        return (
            <Empty className="border-border/60 bg-background border">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <MonitorSmartphone />
                    </EmptyMedia>
                    <EmptyTitle>{text.noDevice}</EmptyTitle>
                    <EmptyContent>
                        <EmptyDescription>{locale === "zh-CN" ? "该设备不存在或已被移除。" : "This device is unavailable or has been removed."}</EmptyDescription>
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
                    <h1 className="mt-1 text-2xl font-semibold">{device.name}</h1>
                    <p className="text-muted-foreground mt-1 text-sm">{text.description}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{device.platform}</Badge>
                    <Badge variant="secondary">{device.bindingCount}</Badge>
                </div>
            </header>

            <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                <Card>
                    <CardHeader>
                        <CardTitle>{text.details}</CardTitle>
                        <CardDescription>{locale === "zh-CN" ? "设备基本信息和最近更新时间。" : "Basic device metadata and the latest timestamps."}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="rounded-xl border p-4">
                            <div className="text-muted-foreground text-sm">Device ID</div>
                            <div className="mt-1 font-medium">{device.id}</div>
                        </div>
                        <div className="rounded-xl border p-4">
                            <div className="text-muted-foreground text-sm">{locale === "zh-CN" ? "创建时间" : "Created at"}</div>
                            <div className="mt-1 font-medium">{formatDateTime(device.createdAt, locale)}</div>
                        </div>
                        <div className="rounded-xl border p-4">
                            <div className="text-muted-foreground text-sm">{locale === "zh-CN" ? "最近更新时间" : "Updated at"}</div>
                            <div className="mt-1 font-medium">{formatDateTime(device.updatedAt, locale)}</div>
                        </div>
                        <Button asChild variant="outline" className="w-full justify-between">
                            <Link href="/app/devices">
                                {text.back}
                                <ArrowRight />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{text.bindings}</CardTitle>
                        <CardDescription>{locale === "zh-CN" ? "生成绑定码并查看历史绑定。" : "Generate a binding code and review the binding history."}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="binding-code">{text.bindingCode}</FieldLabel>
                                    <Input id="binding-code" value={bindingCode} onChange={(event) => setBindingCode(event.target.value)} />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="slot">{text.slot}</FieldLabel>
                                    <Input id="slot" inputMode="numeric" value={slot} onChange={(event) => setSlot(event.target.value)} />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="fingerprint">{text.fingerprint}</FieldLabel>
                                    <Input id="fingerprint" value={fingerprint} onChange={(event) => setFingerprint(event.target.value)} />
                                </Field>
                            </FieldGroup>
                            <Button type="button" variant="secondary" onClick={handleGenerateCode} disabled={pending === "generate"}>
                                <RefreshCcw />
                                {pending === "generate" ? text.refresh : text.generateCode}
                            </Button>
                        </div>
                        {generatedCode ? <div className="rounded-xl border bg-muted/20 p-3 text-sm">{text.generated}: {generatedCode}</div> : null}
                        <Button type="button" className="w-full justify-between" onClick={handleBind} disabled={pending === "bind" || !bindingCode.trim()}>
                            {pending === "bind" ? text.bindingPending : text.bindDevice}
                            <ArrowRight />
                        </Button>
                        <div className="space-y-3">
                            {device.bindings.length ? (
                                device.bindings.map((binding) => (
                                    <div key={binding.id} className="rounded-xl border p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <div className="font-medium">{binding.bindingKey}</div>
                                                <div className="text-muted-foreground text-sm">{formatDateTime(binding.boundAt, locale)}</div>
                                            </div>
                                            <Badge variant={binding.revokedAt ? "outline" : "secondary"}>{binding.revokedAt ? "revoked" : "active"}</Badge>
                                        </div>
                                        <div className="mt-3 flex items-center justify-between gap-3">
                                            <div className="text-muted-foreground text-sm">
                                                {binding.desktopLicense?.licenseKey ?? "-"}
                                            </div>
                                            {!binding.revokedAt ? (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleUnbind(binding.id)}
                                                    disabled={pending === binding.id}>
                                                    {pending === binding.id ? text.unbindingPending : text.unbind}
                                                </Button>
                                            ) : null}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <Empty className="border-border/60 bg-background border">
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <MonitorSmartphone />
                                        </EmptyMedia>
                                        <EmptyTitle>{text.noBindings}</EmptyTitle>
                                        <EmptyContent>
                                            <EmptyDescription>{locale === "zh-CN" ? "该设备还没有绑定记录。" : "This device has not been bound yet."}</EmptyDescription>
                                        </EmptyContent>
                                    </EmptyHeader>
                                </Empty>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
