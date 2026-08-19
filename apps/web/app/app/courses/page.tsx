"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Search, Sparkles } from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@workspace/ui/components/empty";
import { Field } from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Separator } from "@workspace/ui/components/separator";
import { cn } from "@workspace/ui/lib/utils";
import { listCourses, type CourseItem } from "@/lib/api/endpoints/catalog-api";
import { formatCurrency } from "@/lib/format";
import { useDictionary, useLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

const sortOptions = [
    { labelKey: "recommended", value: "featured" },
    { labelKey: "latest", value: "latest" },
    { labelKey: "popular", value: "popular" },
] as const;

function CourseCard({ course, t, locale }: { course: CourseItem; t: ReturnType<typeof useDictionary>; locale: Locale }) {
    const accentTone =
        course.status === "published"
            ? "border-emerald-500/25 bg-emerald-500/8"
            : course.status === "draft"
              ? "border-amber-500/25 bg-amber-500/8"
              : "border-muted bg-muted/20";

    return (
        <Card className={cn("group overflow-hidden transition-transform duration-200 hover:-translate-y-0.5", accentTone)}>
            <CardHeader className="gap-2">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <CardTitle className="truncate">{course.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{course.summary}</CardDescription>
                    </div>
                    <Badge variant={course.isPurchased ? "secondary" : "outline"}>
                        {course.isPurchased ? t.portal.owned : t.portal.available}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                    {course.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline">
                            {tag}
                        </Badge>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <div className="text-muted-foreground">{t.portal.difficulty}</div>
                        <div className="font-medium">{course.difficulty}</div>
                    </div>
                    <div>
                        <div className="text-muted-foreground">{t.portal.price}</div>
                        <div className="font-medium">{formatCurrency(course.price, course.currency, locale)}</div>
                    </div>
                    <div>
                        <div className="text-muted-foreground">{t.portal.lessons}</div>
                        <div className="font-medium">{course.lessonCount}</div>
                    </div>
                    <div>
                        <div className="text-muted-foreground">{t.portal.version}</div>
                        <div className="font-medium">{course.version}</div>
                    </div>
                </div>

                <Separator />

                <Button asChild variant="outline" className="w-full justify-between">
                    <Link href={`/app/courses/${course.id}`}>
                        {t.portal.viewDetails}
                        <ArrowRight />
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}

export default function CoursesPage() {
    const t = useDictionary();
    const locale = useLocale();
    const [keyword, setKeyword] = useState("");
    const [sort, setSort] = useState<(typeof sortOptions)[number]["value"]>("featured");
    const [items, setItems] = useState<CourseItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        const loadCourses = async () => {
            try {
                const response = await listCourses({ keyword, sort, pageSize: 24 });
                if (!active) {
                    return;
                }

                setItems(response.items);
                setError(null);
            } catch (loadError) {
                if (!active) {
                    return;
                }

                setError(loadError instanceof Error ? loadError.message : t.portal.noCoursesDescription);
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void loadCourses();
        return () => {
            active = false;
        };
    }, [keyword, sort, t.portal.noCoursesDescription]);

    const ownedCount = useMemo(() => items.filter((course) => course.isPurchased).length, [items]);

    return (
        <section className="flex min-h-full flex-col gap-5">
            <header className="border-border/60 bg-muted/20 flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5">
                <div className="min-w-0">
                    <div className="text-muted-foreground text-xs tracking-[0.28em] uppercase">{t.portal.courseMarket}</div>
                    <h1 className="mt-1 text-2xl font-semibold">{t.portal.courseMarket}</h1>
                    <p className="text-muted-foreground mt-1 text-sm">{t.portal.browseDescription}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                        {ownedCount} {t.portal.owned}
                    </Badge>
                    <Badge variant="outline">
                        {items.length} {t.portal.available}
                    </Badge>
                </div>
            </header>

            <Card>
                <CardHeader>{t.portal.searchCourses}</CardHeader>
                <CardContent className="grid gap-4 px-5 lg:grid-cols-[1fr_280px] lg:items-end">
                    <Field>
                        <div className="relative">
                            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                            <Input
                                id="course-search"
                                value={keyword}
                                onChange={(event) => setKeyword(event.target.value)}
                                placeholder={t.portal.searchPlaceholder}
                                className="pl-9"
                            />
                        </div>
                    </Field>

                    <div className="grid h-full w-full grid-cols-3 flex-wrap items-center gap-4">
                        {sortOptions.map((option) => (
                            <Button
                                key={option.value}
                                type="button"
                                variant={sort === option.value ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSort(option.value)}
                                className="h-full">
                                {t.portal[option.labelKey]}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {error ? (
                <div className="border-destructive/40 bg-destructive/10 text-destructive rounded-xl border px-4 py-3 text-sm">
                    {error}
                </div>
            ) : null}

            {loading ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <Card key={index}>
                            <CardHeader>
                                <Skeleton className="h-5 w-3/5" />
                                <Skeleton className="h-4 w-full" />
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Skeleton className="h-28 w-full" />
                                <Skeleton className="h-9 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : items.length ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {items.map((course) => (
                        <CourseCard key={course.id} course={course} t={t} locale={locale} />
                    ))}
                </div>
            ) : (
                <Empty className="border-border/60 bg-background border">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Sparkles />
                        </EmptyMedia>
                        <EmptyTitle>{t.portal.noCoursesTitle}</EmptyTitle>
                        <EmptyContent>
                            <EmptyDescription>{t.portal.noCoursesDescription}</EmptyDescription>
                        </EmptyContent>
                    </EmptyHeader>
                </Empty>
            )}
        </section>
    );
}
