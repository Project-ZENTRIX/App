"use client";

import Link from "next/link";
import { ArrowRight, HelpCircle, ShieldCheck, Smartphone, ShoppingCart, Sparkles, Trophy } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@workspace/ui/components/empty";
import { Separator } from "@workspace/ui/components/separator";
import { useDictionary } from "@/lib/i18n";

const icons = [ShoppingCart, Smartphone, ShieldCheck, Trophy];

export default function FaqPage() {
    const t = useDictionary();
    const entries = t.faq.entries;

    return (
        <section className="mx-auto flex min-h-[calc(100svh-64px)] w-full max-w-6xl flex-col gap-6 px-6 py-10 md:px-10">
            <header className="border-border/60 bg-muted/20 rounded-2xl border p-6">
                <div className="text-muted-foreground text-xs tracking-[0.28em] uppercase">{t.faq.heroLabel}</div>
                <h1 className="mt-2 text-3xl font-semibold">{t.faq.heroTitle}</h1>
                <p className="text-muted-foreground mt-2 max-w-3xl text-sm">{t.faq.heroDescription}</p>
            </header>

            <div className="grid gap-4 md:grid-cols-2">
                {entries.map((item, index) => {
                    const Icon = icons[index] ?? HelpCircle;
                    return (
                        <Card key={item.question}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Icon className="text-primary" />
                                    {item.question}
                                </CardTitle>
                                <CardDescription>{item.answer}</CardDescription>
                            </CardHeader>
                        </Card>
                    );
                })}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t.faq.ctaTitle}</CardTitle>
                    <CardDescription>{t.faq.ctaDescription}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-3">
                    <Button asChild>
                        <Link href="/account/login">
                            {t.faq.signIn}
                            <ArrowRight />
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/pricing">
                            {t.faq.viewPricing}
                            <Sparkles />
                        </Link>
                    </Button>
                </CardContent>
            </Card>

            <Separator />

            <Empty className="border-border/60 bg-background border">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <HelpCircle />
                    </EmptyMedia>
                    <EmptyTitle>{t.faq.moreHelpTitle}</EmptyTitle>
                    <EmptyContent>
                        <EmptyDescription>{t.faq.moreHelpDescription}</EmptyDescription>
                    </EmptyContent>
                </EmptyHeader>
            </Empty>
        </section>
    );
}
