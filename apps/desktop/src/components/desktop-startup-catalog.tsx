import { useMemo, useState, type ChangeEvent } from "react";
import { ArrowRight, Filter, HardDriveDownload, Search, ShieldCheck, Sparkles, Store } from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@workspace/ui/components/empty";
import { Field, FieldContent, FieldDescription, FieldLabel } from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { Progress } from "@workspace/ui/components/progress";
import { Separator } from "@workspace/ui/components/separator";

import { useDictionary } from "../lib/i18n";
import { pageShell, statGrid } from "./desktop-data";
import { useDesktopPortalData } from "./DesktopPortalDataProvider";

function StartupSurface() {
    const dictionary = useDictionary();
    const { account, license, devices, contentPacks, loading, error } = useDesktopPortalData();
    const [status, setStatus] = useState(() => {
        if (account && license) {
            return "已加载真实账户与授权状态。";
        }

        return "正在等待真实授权或本地会话。";
    });

    const connected = Boolean(account);
    const authorized = Boolean(license && license.status === "active");

    return (
        <div className="space-y-5">
            {pageShell(
                dictionary.pages.startup.title,
                dictionary.pages.startup.summary,
                <>
                    <Badge variant={connected ? "secondary" : "outline"}>
                        <Sparkles className="mr-1 size-3.5" />
                        {connected ? dictionary.shell.webLoginConnected : "等待 Web 授权"}
                    </Badge>
                    <Badge variant={authorized ? "outline" : "secondary"}>
                        <ShieldCheck className="mr-1 size-3.5" />
                        {authorized ? dictionary.shell.desktopAuthValid : "Desktop 授权待接入"}
                    </Badge>
                    <Badge variant="outline">
                        <HardDriveDownload className="mr-1 size-3.5" />
                        {contentPacks.length > 0 ? dictionary.shell.localPackCached : "本地课包待同步"}
                    </Badge>
                </>
            )}

            {error ? (
                <div className="border-destructive/40 bg-destructive/10 text-destructive rounded-xl border px-4 py-3 text-sm">
                    {error}
                </div>
            ) : null}

            {statGrid([
                {
                    label: "验证状态",
                    value: connected ? (authorized ? "已接力" : "待授权") : "未连接",
                    helper: connected ? `账户：${account?.email ?? "-"}` : "Web 登录后会在这里显示真实账号。",
                },
                {
                    label: "本地课包",
                    value: `${contentPacks.length} 个`,
                    helper: contentPacks[0] ? contentPacks[0].title : "从 content-packs 接口加载真实课包摘要。",
                },
                {
                    label: "设备绑定",
                    value: `${devices.length} 台`,
                    helper: license ? `许可证：${license.licenseKey.slice(0, 8)}…` : "许可证信息来自 /auth/me/license。",
                },
            ])}

            <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <Card>
                    <CardHeader>
                        <CardTitle>验证接力</CardTitle>
                        <CardDescription>当前会话、授权和设备态直接来自后端接口。</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3 sm:grid-cols-2">
                        {[
                            ["1", "Web 登录", account ? `已连接 ${account.email}` : "等待 Web 端登录态"],
                            ["2", "授权交换", license ? `许可证 ${license.status}` : "等待 /auth/me/license"],
                            [
                                "3",
                                "设备状态",
                                devices[0] ? `${devices[0].name} · ${devices[0].status}` : "等待 /auth/me/license/devices",
                            ],
                            ["4", "会话生效", loading ? "正在加载真实数据" : "后续操作基于后端真实状态"],
                        ].map(([step, title, body]) => (
                            <div key={title} className="rounded-xl border p-4">
                                <div className="text-primary text-xs tracking-[0.28em] uppercase">步骤 {step}</div>
                                <div className="mt-1 font-medium">{title}</div>
                                <div className="text-muted-foreground mt-1 text-sm">{body}</div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>当前设备</CardTitle>
                        <CardDescription>设备信息和授权状态来自真实 API 数据。</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-xl border p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <div className="text-sm font-medium">{account?.name ?? account?.email ?? "未连接账户"}</div>
                                    <div className="text-muted-foreground text-sm">
                                        {license
                                            ? `${license.status} · ${license.deviceCount}/${license.maxDevices}`
                                            : "等待真实授权"}
                                    </div>
                                </div>
                                <Badge variant={authorized ? "secondary" : "outline"}>{authorized ? "主设备" : "未授权"}</Badge>
                            </div>
                            <div className="text-muted-foreground mt-3 text-sm">{status}</div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant="secondary"
                                onClick={() => setStatus(account ? `当前账号：${account.email}` : "未检测到账号。")}>
                                刷新授权
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setStatus(license ? `许可证：${license.licenseKey}` : "未检测到许可证。")}>
                                重新绑定设备
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setStatus(devices[0] ? `设备：${devices[0].name}` : "未检测到设备。")}>
                                等待 Web 确认
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function CatalogSurface() {
    const dictionary = useDictionary();
    const { courses } = useDesktopPortalData();
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState<"all" | "owned" | "available">("all");

    const filtered = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        return courses.filter((course) => {
            const matchesQuery =
                !normalized ||
                [course.title, course.summary, ...course.tags].some((item) => item.toLowerCase().includes(normalized));
            const matchesFilter = filter === "all" || (filter === "owned" ? course.purchased : !course.purchased);
            return matchesQuery && matchesFilter;
        });
    }, [filter, courses, query]);

    return (
        <div className="space-y-5">
            {pageShell(
                dictionary.pages["pack-selection"].title,
                dictionary.pages["pack-selection"].summary,
                <>
                    <Badge variant="secondary">
                        <Store className="mr-1 size-3.5" />
                        {dictionary.pages["pack-selection"].label}
                    </Badge>
                    <Badge variant="outline">{filtered.length} 个结果</Badge>
                </>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>搜索与筛选</CardTitle>
                    <CardDescription>课程目录现在直接来自后端课程接口。</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
                    <Field>
                        <FieldLabel htmlFor="course-search">搜索课包</FieldLabel>
                        <FieldContent>
                            <div className="relative">
                                <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                                <Input
                                    id="course-search"
                                    aria-label="搜索课包"
                                    value={query}
                                    onChange={(event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
                                    placeholder="按标题、标签或简介搜索"
                                    className="pl-9"
                                />
                            </div>
                            <FieldDescription>输入课程、标签或授权关键词即可筛选真实目录。</FieldDescription>
                        </FieldContent>
                    </Field>
                    <div className="flex flex-wrap gap-2">
                        {(
                            [
                                ["all", "全部"],
                                ["owned", "已拥有"],
                                ["available", "可获取"],
                            ] as const
                        ).map(([value, label]) => (
                            <Button
                                key={value}
                                variant={filter === value ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilter(value)}>
                                <Filter className="size-3.5" />
                                {label}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 xl:grid-cols-3">
                {filtered.map((course) => (
                    <Card key={course.id}>
                        <CardHeader className="gap-3">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <CardTitle className="truncate">{course.title}</CardTitle>
                                    <CardDescription className="line-clamp-2">{course.summary}</CardDescription>
                                </div>
                                <Badge variant={course.purchased ? "secondary" : "outline"}>
                                    {course.purchased ? "已拥有" : course.learnable ? "可学习" : "可获取"}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {course.tags.map((tag) => (
                                    <Badge key={tag} variant="outline">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <div className="text-muted-foreground">难度</div>
                                    <div className="font-medium">{course.difficulty}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">价格</div>
                                    <div className="font-medium">{course.price}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">课时</div>
                                    <div className="font-medium">{course.lessonCount}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">版本</div>
                                    <div className="font-medium">{course.version}</div>
                                </div>
                            </div>
                            <Separator />
                            <Button variant="outline" className="w-full justify-between">
                                查看详情
                                <ArrowRight className="size-4" />
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {!filtered.length ? (
                <Empty className="border-border/60 bg-background border">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Sparkles />
                        </EmptyMedia>
                        <EmptyTitle>暂无匹配课包</EmptyTitle>
                        <EmptyContent>
                            <EmptyDescription>调整搜索词或筛选条件后重新加载真实课程目录。</EmptyDescription>
                        </EmptyContent>
                    </EmptyHeader>
                </Empty>
            ) : null}
        </div>
    );
}

export { CatalogSurface, StartupSurface };
