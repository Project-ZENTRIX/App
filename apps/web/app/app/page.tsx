"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    ArrowRight,
    BadgeCheck,
    Clock3,
    Flame,
    History,
    LayoutDashboard,
    ShieldCheck,
    Sparkles,
    TrendingUp,
} from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { getAuditRecords, getCurrentAccount, type AuditRecord, type UserProfile } from "@/lib/api/endpoints/auth-api";
import { useDictionary, useLocale } from "@/lib/i18n";

const quickLinks = [
    { href: "/account/login", labelKey: "loginEntry", icon: LayoutDashboard },
    { href: "/app/settings/profile", labelKey: "profile", icon: BadgeCheck },
    { href: "/app/settings/security", labelKey: "security", icon: ShieldCheck },
    { href: "/app/settings/notifications", labelKey: "notifications", icon: Sparkles },
];

const progressItemsByLocale = {
    "zh-CN": [
        { labelKey: "courseCompletion", value: "68%" },
        { labelKey: "thisWeekActive", value: "5 天" },
        { labelKey: "currentStreak", value: "12 天" },
    ],
    "en-GB": [
        { labelKey: "courseCompletion", value: "68%" },
        { labelKey: "thisWeekActive", value: "5 days" },
        { labelKey: "currentStreak", value: "12 days" },
    ],
} as const;

const achievementItemsByLocale = {
    "zh-CN": [
        { label: "稳定连续", detail: "连续 7 天保持访问", tone: "bg-emerald-500/10 text-emerald-600" },
        { label: "进展迅速", detail: "完成了 3 个核心模块", tone: "bg-sky-500/10 text-sky-600" },
        { label: "安全意识", detail: "已开启会话与通知检查", tone: "bg-amber-500/10 text-amber-600" },
    ],
    "en-GB": [
        { label: "Steady streak", detail: "Kept access for 7 consecutive days", tone: "bg-emerald-500/10 text-emerald-600" },
        { label: "Fast progress", detail: "Completed 3 core modules", tone: "bg-sky-500/10 text-sky-600" },
        { label: "Security aware", detail: "Session and notification checks enabled", tone: "bg-amber-500/10 text-amber-600" },
    ],
} as const;

