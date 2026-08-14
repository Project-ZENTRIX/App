"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpenText, Layers3, Sparkles } from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@workspace/ui/components/empty";
import { Separator } from "@workspace/ui/components/separator";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { getCourse, type CourseDetail } from "@/lib/api/endpoints/catalog-api";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { useLocale } from "@/lib/i18n";

const copy = {
    "zh-CN": {
        notFoundTitle: "未找到课包",
        notFoundDescription: "该课包不可用或已归档。",
        detailLabel: "课包详情",
        detailTitle: "课包详情",
        detailDescription: "查看选中的课包和其中包含的学习资源。",
        purchased: "已购买",
        notPurchased: "未购买",
        courseSnapshot: "课包概览",
        courseSnapshotDescription: "核心课包信息和权限摘要。",
        learningStatus: "学习状态",
        learningStatusDescription: "快速查看访问和学习准备情况。",
        owned: "已拥有",
        available: "可获取",
        learnable: "可学习",
        previewOnly: "仅预览",
        offlineAccess: "离线访问",
        onlineOnly: "仅在线",
        structure: "结构",
        structureDescription: "章节、课程和任务的总览。",
        chapters: "章节",
        lessons: "课时",
        tasks: "任务",
        nextStep: "下一步",
        nextStepDescription: "可以直接使用该课包，也可以继续回到门户。",
        continueLearning: "继续学习",
        backToMarket: "返回市场",
        chapterPreview: "章节预览",
        chapterPreviewDescription: "预览章节和其下课程。",
        noChapterPreviewTitle: "暂无章节预览",
        noChapterPreviewDescription: "API 返回了课包摘要，但没有嵌套章节数据。",
        updates: "更新记录",
        updatesDescription: "发布历史和课包版本。",
        includedAssets: "包含资源与课包记录可用于审计和上下文参考。",
        chapterLessons: (count: number) => `${count} 节课`,
    },
    "en-GB": {
        notFoundTitle: "Course not found",
        notFoundDescription: "This package is unavailable or has been archived.",
        detailLabel: "Package detail",
        detailTitle: "Package detail",
        detailDescription: "Explore the selected course package and the included learning assets.",
        purchased: "Owned",
        notPurchased: "Not owned",
        courseSnapshot: "Course snapshot",
        courseSnapshotDescription: "Core package details and entitlement summary.",
        learningStatus: "Learning status",
        learningStatusDescription: "A quick read on access and readiness.",
        owned: "Owned",
        available: "Available",
        learnable: "Learnable",
        previewOnly: "Preview only",
        offlineAccess: "Offline access",
        onlineOnly: "Online only",
        structure: "Structure",
        structureDescription: "Chapters, lessons, and tasks summary.",
        chapters: "Chapters",
        lessons: "Lessons",
        tasks: "Tasks",
        nextStep: "Next step",
        nextStepDescription: "Use the package directly or continue from the portal.",
        continueLearning: "Continue learning",
        backToMarket: "Back to market",
        chapterPreview: "Chapter preview",
        chapterPreviewDescription: "Preview chapters and the lessons underneath each group.",
        noChapterPreviewTitle: "No chapter preview",
        noChapterPreviewDescription: "The API returned the course summary without nested chapter data.",
        updates: "Updates",
        updatesDescription: "Release history and package versions.",
        includedAssets: "Included assets and package records are available for audit and context.",
        chapterLessons: (count: number) => `${count} lessons`,
    },
} as const;

function SectionLabel({ title, description }: { title: string; description: string }) {
    return (
        <div className="flex flex-col gap-1">
            <div className="text-sm font-medium">{title}</div>
            <div className="text-muted-foreground text-sm">{description}</div>
        </div>
    );
}

