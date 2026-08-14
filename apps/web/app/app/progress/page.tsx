"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@workspace/ui/components/empty";
import { Progress } from "@workspace/ui/components/progress";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { getProgressOverview } from "@/lib/api/endpoints/progress-api";
import { useDictionary } from "@/lib/i18n";

export default function ProgressPage() {
    const t = useDictionary();
    const [totalLessons, setTotalLessons] = useState(0);
    const [completedLessons, setCompletedLessons] = useState(0);
    const [completionRate, setCompletionRate] = useState(0);
    const [recentEvents, setRecentEvents] = useState<Array<{ id: string; eventType: string; createdAt: string }>>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        const loadProgress = async () => {
            try {
                const overview = await getProgressOverview();
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
        </section>
    );
}
