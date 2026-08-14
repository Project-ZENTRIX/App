"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, LibraryBig } from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@workspace/ui/components/empty";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Separator } from "@workspace/ui/components/separator";
import { listCourses, type CourseItem } from "@/lib/api/endpoints/catalog-api";
import { getProgressOverview } from "@/lib/api/endpoints/progress-api";
import { formatCurrency } from "@/lib/format";
import { useLocale } from "@/lib/i18n";

const copy = {
    "zh-CN": {
        section: "课程库",
        title: "我的课程",
        description: "已拥有和可学习的课包都在这里。",
        accessible: "可访问",
        owned: "已拥有",
        enrolled: "已订阅",
        price: "价格",
        status: "状态",
        openDetails: "查看详情",
        emptyTitle: "暂无课程",
        emptyDescription: "前往课程市场添加你的第一个课包。",
    },
    "en-GB": {
        section: "Library",
        title: "My Courses",
        description: "Owned and learnable packages from the ZENTRIX portal.",
        accessible: "accessible",
        owned: "Owned",
        enrolled: "Enrolled",
        price: "Price",
        status: "Status",
        openDetails: "Open details",
        emptyTitle: "No courses yet",
        emptyDescription: "Browse the market to add your first package and unlock the portal experience.",
    },
} as const;

export default function LibraryPage() {
    const locale = useLocale();
    const text = copy[locale];
    const [items, setItems] = useState<CourseItem[]>([]);
    const [ownedIds, setOwnedIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        const loadLibrary = async () => {
            try {
                const [catalog, progress] = await Promise.all([listCourses({ pageSize: 100 }), getProgressOverview()]);
                if (!active) {
                    return;
                }

                setItems(catalog.items);
                setOwnedIds(new Set(progress.enrollments.map((enrollment) => enrollment.courseId)));
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void loadLibrary();

        return () => {
            active = false;
        };
    }, []);

    const ownedCourses = items.filter((course) => course.isPurchased || ownedIds.has(course.id));

    return (
        <section className="flex flex-col gap-5">
            <header className="border-border/60 bg-muted/20 flex flex-wrap items-start justify-between gap-4 rounded-2xl border p-5">
                <div className="min-w-0">
                    <div className="text-muted-foreground text-xs tracking-[0.28em] uppercase">{text.section}</div>
                    <h1 className="mt-1 text-2xl font-semibold">{text.title}</h1>
                    <p className="text-muted-foreground mt-1 text-sm">{text.description}</p>
                </div>
                <Badge variant="secondary">
                    {ownedCourses.length} {text.accessible}
                </Badge>
            </header>

            {loading ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Card key={index}>
                            <CardHeader>
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-full" />
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Skeleton className="h-24 w-full" />
                                <Skeleton className="h-9 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : ownedCourses.length ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {ownedCourses.map((course) => (
                        <Card key={course.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <CardTitle>{course.title}</CardTitle>
                                        <CardDescription className="line-clamp-2">{course.summary}</CardDescription>
                                    </div>
                                    <Badge variant={course.isPurchased ? "secondary" : "outline"}>
                                        {course.isPurchased ? text.owned : text.enrolled}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4">
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <div className="text-muted-foreground">{text.price}</div>
                                        <div className="font-medium">
                                            {formatCurrency(course.price, course.currency, locale)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">{text.status}</div>
                                        <div className="font-medium">{course.statusLabel}</div>
                                    </div>
                                </div>
                                <Separator />
                                <Button asChild variant="outline" className="w-full justify-between">
                                    <Link href={`/app/courses/${course.id}`}>
                                        {text.openDetails}
                                        <ArrowRight />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Empty className="border-border/60 bg-background border">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <LibraryBig />
                        </EmptyMedia>
                        <EmptyTitle>{text.emptyTitle}</EmptyTitle>
                        <EmptyContent>
                            <EmptyDescription>{text.emptyDescription}</EmptyDescription>
                        </EmptyContent>
                    </EmptyHeader>
                </Empty>
            )}
        </section>
    );
}
