"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@workspace/ui/components/empty";
import { Progress } from "@workspace/ui/components/progress";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { listCourses } from "@/lib/api/endpoints/catalog-api";
import { getProgressOverview } from "@/lib/api/endpoints/progress-api";
import { getLevelProgress, listAchievements, listLevels, listUserAchievements } from "@/lib/api/endpoints/achievement-api";
import { formatDateTime } from "@/lib/format";
import { useDictionary, useLocale } from "@/lib/i18n";

export default function ProgressPage() {
    const t = useDictionary();
    const locale = useLocale();
    const levelsTitle = locale === "zh-CN" ? "等级" : "Levels";
    const nextLevelLabel = locale === "zh-CN" ? "下一级" : "Next level";
    const [totalLessons, setTotalLessons] = useState(0);
    const [completedLessons, setCompletedLessons] = useState(0);
    const [completionRate, setCompletionRate] = useState(0);
    const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
    const [recentEvents, setRecentEvents] = useState<Array<{ id: string; eventType: string; createdAt: string }>>([]);
    const [achievements, setAchievements] = useState<Array<{ id: string; code: string; name: string; description: string | null }>>([]);
    const [earnedAchievements, setEarnedAchievements] = useState<Array<{ id: string; achievedAt: string; achievement: { id: string; code: string; name: string; description: string | null } | null }>>([]);
    const [levels, setLevels] = useState<Array<{ id: string; code: string; name: string; rank: number }>>([]);
    const [relatedCourses, setRelatedCourses] = useState<Array<{ id: string; title: string; summary: string }>>([]);
    const [levelProgress, setLevelProgress] = useState<{
        currentLevel: { id: string; progress: number; level: { id: string; code: string; name: string; rank: number } | null; createdAt: string; updatedAt: string } | null;
        nextLevel: { id: string; code: string; name: string; rank: number } | null;
        items: Array<{ id: string; progress: number; level: { id: string; code: string; name: string; rank: number } | null; createdAt: string; updatedAt: string }>;
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        const loadProgress = async () => {
            try {
                const [overview, achievementList, userAchievements, levelList, progress, catalog] = await Promise.all([
                    getProgressOverview(),
                    listAchievements(),
                    listUserAchievements(),
                    listLevels(),
                    getLevelProgress(),
                    listCourses({ pageSize: 100 }),
                ]);
                if (!active) {
                    return;
                }

                setTotalLessons(overview.lessonProgress.totalLessons);
                setCompletedLessons(overview.lessonProgress.completedLessons);
                setCompletionRate(overview.lessonProgress.completionRate);
                setRecentEvents(
                    overview.recentEvents.map((event) => ({
                        id: event.id,
                        eventType: event.eventType,
                        createdAt: event.createdAt,
                    }))
                );
                const syncTimes = overview.recentEvents
                    .map((event) => new Date(event.createdAt).getTime())
                    .filter((value) => Number.isFinite(value));
                setLastSyncAt(syncTimes.length ? new Date(Math.max(...syncTimes)).toISOString() : null);
                setAchievements(achievementList.items);
                setEarnedAchievements(userAchievements.items);
                setLevels(levelList.items);
                setLevelProgress(progress);
                const enrolledCourseIds = new Set(overview.enrollments.map((enrollment) => enrollment.courseId));
                setRelatedCourses(
                    catalog.items
                        .filter((course) => enrolledCourseIds.has(course.id))
                        .map((course) => ({
                            id: course.id,
                            title: course.title,
                            summary: course.summary,
                        }))
                );
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void loadProgress();
        return () => {
            active = false;
        };
    }, []);

    return (
        <section className="flex flex-col gap-5">
            <header className="border-border/60 bg-muted/20 rounded-2xl border p-5">
                <div className="text-muted-foreground text-xs tracking-[0.28em] uppercase">{t.portal.progressTitle}</div>
                <h1 className="mt-1 text-2xl font-semibold">{t.portal.progressTitle}</h1>
                <p className="text-muted-foreground mt-1 text-sm">{t.portal.progressDescriptionLong}</p>
            </header>

            <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
                <Card>
                    <CardHeader>
                        <CardTitle>{t.portal.learningSummary}</CardTitle>
                        <CardDescription>{t.portal.progressDescriptionLong}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {loading ? (
                            <Skeleton className="h-24 w-full" />
                        ) : (
                            <>
                                <div className="rounded-xl border p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <div className="text-muted-foreground text-sm">{t.portal.courseProgress}</div>
                                            <div className="text-2xl font-semibold">{Math.round(completionRate * 100)}%</div>
                                        </div>
                                        <Badge variant="secondary">
                                            {completedLessons}/{totalLessons}
                                        </Badge>
                                    </div>
                                    <Progress className="mt-4" value={completionRate * 100} />
                                </div>
                                <Empty className="border-border/60 bg-background border">
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <Trophy />
                                        </EmptyMedia>
                                        <EmptyTitle>{t.portal.noBadgesUnlockedYet}</EmptyTitle>
                                        <EmptyContent>
                                            <EmptyDescription>{t.portal.noProgressEventsYet}</EmptyDescription>
                                        </EmptyContent>
                                    </EmptyHeader>
                                </Empty>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t.portal.recentEvents}</CardTitle>
                        <CardDescription>{t.portal.recentActivityDescription}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {loading ? (
                            <div className="space-y-3">
                                {Array.from({ length: 3 }).map((_, index) => (
                                    <Skeleton key={index} className="h-14 w-full" />
                                ))}
                            </div>
                        ) : recentEvents.length ? (
                            recentEvents.map((event) => (
                                <div key={event.id} className="rounded-xl border p-4">
                                    <div className="font-medium">{event.eventType}</div>
                                    <div className="text-muted-foreground text-sm">{event.createdAt}</div>
                                </div>
                            ))
                        ) : (
                            <Empty className="border-border/60 bg-background border">
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <Trophy />
                                    </EmptyMedia>
                                    <EmptyTitle>{t.portal.noProgressEventsYet}</EmptyTitle>
                                    <EmptyContent>
                                        <EmptyDescription>{t.portal.noProgressEventsYet}</EmptyDescription>
                                    </EmptyContent>
                                </EmptyHeader>
                            </Empty>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>{t.portal.lastSyncAt}</CardTitle>
                        <CardDescription>{t.portal.progressDescriptionLong}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-14 w-full" />
                        ) : lastSyncAt ? (
                            <div className="rounded-xl border p-4">
                                <div className="text-muted-foreground text-sm">{t.portal.lastSyncAt}</div>
                                <div className="mt-1 font-medium">{formatDateTime(lastSyncAt, locale)}</div>
                            </div>
                        ) : (
                            <Empty className="border-border/60 bg-background border">
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <Trophy />
                                    </EmptyMedia>
                                    <EmptyTitle>{t.portal.lastSyncAt}</EmptyTitle>
                                    <EmptyContent>
                                        <EmptyDescription>{t.portal.noProgressEventsYet}</EmptyDescription>
                                    </EmptyContent>
                                </EmptyHeader>
                            </Empty>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t.portal.relatedCourses}</CardTitle>
                        <CardDescription>{t.portal.relatedCoursesDescription}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {loading ? (
                            <div className="space-y-3">
                                {Array.from({ length: 2 }).map((_, index) => (
                                    <Skeleton key={index} className="h-16 w-full" />
                                ))}
                            </div>
                        ) : relatedCourses.length ? (
                            relatedCourses.map((course) => (
                                <div key={course.id} className="rounded-xl border p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <div className="font-medium">{course.title}</div>
                                            <div className="text-muted-foreground text-sm">{course.summary}</div>
                                        </div>
                                        <Button asChild variant="ghost" size="sm">
                                            <Link href={`/app/courses/${course.id}`}>{t.portal.viewDetails}</Link>
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <Empty className="border-border/60 bg-background border">
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <Trophy />
                                    </EmptyMedia>
                                    <EmptyTitle>{t.portal.noRelatedCourses}</EmptyTitle>
                                    <EmptyContent>
                                        <EmptyDescription>{t.portal.relatedCoursesDescription}</EmptyDescription>
                                    </EmptyContent>
                                </EmptyHeader>
                            </Empty>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>{t.portal.achievements}</CardTitle>
                        <CardDescription>{t.portal.achievementsDescription}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {loading ? (
                            <div className="space-y-3">
                                {Array.from({ length: 3 }).map((_, index) => (
                                    <Skeleton key={index} className="h-14 w-full" />
                                ))}
                            </div>
                        ) : earnedAchievements.length ? (
                            earnedAchievements.map((item) => (
                                <div key={item.id} className="rounded-xl border p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="font-medium">{item.achievement?.name ?? item.id}</div>
                                        <Badge variant="secondary">{t.portal.achievements}</Badge>
                                    </div>
                                    <div className="text-muted-foreground mt-2 text-sm">
                                        {item.achievement?.description ?? (item.achievement?.code ?? item.id)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <Empty className="border-border/60 bg-background border">
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <Trophy />
                                    </EmptyMedia>
                                    <EmptyTitle>{t.portal.noBadgesUnlockedYet}</EmptyTitle>
                                    <EmptyContent>
                                        <EmptyDescription>{t.portal.noProgressEventsYet}</EmptyDescription>
                                    </EmptyContent>
                                </EmptyHeader>
                            </Empty>
                        )}
                        <div className="text-muted-foreground text-sm">
                            {earnedAchievements.length}/{achievements.length} {t.portal.achievements}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{levelsTitle}</CardTitle>
                        <CardDescription>{t.portal.progressDescriptionLong}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {loading ? (
                            <div className="space-y-3">
                                {Array.from({ length: 3 }).map((_, index) => (
                                    <Skeleton key={index} className="h-14 w-full" />
                                ))}
                            </div>
                        ) : levelProgress?.currentLevel ? (
                            <div className="space-y-3">
                                <div className="rounded-xl border p-4">
                                    <div className="text-sm font-medium">{levelProgress.currentLevel.level?.name ?? levelsTitle}</div>
                                    <div className="text-muted-foreground mt-1 text-sm">
                                        {Math.round(levelProgress.currentLevel.progress * 100)}%
                                    </div>
                                    <Progress className="mt-3" value={levelProgress.currentLevel.progress * 100} />
                                </div>
                                <div className="rounded-xl border p-4">
                                    <div className="text-sm font-medium">{nextLevelLabel}</div>
                                    <div className="text-muted-foreground mt-1 text-sm">
                                        {levelProgress.nextLevel?.name ?? t.portal.noProgressEventsYet}
                                    </div>
                                </div>
                                <div className="text-muted-foreground text-sm">
                                    {levels.length} {levelsTitle}
                                </div>
                            </div>
                        ) : (
                            <Empty className="border-border/60 bg-background border">
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <Trophy />
                                    </EmptyMedia>
                                    <EmptyTitle>{t.portal.noBadgesUnlockedYet}</EmptyTitle>
                                    <EmptyContent>
                                        <EmptyDescription>{t.portal.noProgressEventsYet}</EmptyDescription>
                                    </EmptyContent>
                                </EmptyHeader>
                            </Empty>
                        )}
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
