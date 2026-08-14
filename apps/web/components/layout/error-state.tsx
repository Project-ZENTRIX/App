"use client";

import Link from "next/link";
import { AlertTriangle, ArrowLeft, RefreshCw, ShieldAlert } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { useLocale } from "@/lib/i18n";

type ErrorStateProps = {
    title: string;
    description: string;
    message: string;
    retryLabel: string;
    onRetry: () => void;
    homeHref: string;
    homeLabel: string;
    digest?: string;
};

export function ErrorState({ title, description, message, retryLabel, onRetry, homeHref, homeLabel, digest }: ErrorStateProps) {
    const hasMessage = message.trim().length > 0;
    const locale = useLocale();
    const copy = {
        "zh-CN": {
            interruption: "系统中断",
            happened: "发生了什么",
            fallback: "应用的这一部分遇到了一个意外运行时错误。",
            nextStep: "下一步",
            nextStepDescription: "先重试一次。如果仍然失败，可以先返回其他页面继续操作，我们会继续恢复这个路由。",
        },
        "en-GB": {
            interruption: "System interruption",
            happened: "What happened",
            fallback: "An unexpected runtime error interrupted this area of the app.",
            nextStep: "Next step",
            nextStepDescription: "Retry first. If it keeps failing, go back and continue elsewhere while we recover the route.",
        },
    } as const;
    const text = copy[locale];

    return (
        <div className="border-border/70 bg-muted/20 relative w-full max-w-3xl overflow-hidden rounded-3xl border p-4 shadow-sm">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(250,204,21,0.12),transparent_30%)]" />

            <Card className="border-border/60 bg-background/95 relative shadow-xl backdrop-blur-sm">
                <CardHeader className="space-y-4 pb-6">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-destructive/10 text-destructive inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase">
                            <ShieldAlert className="size-3.5" />
                            {text.interruption}
                        </span>
                        {digest ? (
                            <span className="text-muted-foreground border-border/60 rounded-full border px-3 py-1 text-xs">
                                Ref {digest}
                            </span>
                        ) : null}
                    </div>

                    <div className="space-y-2">
                        <CardTitle className="text-3xl sm:text-4xl">{title}</CardTitle>
                        <CardDescription className="max-w-2xl text-base">{description}</CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
                    <div className="border-border/60 bg-muted/20 rounded-2xl border p-5">
                        <div className="flex items-start gap-3">
                            <div className="bg-destructive/10 text-destructive rounded-xl p-2">
                                <AlertTriangle className="size-5" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-sm font-semibold">{text.happened}</div>
                                <p className="text-muted-foreground mt-1 text-sm leading-6">
                                    {hasMessage ? message : text.fallback}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="border-border/60 bg-background rounded-2xl border p-5">
                        <div className="text-sm font-semibold">{text.nextStep}</div>
                        <p className="text-muted-foreground mt-2 text-sm leading-6">{text.nextStepDescription}</p>
                    </div>
                </CardContent>

                <CardContent className="border-border/60 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center">
                    <Button onClick={onRetry} className="w-full sm:w-auto">
                        <RefreshCw className="size-4" />
                        {retryLabel}
                    </Button>
                    <Button asChild variant="outline" className="w-full sm:w-auto">
                        <Link href={homeHref}>
                            <ArrowLeft className="size-4" />
                            {homeLabel}
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
