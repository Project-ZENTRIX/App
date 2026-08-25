import { useState } from "react";
import {
    ArrowRight,
    CircleCheckBig,
    FileCode2,
    Files,
    History as HistoryIcon,
    RefreshCcw,
    Settings,
    ShieldCheck,
    Sparkles,
    SquarePen,
    Table2,
    TerminalSquare,
    Trophy,
    Unlock,
    UserRound,
} from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@workspace/ui/components/empty";
import { Field, FieldContent, FieldDescription, FieldLabel } from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { Progress } from "@workspace/ui/components/progress";
import { Separator } from "@workspace/ui/components/separator";
import { Switch } from "@workspace/ui/components/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";

import { useDictionary } from "../lib/i18n";
import { pageShell } from "./desktop-data";
import { useDesktopPortalData } from "./DesktopPortalDataProvider";

export function LessonDetailsSurface() {
    const dictionary = useDictionary();
    const { courses, progressEvents, loading } = useDesktopPortalData();

    return (
        <div className="space-y-5">
            {pageShell(
                dictionary.pages["lesson-details"].title,
                dictionary.pages["lesson-details"].summary,
                <>
                    <Badge variant="secondary">
                        <Files className="mr-1 size-3.5" />
                        真实进度
                    </Badge>
                    <Badge variant="outline">{progressEvents.length} 条事件</Badge>
                </>
            )}

            <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
                <Card>
                    <CardHeader>
                        <CardTitle>课程与学习节点</CardTitle>
                        <CardDescription>按实际课程与进度记录展示学习节点。</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {courses.slice(0, 3).map((course) => (
                            <div key={course.id} className="rounded-xl border p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="font-medium">{course.title}</div>
                                        <div className="text-muted-foreground text-sm">{course.summary}</div>
                                    </div>
                                    <Badge variant={course.purchased ? "secondary" : "outline"}>
                                        {course.purchased ? "已拥有" : "可获取"}
                                    </Badge>
                                </div>
                                <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                                    <div>
                                        <div className="text-muted-foreground">难度</div>
                                        <div className="font-medium">{course.difficulty}</div>
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
                            </div>
                        ))}
                        {loading ? <div className="text-muted-foreground text-sm">正在加载真实课程与进度数据。</div> : null}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>最近事件</CardTitle>
                        <CardDescription>来自 /progress/overview 的真实事件摘要。</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {progressEvents.length ? (
                            progressEvents.map((event) => (
                                <div
                                    key={event.label + event.detail}
                                    className="flex items-center justify-between gap-3 rounded-xl border p-3">
                                    <div>
                                        <div className="font-medium">{event.label}</div>
                                        <div className="text-muted-foreground text-sm">{event.detail}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <Empty className="border-border/60 bg-background border">
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <Sparkles />
                                    </EmptyMedia>
                                    <EmptyTitle>暂无进度事件</EmptyTitle>
                                    <EmptyContent>
                                        <EmptyDescription>等待后端返回真实学习进度。</EmptyDescription>
                                    </EmptyContent>
                                </EmptyHeader>
                            </Empty>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function WorkspaceSurface() {
    const dictionary = useDictionary();
    const { courses, runs, progressEvents, progress, loading } = useDesktopPortalData();
    const currentCourse = courses[0] ?? null;

    return (
        <div className="space-y-5">
            {pageShell(
                dictionary.pages.workspace.title,
                dictionary.pages.workspace.summary,
                <>
                    <Badge variant="secondary">
                        <TerminalSquare className="mr-1 size-3.5" />
                        真实运行
                    </Badge>
                    <Badge variant="outline">后端连接</Badge>
                </>
            )}

            <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                <Card>
                    <CardHeader>
                        <CardTitle>编辑器</CardTitle>
                        <CardDescription>当前以真实课程和进度状态作为工作台上下文。</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)]">
                            <div className="rounded-xl border p-3">
                                <div className="text-muted-foreground mb-2 text-xs tracking-[0.28em] uppercase">课程目录</div>
                                <div className="space-y-2 text-sm">
                                    {courses.slice(0, 4).map((course) => (
                                        <div
                                            key={course.id}
                                            className="bg-muted/30 flex items-center gap-2 rounded-lg px-2 py-2">
                                            <FileCode2 className="text-muted-foreground size-4" />
                                            <span className="truncate">{course.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-xl border p-3">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="font-medium">{currentCourse?.title ?? "等待课程数据"}</div>
                                        <div className="text-muted-foreground text-sm">
                                            {currentCourse?.summary ?? "正在加载后端真实课程信息"}
                                        </div>
                                    </div>
                                    <Badge variant="outline">{currentCourse?.version ?? "-"}</Badge>
                                </div>
                                <pre className="bg-muted/40 mt-3 overflow-x-auto rounded-lg p-4 text-xs leading-6">
                                    {currentCourse
                                        ? `courseId: ${currentCourse.id}\nlessonCount: ${currentCourse.lessonCount}\noffline: ${currentCourse.offline}`
                                        : "等待真实课程数据..."}
                                </pre>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button>
                                <Sparkles className="size-4" />
                                同步课程
                            </Button>
                            <Button variant="outline">
                                <SquarePen className="size-4" />
                                提交结果
                            </Button>
                            <Button variant="ghost">
                                <TerminalSquare className="size-4" />
                                打开终端
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>运行与反馈</CardTitle>
                        <CardDescription>运行日志、提交结果和真实运行记录。</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="log">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="log">日志</TabsTrigger>
                                <TabsTrigger value="result">结果</TabsTrigger>
                                <TabsTrigger value="queue">队列</TabsTrigger>
                            </TabsList>
                            <TabsContent value="log" className="mt-4 space-y-3">
                                {runs.length ? (
                                    runs.map((item) => (
                                        <div key={item.name + item.time} className="rounded-xl border p-3">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="font-medium">{item.name}</div>
                                                <Badge variant={item.result === "completed" ? "secondary" : "outline"}>
                                                    {item.result}
                                                </Badge>
                                            </div>
                                            <div className="text-muted-foreground mt-1 text-sm">{item.time}</div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-muted-foreground text-sm">暂无真实运行记录。</div>
                                )}
                            </TabsContent>
                            <TabsContent value="result" className="mt-4 space-y-3">
                                <div className="rounded-xl border p-4">
                                    <div className="flex items-center gap-2 font-medium">
                                        <Trophy className="size-4" />
                                        最新进度
                                    </div>
                                    <div className="text-muted-foreground mt-1 text-sm">
                                        {progress
                                            ? `${Math.round(progress.lessonProgress.completionRate * 100)}% 已完成 · ${progress.lessonProgress.completedLessons}/${progress.lessonProgress.totalLessons}`
                                            : "等待后端进度统计"}
                                    </div>
                                </div>
                                <div className="rounded-xl border p-4">
                                    <div className="flex items-center gap-2 font-medium">
                                        <Table2 className="size-4" />
                                        学习事件
                                    </div>
                                    <div className="text-muted-foreground mt-1 text-sm">
                                        {progressEvents[0]?.detail ?? "暂无最新学习事件"}
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="queue" className="mt-4 space-y-3">
                                <div className="rounded-xl border p-4">
                                    <div className="font-medium">待同步状态</div>
                                    <div className="text-muted-foreground mt-1 text-sm">
                                        离线队列由真实 API 返回的数据驱动，不再使用本地演示列表。
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function RecordsSurface() {
    const dictionary = useDictionary();
    const { progress, runs, memberships, orders } = useDesktopPortalData();

    return (
        <div className="space-y-5">
            {pageShell(
                dictionary.pages["runs-and-submissions"].title,
                dictionary.pages["runs-and-submissions"].summary,
                <>
                    <Badge variant="secondary">
                        <HistoryIcon className="mr-1 size-3.5" />
                        记录中心
                    </Badge>
                    <Badge variant="outline">真实 API</Badge>
                </>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>记录分栏</CardTitle>
                    <CardDescription>真实的进度、运行、会员和订单记录。</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="progress">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="progress">进度</TabsTrigger>
                            <TabsTrigger value="runs">运行</TabsTrigger>
                            <TabsTrigger value="membership">会员</TabsTrigger>
                            <TabsTrigger value="orders">订单</TabsTrigger>
                        </TabsList>

                        <TabsContent value="progress" className="mt-4 space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                <Card size="sm">
                                    <CardContent className="pt-4">
                                        <div className="text-muted-foreground text-sm">完成率</div>
                                        <div className="text-2xl font-semibold">
                                            {progress ? `${Math.round(progress.lessonProgress.completionRate * 100)}%` : "-"}
                                        </div>
                                        <Progress
                                            className="mt-3"
                                            value={progress ? progress.lessonProgress.completionRate * 100 : 0}
                                        />
                                    </CardContent>
                                </Card>
                                <Card size="sm">
                                    <CardContent className="pt-4">
                                        <div className="text-muted-foreground text-sm">连续记录</div>
                                        <div className="text-2xl font-semibold">
                                            {progress ? progress.lessonProgress.completedLessons : 0}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card size="sm">
                                    <CardContent className="pt-4">
                                        <div className="text-muted-foreground text-sm">关联课包</div>
                                        <div className="text-2xl font-semibold">
                                            {progress ? progress.enrollments.length : 0}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="space-y-3">
                                {progress?.recentEvents.map((item) => (
                                    <div key={item.id} className="flex items-start gap-3 rounded-xl border p-4">
                                        <div className="bg-muted rounded-lg p-2">
                                            <CircleCheckBig className="size-4" />
                                        </div>
                                        <div>
                                            <div className="font-medium">{item.eventType}</div>
                                            <div className="text-muted-foreground text-sm">
                                                {typeof item.payload === "object"
                                                    ? JSON.stringify(item.payload)
                                                    : item.createdAt}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="runs" className="mt-4 space-y-3">
                            {runs.map((item) => (
                                <div key={item.name + item.time} className="rounded-xl border p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="font-medium">{item.name}</div>
                                        <Badge variant={item.result === "completed" ? "secondary" : "outline"}>
                                            {item.result}
                                        </Badge>
                                    </div>
                                    <div className="text-muted-foreground mt-1 text-sm">{item.time}</div>
                                </div>
                            ))}
                        </TabsContent>

                        <TabsContent value="membership" className="mt-4 space-y-3">
                            {memberships.map((item) => (
                                <div key={item.plan} className="rounded-xl border p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <div className="font-medium">{item.plan}</div>
                                            <div className="text-muted-foreground text-sm">{item.period}</div>
                                        </div>
                                        <Badge variant="secondary">{item.status}</Badge>
                                    </div>
                                </div>
                            ))}
                        </TabsContent>

                        <TabsContent value="orders" className="mt-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>订单号</TableHead>
                                        <TableHead>状态</TableHead>
                                        <TableHead>金额</TableHead>
                                        <TableHead>创建时间</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.map((order) => (
                                        <TableRow key={order.orderNo}>
                                            <TableCell className="font-medium">{order.orderNo}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{order.status}</Badge>
                                            </TableCell>
                                            <TableCell>{order.total}</TableCell>
                                            <TableCell>{order.createdAt}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}

function SyncCacheSurface() {
    const dictionary = useDictionary();
    const { devices, contentPacks } = useDesktopPortalData();

    return (
        <div className="space-y-5">
            {pageShell(
                dictionary.pages["sync-cache"].title,
                dictionary.pages["sync-cache"].summary,
                <>
                    <Badge variant="secondary">
                        <ShieldCheck className="mr-1 size-3.5" />
                        设备与授权
                    </Badge>
                    <Badge variant="outline">真实内容包</Badge>
                </>
            )}

            <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
                <Card>
                    <CardHeader>
                        <CardTitle>设备绑定</CardTitle>
                        <CardDescription>来自 /auth/me/license/devices 的真实绑定信息。</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {devices.map((device) => (
                            <div key={device.id} className="rounded-xl border p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="font-medium">{device.name}</div>
                                        <div className="text-muted-foreground text-sm">{device.platform}</div>
                                    </div>
                                    <Badge variant={device.primary ? "secondary" : "outline"}>{device.binding}</Badge>
                                </div>
                                <div className="mt-3 grid gap-3 text-sm md:grid-cols-3">
                                    <div>
                                        <div className="text-muted-foreground">状态</div>
                                        <div className="font-medium">{device.status}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">最后在线</div>
                                        <div className="font-medium">{device.lastSeen}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">主设备</div>
                                        <div className="font-medium">{device.primary ? "是" : "否"}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>内容包</CardTitle>
                        <CardDescription>来自 /content-packs 的真实课包摘要。</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {contentPacks.map((pack) => (
                            <div key={pack.id} className="rounded-xl border p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="font-medium">{pack.title}</div>
                                        <div className="text-muted-foreground text-sm">{pack.summary}</div>
                                    </div>
                                    <Badge variant="secondary">{pack.cacheState}</Badge>
                                </div>
                                <div className="mt-3">
                                    <Progress value={pack.progress * 100} />
                                </div>
                                <div className="mt-3 grid gap-3 text-sm md:grid-cols-3">
                                    <div>
                                        <div className="text-muted-foreground">Manifest</div>
                                        <div className="font-medium">{pack.manifestVersion}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">版本</div>
                                        <div className="font-medium">{pack.contentVersion}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">更新时间</div>
                                        <div className="font-medium">{pack.updatedAt}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function SettingsSurface() {
    const dictionary = useDictionary();
    const { account, accessProfile, license } = useDesktopPortalData();
    const [pushNotifications, setPushNotifications] = useState(true);
    const [sessionWarnings, setSessionWarnings] = useState(true);
    const [cacheAutoRefresh, setCacheAutoRefresh] = useState(true);

    return (
        <div className="space-y-5">
            {pageShell(
                dictionary.pages.settings.title,
                dictionary.pages.settings.summary,
                <Badge variant="secondary">
                    <Settings className="mr-1 size-3.5" />
                    {dictionary.pages.settings.label}
                </Badge>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>设置分栏</CardTitle>
                    <CardDescription>桌面端的账号、授权和通知设置现在读取真实账户与许可证数据。</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="profile">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="profile">账号资料</TabsTrigger>
                            <TabsTrigger value="security">安全与授权</TabsTrigger>
                            <TabsTrigger value="notifications">通知与缓存</TabsTrigger>
                        </TabsList>

                        <TabsContent value="profile" className="mt-4 grid gap-4 xl:grid-cols-2">
                            <Field>
                                <FieldLabel htmlFor="display-name">显示名称</FieldLabel>
                                <FieldContent>
                                    <Input id="display-name" defaultValue={account?.name ?? "未连接"} />
                                </FieldContent>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="email">邮箱</FieldLabel>
                                <FieldContent>
                                    <Input id="email" defaultValue={account?.email ?? "未连接"} />
                                </FieldContent>
                            </Field>
                            <div className="rounded-xl border p-4 xl:col-span-2">
                                <div className="flex items-center gap-2 font-medium">
                                    <UserRound className="size-4" />
                                    账号资料摘要
                                </div>
                                <div className="text-muted-foreground mt-1 text-sm">
                                    {account
                                        ? `账户 ${account.name} 已从 /auth/me 读取。`
                                        : "等待真实 Web 授权后再读取账户资料。"}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="security" className="mt-4 space-y-3">
                            <div className="rounded-xl border p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="font-medium">Web 授权状态</div>
                                        <div className="text-muted-foreground text-sm">
                                            {account ? `当前会话 ${account.email}` : "尚未载入桌面授权会话。"}
                                        </div>
                                    </div>
                                    <Badge variant={account ? "secondary" : "outline"}>{account ? "有效" : "未连接"}</Badge>
                                </div>
                            </div>
                            <div className="rounded-xl border p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="font-medium">设备登录提醒</div>
                                        <div className="text-muted-foreground text-sm">
                                            设备状态来自真实许可证和设备绑定接口。
                                        </div>
                                    </div>
                                    <Switch
                                        checked={sessionWarnings}
                                        onCheckedChange={setSessionWarnings}
                                        aria-label="设备登录提醒"
                                    />
                                </div>
                            </div>
                            <div className="rounded-xl border p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="font-medium">许可证概览</div>
                                        <div className="text-muted-foreground text-sm">
                                            {license
                                                ? `${license.deviceCount}/${license.maxDevices} 台设备已绑定`
                                                : "未加载许可证信息。"}
                                        </div>
                                    </div>
                                    <Badge variant="outline">{license?.status ?? "未连接"}</Badge>
                                </div>
                            </div>
                            <div className="rounded-xl border p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="font-medium">访问权限</div>
                                        <div className="text-muted-foreground text-sm">
                                            {accessProfile ? accessProfile.roles.join(" / ") : "未加载访问配置。"}
                                        </div>
                                    </div>
                                    <Badge variant="secondary">{accessProfile?.primaryRole ?? "-"}</Badge>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="notifications" className="mt-4 space-y-3">
                            {(
                                [
                                    [
                                        "push",
                                        "桌面推送",
                                        "同步完成、判题结果和提醒会在桌面端弹出。",
                                        pushNotifications,
                                        setPushNotifications,
                                    ],
                                    [
                                        "cache",
                                        "自动刷新缓存",
                                        "重新联网时自动检查真实 content-pack 列表是否更新。",
                                        cacheAutoRefresh,
                                        setCacheAutoRefresh,
                                    ],
                                ] as const
                            ).map(([id, label, description, checked, setChecked]) => (
                                <div key={id} className="flex items-center justify-between gap-3 rounded-xl border p-4">
                                    <div>
                                        <div className="font-medium">{label}</div>
                                        <div className="text-muted-foreground text-sm">{description}</div>
                                    </div>
                                    <Switch checked={checked} onCheckedChange={setChecked} aria-label={label} />
                                </div>
                            ))}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}

export { RecordsSurface, SettingsSurface, SyncCacheSurface, WorkspaceSurface };
