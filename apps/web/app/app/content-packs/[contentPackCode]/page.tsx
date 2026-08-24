"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, FileText, FolderOpen, Layers3, ShieldCheck, Sparkles } from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@workspace/ui/components/empty";
import { Separator } from "@workspace/ui/components/separator";
import { cn } from "@workspace/ui/lib/utils";
import {
    getContentPack,
    getContentPackFiles,
    getContentPackIndex,
    getContentPackManifest,
    getContentPackRoles,
    getContentPackStorage,
    type ContentPackDetail,
    type ContentPackFile,
    type ContentPackIndex,
    type ContentPackManifest,
    type ContentPackRolePlanItem,
    type ContentPackState,
} from "@/lib/api/endpoints/content-packs-api";
import { useLocale } from "@/lib/i18n";

const localeCopy = {
    "zh-CN": {
        title: "课包快照",
        description: "查看 Manifest、文件、索引和三角色计划。",
        back: "返回课包列表",
        published: "发布态",
        authoring: "编辑态",
        manifest: "Manifest",
        index: "索引",
        files: "文件",
        roles: "角色计划",
        storage: "Storage",
        missingTitle: "未找到课包",
        missingDescription: "当前内容包不存在，或暂时不可见。",
        openManifest: "查看 Manifest",
        openIndex: "查看索引",
    },
    "en-GB": {
        title: "Content pack snapshot",
        description: "Inspect the manifest, files, index, and three-role plan.",
        back: "Back to content packs",
        published: "Published",
        authoring: "Authoring",
        manifest: "Manifest",
        index: "Index",
        files: "Files",
        roles: "Role plan",
        storage: "Storage",
        missingTitle: "Content pack not found",
        missingDescription: "The requested pack is unavailable or not visible yet.",
        openManifest: "Open manifest",
        openIndex: "Open index",
    },
} as const;

type LocaleCopy = (typeof localeCopy)[keyof typeof localeCopy];

