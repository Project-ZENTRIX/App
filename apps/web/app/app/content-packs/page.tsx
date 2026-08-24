"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, Database, Files, Layers3, ShieldCheck, Sparkles } from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@workspace/ui/components/empty";
import { Separator } from "@workspace/ui/components/separator";
import { cn } from "@workspace/ui/lib/utils";
import { listContentPacks, type ContentPackSummary } from "@/lib/api/endpoints/content-packs-api";
import { useLocale } from "@/lib/i18n";

type Copy = {
    heading: string;
    description: string;
    heroLabel: string;
    snapshotLabel: string;
    fileLabel: string;
    openLabel: string;
    emptyTitle: string;
    emptyDescription: string;
};

const copyByLocale: Record<"zh-CN" | "en-GB", Copy> = {
    "zh-CN": {
        heading: "课包内容",
        description: "Manifest、课程、测验与发布快照都从这里进入。",
        heroLabel: "内容 API",
        snapshotLabel: "快照",
        fileLabel: "文件",
        openLabel: "查看快照",
        emptyTitle: "暂无课包内容",
        emptyDescription: "后端已经准备好接口，但当前没有可展示的课包。",
    },
    "en-GB": {
        heading: "Content packs",
        description: "Manifest, course files, quizzes, and release snapshots all start here.",
        heroLabel: "Content API",
        snapshotLabel: "Snapshots",
        fileLabel: "Files",
        openLabel: "Open snapshot",
        emptyTitle: "No content packs yet",
        emptyDescription: "The backend is ready, but there are no packs to display yet.",
    },
};

function formatDateTime(value: string, locale: string) {
    const date = new Date(value);
    return new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

function ContentPackCard({ item, copy, locale }: { item: ContentPackSummary; copy: Copy; locale: string }) {
    const tone =
        item.currentState === "published" ? "border-emerald-500/25 bg-emerald-500/8" : "border-amber-500/25 bg-amber-500/8";

    return (
        <Card className={cn("overflow-hidden transition-transform duration-200 hover:-translate-y-0.5", tone)}>
            <CardHeader className="gap-3">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <CardTitle className="truncate">{item.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{item.summary}</CardDescription>
                    </div>
                    <Badge variant={item.currentState === "published" ? "secondary" : "outline"}>{item.currentState}</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <div className="text-muted-foreground">{copy.snapshotLabel}</div>
                        <div className="font-medium">{item.snapshotCount}</div>
                    </div>
                    <div>
                        <div className="text-muted-foreground">{copy.fileLabel}</div>
                        <div className="font-medium">{item.fileCount}</div>
                    </div>
                    <div>
                        <div className="text-muted-foreground">Version</div>
                        <div className="font-medium">{item.version}</div>
                    </div>
                    <div>
                        <div className="text-muted-foreground">Language</div>
                        <div className="font-medium">{item.language}</div>
                    </div>
                </div>

                <div className="text-muted-foreground text-xs">{formatDateTime(item.publishedAt, locale)}</div>

                <Separator />

                <Button asChild variant="outline" className="w-full justify-between">
                    <Link href={`/app/content-packs/${item.contentPackCode}`}>
                        {copy.openLabel}
                        <Files className="size-4" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}

export default function ContentPacksPage() {
    const locale = useLocale();
    const copy = copyByLocale[locale as "zh-CN" | "en-GB"] ?? copyByLocale["en-GB"];
    const [items, setItems] = useState<ContentPackSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        const load = async () => {
            try {
                const response = await listContentPacks();
                if (!active) {
                    return;
                }

                setItems(response);
                setError(null);
            } catch (loadError) {
                if (!active) {
                    return;
                }

                setError(loadError instanceof Error ? loadError.message : "Failed to load content packs");
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void load();
        return () => {
            active = false;
        };
    }, []);

    return (
        <section className="flex min-h-full flex-col gap-5">
            <header className="border-border/60 flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 p-5 text-slate-50">
                <div className="min-w-0">
                    <div className="text-xs tracking-[0.28em] text-slate-300 uppercase">{copy.heroLabel}</div>
                    <h1 className="mt-1 text-2xl font-semibold">{copy.heading}</h1>
                    <p className="mt-1 text-sm text-slate-300">{copy.description}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-white/10 text-white">
                        <Database className="mr-1 size-3.5" />
                        API
                    </Badge>
                    <Badge variant="outline" className="border-white/15 text-white">
                        <ShieldCheck className="mr-1 size-3.5" />
                        Supabase S3
                    </Badge>
                </div>
            </header>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <BookOpen className="size-4" />
                            Manifest
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground text-sm">
                        课包入口、版本、目录和发布状态都在 manifest 中定义。
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Layers3 className="size-4" />
                            Structure
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground text-sm">
                        课程、课时、测验与资源都保持文件化，便于客户端直接读取。
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Sparkles className="size-4" />
                            Roles
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground text-sm">
                        学生、教师和管理员通过 API 使用各自的权限边界。
                    </CardContent>
                </Card>
            </div>

            {error ? (
                <div className="border-destructive/40 bg-destructive/10 text-destructive rounded-xl border px-4 py-3 text-sm">
                    {error}
                </div>
            ) : null}

            {loading ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Card key={index} className="animate-pulse">
                            <CardHeader>
                                <div className="bg-muted h-5 w-2/3 rounded" />
                                <div className="bg-muted h-4 w-full rounded" />
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="bg-muted h-24 w-full rounded" />
                                <div className="bg-muted h-9 w-full rounded" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : items.length ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {items.map((item) => (
                        <ContentPackCard key={item.contentPackCode} item={item} copy={copy} locale={locale} />
                    ))}
                </div>
            ) : (
                <Empty className="border-border/60 bg-background border">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Files />
                        </EmptyMedia>
                        <EmptyTitle>{copy.emptyTitle}</EmptyTitle>
                        <EmptyContent>
                            <EmptyDescription>{copy.emptyDescription}</EmptyDescription>
                        </EmptyContent>
                    </EmptyHeader>
                </Empty>
            )}
        </section>
    );
}