export default function CourseDetailPage() {
    const locale = useLocale();
    const text = copy[locale];
    const [course, setCourse] = useState<CourseDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const params = useParams<{ courseId: string }>();
    const courseId = params.courseId;

    useEffect(() => {
        let active = true;

        const loadCourse = async () => {
            try {
                const detail = await getCourse(courseId);
                if (!active) {
                    return;
                }

                setCourse(detail);
                setError(null);
            } catch (loadError) {
                if (!active) {
                    return;
                }

                setError(
                    loadError instanceof Error
                        ? loadError.message
                        : locale === "zh-CN"
                          ? "无法加载课包详情"
                          : "Unable to load course detail"
                );
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void loadCourse();
        return () => {
            active = false;
        };
    }, [courseId, locale]);

    if (loading) {
        return (
            <div className="grid gap-4">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent className="grid gap-3 md:grid-cols-3">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <Skeleton key={index} className="h-24 w-full" />
                        ))}
                    </CardContent>
                </Card>
                <Skeleton className="h-72 w-full" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="border-destructive/40 bg-destructive/10 text-destructive rounded-xl border px-4 py-3 text-sm">
                {error}
            </div>
        );
    }

    if (!course) {
        return (
            <Empty className="border-border/60 bg-background border">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <BookOpenText />
                    </EmptyMedia>
                    <EmptyTitle>{text.notFoundTitle}</EmptyTitle>
                    <EmptyContent>
                        <EmptyDescription>{text.notFoundDescription}</EmptyDescription>
                    </EmptyContent>
                </EmptyHeader>
            </Empty>
        );
    }

    return (
        <section className="flex flex-col gap-5">
            <header className="border-border/60 bg-muted/20 flex flex-wrap items-start justify-between gap-4 rounded-2xl border p-5">
                <div className="min-w-0">
                    <div className="text-muted-foreground text-xs tracking-[0.28em] uppercase">{text.detailLabel}</div>
                    <h1 className="mt-1 text-2xl font-semibold">{course.title}</h1>
                    <p className="text-muted-foreground mt-2 max-w-3xl text-sm">{course.summary}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={course.isPurchased ? "secondary" : "outline"}>
                        {course.isPurchased ? text.purchased : text.notPurchased}
                    </Badge>
                    <Badge variant="outline">{course.statusLabel}</Badge>
                    <Badge variant="outline">{formatCurrency(course.price, course.currency, locale)}</Badge>
                </div>
            </header>

            <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                <Card>
                    <CardHeader>
                        <CardTitle>{text.courseSnapshot}</CardTitle>
                        <CardDescription>{text.courseSnapshotDescription}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border p-4">
                            <SectionLabel title={text.learningStatus} description={text.learningStatusDescription} />
                            <div className="mt-4 flex flex-wrap gap-2">
                                <Badge variant={course.entitlement.isPurchased ? "secondary" : "outline"}>
                                    {course.entitlement.isPurchased ? text.owned : text.available}
                                </Badge>
                                <Badge variant={course.entitlement.isLearnable ? "default" : "outline"}>
                                    {course.entitlement.isLearnable ? text.learnable : text.previewOnly}
                                </Badge>
                                <Badge variant="outline">
                                    {course.entitlement.isOffline ? text.offlineAccess : text.onlineOnly}
                                </Badge>
                            </div>
                        </div>
                        <div className="rounded-xl border p-4">
                            <SectionLabel title={text.structure} description={text.structureDescription} />
                            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                                <div>
                                    <div className="text-muted-foreground">{text.chapters}</div>
                                    <div className="font-medium">{course.chapterCount}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">{text.lessons}</div>
                                    <div className="font-medium">{course.lessonCount}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">{text.tasks}</div>
                                    <div className="font-medium">{course.taskCount}</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{text.nextStep}</CardTitle>
                        <CardDescription>{text.nextStepDescription}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        <Button asChild className="w-full justify-between">
                            <Link href="/app/library">
                                {text.continueLearning}
                                <ArrowRight />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full justify-between">
                            <Link href="/app/courses">
                                {text.backToMarket}
                                <Sparkles />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
                <Card className="xl:col-span-2">
                    <CardHeader>
                        <CardTitle>{text.chapterPreview}</CardTitle>
                        <CardDescription>{text.chapterPreviewDescription}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {course.chapters.length ? (
                            course.chapters.map((chapter) => (
                                <div key={chapter.id} className="rounded-xl border p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <div className="font-medium">{chapter.title}</div>
                                            <div className="text-muted-foreground text-sm">{chapter.summary}</div>
                                        </div>
                                        <Badge variant="outline">{text.chapterLessons(chapter.lessonCount)}</Badge>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <Empty className="border-border/60 bg-background border">
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <Layers3 />
                                    </EmptyMedia>
                                    <EmptyTitle>{text.noChapterPreviewTitle}</EmptyTitle>
                                    <EmptyContent>
                                        <EmptyDescription>{text.noChapterPreviewDescription}</EmptyDescription>
                                    </EmptyContent>
                                </EmptyHeader>
                            </Empty>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{text.updates}</CardTitle>
                        <CardDescription>{text.updatesDescription}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {course.releases.slice(0, 3).map((release) => (
                            <div key={release.id} className="rounded-xl border p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="font-medium">{release.version}</div>
                                    <Badge variant="outline">{release.status}</Badge>
                                </div>
                                <div className="text-muted-foreground mt-2 text-sm">
                                    {formatDateTime(release.releasedAt, locale)}
                                </div>
                            </div>
                        ))}
                        <Separator />
                        <div className="text-muted-foreground text-sm">{text.includedAssets}</div>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