function formatDateTime(value?: string | null, locale = "en-GB") {
    if (!value) {
        return "-";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

function getUserName(fallbackLabel: string, user?: UserProfile | null) {
    return user?.name?.trim() || user?.email || fallbackLabel;
}

function getInitial(user?: UserProfile | null) {
    const source = user?.name?.trim() || user?.email || "Z";
    return source.charAt(0).toUpperCase();
}

export default function AppIndexPage() {
    const t = useDictionary();
    const locale = useLocale();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [recentActivity, setRecentActivity] = useState<AuditRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        const loadDashboard = async () => {
            try {
                const [account, audit] = await Promise.all([getCurrentAccount(), getAuditRecords()]);
                if (!active) {
                    return;
                }

                setUser(account.user);
                setRecentActivity(audit.records.slice(0, 4));
            } catch (err) {
                if (!active) {
                    return;
                }

                setError(err instanceof Error ? err.message : t.common.dashboardLoadFailed);
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void loadDashboard();

        return () => {
            active = false;
        };
    }, []);

    const summaryItems = useMemo(
        () => [
            { label: t.portal.accountEmail, value: user?.email ?? "-" },
            {
                label: t.portal.profileStatus,
                value: user?.userProfile?.bio ? t.portal.profileComplete : t.portal.profileIncomplete,
            },
            { label: t.portal.lastUpdated, value: formatDateTime(user?.updatedAt, locale) },
        ],
        [
            locale,
            t.portal.accountEmail,
            t.portal.lastUpdated,
            t.portal.profileComplete,
            t.portal.profileIncomplete,
            t.portal.profileStatus,
            user,
        ]
    );

    const achievementItems = achievementItemsByLocale[locale];
    const progressItems = progressItemsByLocale[locale];

    return (
        <section className="flex min-h-full flex-col gap-4">
            <header className="border-border/60 bg-muted/20 flex flex-wrap items-center justify-between gap-4 rounded-xl border p-5">
                <div className="min-w-0">
                    <div className="text-muted-foreground text-xs tracking-wide uppercase">{t.portal.dashboardTitle}</div>
                    <h1 className="mt-1 text-2xl font-semibold">
                        {loading
                            ? t.portal.loadingDashboard
                            : t.portal.welcomeBack.replace("{name}", getUserName(t.common.untitledUser, user))}
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">{t.portal.dashboardDescription}</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium">
                        {getInitial(user)}
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/app/settings/profile">
                            {t.portal.goToCenter}
                            <ArrowRight className="size-4" />
                        </Link>
                    </Button>
                </div>
            </header>

            {error ? (
                <div className="border-destructive/40 bg-destructive/10 text-destructive rounded-xl border px-4 py-3 text-sm">
                    {error}
                </div>
            ) : null}

            <div className="grid gap-4 lg:grid-cols-12">
                <Card className="lg:col-span-5">
                    <CardHeader>
                        <CardTitle>{t.portal.quickAccess}</CardTitle>
                        <CardDescription>{t.portal.quickAccessDescription}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3 sm:grid-cols-2">
                        {quickLinks.map((item) => (
                            <Button key={item.href} asChild variant="outline" className="h-auto justify-start p-4 text-left">
                                <Link href={item.href} className="flex w-full items-center gap-3">
                                    <item.icon className="size-4 shrink-0" />
                                    <span className="flex-1">{t.portal[item.labelKey as keyof typeof t.portal]}</span>
                                </Link>
                            </Button>
                        ))}
                    </CardContent>
                </Card>

                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>{t.portal.progress}</CardTitle>
                        <CardDescription>{t.portal.progressDescription}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {progressItems.map((item) => (
                            <div
                                key={item.labelKey}
                                className="border-border/60 bg-background flex items-center justify-between rounded-lg border px-3 py-2">
                                <span className="text-muted-foreground text-sm">
                                    {t.portal[item.labelKey as keyof typeof t.portal]}
                                </span>
                                <span className="text-sm font-medium">{item.value}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>{t.portal.achievements}</CardTitle>
                        <CardDescription>{t.portal.achievementsDescription}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {achievementItems.map((item) => (
                            <div key={item.label} className="border-border/60 bg-background rounded-lg border p-3">
                                <div className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${item.tone}`}>
                                    {item.label}
                                </div>
                                <div className="text-muted-foreground mt-2 text-sm">{item.detail}</div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-12">
                <Card className="lg:col-span-7">
                    <CardHeader>
                        <CardTitle>{t.portal.recentActivity}</CardTitle>
                        <CardDescription>{t.portal.recentActivityDescription}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {recentActivity.length ? (
                            recentActivity.map((record) => (
                                <div key={record.id} className="border-border/60 bg-background rounded-lg border p-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <History className="text-muted-foreground size-4" />
                                            {record.action}
                                        </div>
                                        <span className="text-muted-foreground text-xs">
                                            {formatDateTime(record.createdAt, locale)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-muted-foreground flex items-center gap-2 rounded-lg border border-dashed p-4 text-sm">
                                <Clock3 className="size-4" />
                                {t.portal.noRecentActivity}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="lg:col-span-5">
                    <CardHeader>
                        <CardTitle>{t.portal.account}</CardTitle>
                        <CardDescription>{t.portal.accountDescription}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {summaryItems.map((item) => (
                            <div key={item.label} className="border-border/60 bg-background rounded-lg border p-3">
                                <div className="text-muted-foreground text-xs tracking-wide uppercase">{item.label}</div>
                                <div className="mt-1 text-sm font-medium">{item.value}</div>
                            </div>
                        ))}
                        <Button asChild variant="secondary" className="w-full">
                            <Link href="/app/settings/security">
                                <TrendingUp className="size-4" />
                                {t.portal.security}
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/app/settings/notifications">
                                <Flame className="size-4" />
                                {t.portal.notifications}
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