function formatDateTime(value: string, locale: string) {
    return new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

function renderFileType(type: ContentPackFile["type"]) {
    return type.toUpperCase();
}

function StateBadge({ state }: { state: ContentPackState }) {
    return (
        <Badge
            variant={state === "published" ? "secondary" : "outline"}
            className={state === "published" ? "" : "border-amber-500/30"}>
            {state}
        </Badge>
    );
}

function DetailPanel({ detail, copy, locale }: { detail: ContentPackDetail; copy: LocaleCopy; locale: string }) {
    const [state, setState] = useState<ContentPackState>(detail.currentState);
    const [manifest, setManifest] = useState<ContentPackManifest>(detail.manifest);
    const [index, setIndex] = useState<ContentPackIndex>(detail.index);
    const [files, setFiles] = useState<ContentPackFile[]>(detail.files);
    const [roles, setRoles] = useState<ContentPackRolePlanItem[]>(detail.rolePlan);
    const [storage, setStorage] = useState(detail.storage);

    useEffect(() => {
        let active = true;

        const loadSnapshot = async () => {
            const [manifestResponse, indexResponse, filesResponse, roleResponse, storageResponse] = await Promise.all([
                getContentPackManifest(detail.contentPackCode, state),
                getContentPackIndex(detail.contentPackCode, state),
                getContentPackFiles(detail.contentPackCode, state),
                getContentPackRoles(detail.contentPackCode),
                getContentPackStorage(detail.contentPackCode),
            ]);

            if (!active) {
                return;
            }

            if (manifestResponse) {
                setManifest(manifestResponse);
            }
            if (indexResponse) {
                setIndex(indexResponse);
            }
            setFiles(filesResponse);
            setRoles(roleResponse);
            if (storageResponse) {
                setStorage(storageResponse);
            }
        };

        void loadSnapshot();

        return () => {
            active = false;
        };
    }, [detail.contentPackCode, state]);

    const snapshotItems = useMemo(
        () => [
            { label: copy.manifest, value: manifest.manifestVersion },
            { label: copy.index, value: index.indexVersion },
            { label: copy.files, value: String(files.length) },
            { label: copy.roles, value: String(roles.length) },
        ],
        [
            copy.files,
            copy.index,
            copy.manifest,
            copy.roles,
            files.length,
            index.indexVersion,
            manifest.manifestVersion,
            roles.length,
        ]
    );

    return (
        <div className="grid gap-5">
            <header className="border-border/60 bg-muted/20 flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5">
                <div className="min-w-0">
                    <div className="text-muted-foreground text-xs tracking-[0.28em] uppercase">{copy.title}</div>
                    <h1 className="mt-1 text-2xl font-semibold">{manifest.title}</h1>
                    <p className="text-muted-foreground mt-1 text-sm">{manifest.summary}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant={state === "published" ? "default" : "outline"}
                        onClick={() => setState("published")}>
                        {copy.published}
                    </Button>
                    <Button
                        type="button"
                        variant={state === "authoring" ? "default" : "outline"}
                        onClick={() => setState("authoring")}>
                        {copy.authoring}
                    </Button>
                </div>
            </header>

            <div className="grid gap-4 md:grid-cols-4">
                {snapshotItems.map((item) => (
                    <Card key={item.label}>
                        <CardHeader className="pb-3">
                            <CardDescription>{item.label}</CardDescription>
                            <CardTitle>{item.value}</CardTitle>
                        </CardHeader>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Layers3 className="size-4" />
                            {copy.manifest}
                        </CardTitle>
                        <CardDescription>{manifest.indexRef}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-3 md:grid-cols-2">
                            <div className="rounded-lg border p-3">
                                <div className="text-muted-foreground text-xs uppercase">Version</div>
                                <div className="mt-1 font-medium">{manifest.version}</div>
                            </div>
                            <div className="rounded-lg border p-3">
                                <div className="text-muted-foreground text-xs uppercase">State</div>
                                <div className="mt-1">
                                    <StateBadge state={manifest.packState} />
                                </div>
                            </div>
                            <div className="rounded-lg border p-3">
                                <div className="text-muted-foreground text-xs uppercase">Language</div>
                                <div className="mt-1 font-medium">{manifest.language}</div>
                            </div>
                            <div className="rounded-lg border p-3">
                                <div className="text-muted-foreground text-xs uppercase">Published at</div>
                                <div className="mt-1 font-medium">
                                    {formatDateTime(manifest.publishing.publishedAt ?? detail.publishedAt, locale)}
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="grid gap-3 md:grid-cols-2">
                            <div className="rounded-lg border p-3">
                                <div className="text-muted-foreground text-xs uppercase">Audience</div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {(manifest.audience ?? ["Shared pack"]).map((item) => (
                                        <Badge key={item} variant="outline">
                                            {item}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <div className="rounded-lg border p-3">
                                <div className="text-muted-foreground text-xs uppercase">Goals</div>
                                <div className="mt-2 space-y-2 text-sm">
                                    {(manifest.learningGoals ?? ["Stable content file structure"]).map((item) => (
                                        <div key={item} className="flex items-start gap-2">
                                            <Sparkles className="mt-0.5 size-3.5 shrink-0" />
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="size-4" />
                            {copy.storage}
                        </CardTitle>
                        <CardDescription>{storage.bucket}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="rounded-lg border p-3">
                            <div className="text-muted-foreground text-xs uppercase">S3 endpoint</div>
                            <div className="mt-1 font-medium break-all">{storage.s3Endpoint}</div>
                        </div>
                        <div className="rounded-lg border p-3">
                            <div className="text-muted-foreground text-xs uppercase">Bucket</div>
                            <div className="mt-1 font-medium">{storage.bucket}</div>
                        </div>
                        <div className="rounded-lg border p-3">
                            <div className="text-muted-foreground text-xs uppercase">Region</div>
                            <div className="mt-1 font-medium">{storage.region}</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FolderOpen className="size-4" />
                            {copy.index}
                        </CardTitle>
                        <CardDescription>{index.generatedAt}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {index.items.map((item) => (
                            <div key={item.id} className="rounded-lg border p-3">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="font-medium">{item.title}</div>
                                    <Badge variant="outline">{item.type}</Badge>
                                </div>
                                <div className="text-muted-foreground mt-1 text-xs break-all">{item.path}</div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="size-4" />
                            {copy.files}
                        </CardTitle>
                        <CardDescription>{state}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {files.map((item) => (
                            <div key={item.id} className="rounded-lg border p-3">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="font-medium">{item.title}</div>
                                    <Badge variant="outline">{renderFileType(item.type)}</Badge>
                                </div>
                                <div className="text-muted-foreground mt-1 text-xs break-all">{item.storageKey}</div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="size-4" />
                        {copy.roles}
                    </CardTitle>
                    <CardDescription>Student, teacher, and admin preview.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                    {roles.map((role) => (
                        <div key={role.role} className="rounded-lg border p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div className="font-medium capitalize">{role.role}</div>
                                <Badge variant="secondary">{role.permissions.length}</Badge>
                            </div>
                            <div className="text-muted-foreground mt-2 text-sm">{role.description}</div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {role.permissions.map((permission) => (
                                    <Badge key={permission} variant="outline">
                                        {permission}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

export default function ContentPackDetailPage() {
    const locale = useLocale();
    const copy = localeCopy[locale as "zh-CN" | "en-GB"] ?? localeCopy["en-GB"];
    const params = useParams<{ contentPackCode: string }>();
    const contentPackCode = Array.isArray(params.contentPackCode) ? params.contentPackCode[0] : (params.contentPackCode ?? "");
    const [detail, setDetail] = useState<ContentPackDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        const load = async () => {
            if (!contentPackCode) {
                setDetail(null);
                setError(copy.missingDescription);
                setLoading(false);
                return;
            }

            try {
                const response = await getContentPack(contentPackCode);
                if (!active) {
                    return;
                }

                setDetail(response);
                setError(null);
            } catch (loadError) {
                if (!active) {
                    return;
                }

                setError(loadError instanceof Error ? loadError.message : "Failed to load content pack");
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
    }, [contentPackCode, copy.missingDescription]);

    return (
        <section className="flex min-h-full flex-col gap-5">
            <Button asChild variant="ghost" className="w-fit px-0">
                <Link href="/app/content-packs">
                    <ArrowLeft className="size-4" />
                    {copy.back}
                </Link>
            </Button>

            {error ? (
                <div className="border-destructive/40 bg-destructive/10 text-destructive rounded-xl border px-4 py-3 text-sm">
                    {error}
                </div>
            ) : null}

            {loading ? (
                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <div className="bg-muted h-8 w-1/3 rounded" />
                            <div className="bg-muted h-4 w-2/3 rounded" />
                            <div className="bg-muted h-64 w-full rounded" />
                        </div>
                    </CardContent>
                </Card>
            ) : detail ? (
                <DetailPanel detail={detail} copy={copy} locale={locale} />
            ) : (
                <Empty className="border-border/60 bg-background border">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <FileText />
                        </EmptyMedia>
                        <EmptyTitle>{copy.missingTitle}</EmptyTitle>
                        <EmptyContent>
                            <EmptyDescription>{copy.missingDescription}</EmptyDescription>
                        </EmptyContent>
                    </EmptyHeader>
                </Empty>
            )}
        </section>
    );
}
