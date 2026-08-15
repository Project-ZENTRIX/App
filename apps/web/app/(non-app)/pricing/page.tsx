"use client";

import Link from "next/link";
import { ArrowRight, Check, Crown, Leaf, Sparkles, X, Zap } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table";
import { cn } from "@workspace/ui/lib/utils";
import { useDictionary } from "@/lib/i18n";

function PricingCards() {
    const t = useDictionary();
    const plans = t.pricing.plans.map((plan, index) => ({
        ...plan,
        icon: [Leaf, Zap, Sparkles, Crown][index] ?? Sparkles,
        highlighted: index === 2,
        style: [
            {
                text: "text-emerald-500",
                button: "text-emerald-600 hover:text-emerald-500 dark:text-emerald-500 dark:hover:text-emerald-400",
                buttonHighlight: "bg-emerald-600! border-emerald-600/25! text-white hover:text-white/90",
            },
            {
                text: "text-blue-500",
                button: "text-blue-600 hover:text-blue-500 dark:text-blue-500 dark:hover:text-blue-400",
                buttonHighlight: "bg-blue-600! border-blue-600/25! text-white hover:text-white/90",
            },
            {
                text: "text-violet-500",
                button: "text-violet-600 hover:text-violet-500 dark:text-violet-500 dark:hover:text-violet-400",
                buttonHighlight: "bg-violet-600! border-violet-600/25! text-white hover:text-white/90",
            },
            {
                text: "text-amber-500",
                button: "text-amber-600 hover:text-amber-500 dark:text-amber-500 dark:hover:text-amber-400",
                buttonHighlight: "bg-amber-600! border-amber-600/25! text-white hover:text-white/90",
            },
        ][index] ?? {
            text: "text-muted-foreground",
            button: "text-muted-foreground",
        },
    }));

    return plans.map((plan) => {
        const Icon = plan.icon;
        return (
            <Card key={plan.name} className={cn(plan.highlighted ? "border-primary shadow-md" : undefined)}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Icon className={cn("h-5 w-5", plan.style.text)} />
                        <span className={plan.style.text}>{plan.name}</span>
                    </CardTitle>
                    <CardAction>
                        <div className="text-right">
                            <span className="text-2xl font-bold">{plan.price}</span>
                            <span className="text-muted-foreground ml-1 text-sm">{plan.period}</span>
                        </div>
                    </CardAction>
                </CardHeader>
                <CardContent className="h-full">
                    <p className="text-muted-foreground mb-2 h-16 text-sm">{plan.description}</p>
                    <ul className="space-y-2 text-sm">
                        {plan.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-2">
                                <Check className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
                <CardFooter>
                    <Button className={cn("w-full", plan.highlighted ? plan.style.buttonHighlight : plan.style.button)} variant="outline">
                        {plan.buttonText}
                    </Button>
                </CardFooter>
            </Card>
        );
    });
}

function PricingComparisonTable() {
    const t = useDictionary();
    const tiers = ["Lunium", "Velium", "Cyrum", "Zenium"] as const;
    const values = [
        [true, true, true, true],
        [false, true, true, true],
        [false, false, true, true],
        [false, false, false, true],
        [false, false, false, true],
        ["Low", "Medium", "High", "Maximum"],
        [true, true, true, true],
        [false, false, "Limited", true],
        ["Limited", true, true, true],
        [false, false, "Limited", true],
        ["Limited", true, true, true],
        [false, false, true, true],
        [false, false, "Basic", "Full + higher limits"],
        [false, false, false, "Highest"],
        ["Basic", true, true, "Full + exclusive"],
        [false, false, "Limited", true],
        [false, false, false, true],
        [false, false, false, true],
    ] as const;

    return (
        <div className="bg-background/50 w-full overflow-x-auto rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-70 min-w-55">{t.pricing.comparisonTitle}</TableHead>
                        {tiers.map((tier) => (
                            <TableHead key={tier} className={cn("min-w-25 text-center", tier === "Cyrum" && "bg-primary/5")}>
                                {tier}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {t.pricing.comparisonFeatures.map((feature, index) => (
                        <TableRow key={feature}>
                            <TableCell className="font-medium">{feature}</TableCell>
                            {tiers.map((tier, tierIndex) => {
                                const value = values[index]?.[tierIndex];
                                return (
                                    <TableCell key={tier} className={cn("text-center", tier === "Cyrum" && "bg-primary/5")}>
                                        {typeof value === "boolean" ? (
                                            value ? (
                                                <Check className="text-primary mx-auto h-4 w-4" />
                                            ) : (
                                                <X className="text-muted-foreground/50 mx-auto h-4 w-4" />
                                            )
                                        ) : (
                                            <span className="text-muted-foreground text-sm">{value}</span>
                                        )}
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

export default function Page() {
    const t = useDictionary();

    return (
        <div className="w-full">
            <section
                id="_zentrix.comp-content"
                className="flex min-h-screen w-full flex-col items-center justify-start gap-12 px-6 py-20 md:px-10 lg:px-32">
                <h3 className="text-3xl">{t.pricing.heroTitle}</h3>
                <div className="grid w-full gap-8 md:grid-cols-2 xl:grid-cols-4">
                    <PricingCards />
                </div>

                <h3 className="mt-12 text-3xl">{t.pricing.comparisonTitle}</h3>
                <PricingComparisonTable />
                <Button asChild variant="ghost">
                    <Link href="/account/login">
                        {t.landing.getStarted}
                        <ArrowRight />
                    </Link>
                </Button>
            </section>
        </div>
    );
}
