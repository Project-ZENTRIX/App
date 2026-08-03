import { Button } from "@workspace/ui/components/button";
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table";
import { cn } from "@workspace/ui/lib/utils";

import { Check, X, Sparkles, Zap, Crown, Leaf } from "lucide-react";

function PricingCards() {
    const plans = [
        {
            name: "Lunium",
            price: "¥0",
            period: "Free forever",
            description: "Ideal for beginners exploring programming for the first time",
            icon: Leaf,
            features: [
                "Introductory and foundational packages",
                "Basic code execution quota",
                "Standard progress tracking",
                "Core Desktop editor and runner experience",
            ],
            buttonText: "Get Started",
            highlighted: false,
            style: {
                text: "text-emerald-500",
                button: [
                    "text-emerald-600 hover:text-emerald-500 dark:text-emerald-500 dark:hover:text-emerald-400",
                    "bg-emerald-500  hover:bg-emerald-600 text-background dark:text-foreground",
                ],
            },
        },
        {
            name: "Velium",
            price: "¥29",
            period: "/ month",
            description: "For learners who need more content and higher usage limits",
            icon: Zap,
            features: [
                "Introductory and intermediate packages",
                "Higher code execution quota",
                "Full progress synchronisation",
                "Basic offline learning support",
                "Ability to purchase additional packages",
            ],
            buttonText: "Choose Velium",
            highlighted: false,
            style: {
                text: "text-blue-500",
                button: [
                    "text-blue-600 hover:text-blue-500 dark:text-blue-500 dark:hover:text-blue-400",
                    "bg-blue-500  hover:bg-blue-600 text-background dark:text-foreground",
                ],
            },
        },
        {
            name: "Cyrum",
            price: "¥59",
            period: "/ month",
            description: "For regular users seeking broader content and a better experience",
            icon: Sparkles,
            features: [
                "Beginner to advanced + PBL packages",
                "High execution quota and longer sessions",
                "Priority access to new content",
                "Enhanced offline capability",
                "Basic AI dialogue assistance (BYOK)",
            ],
            buttonText: "Choose Cyrum",
            highlighted: true,
            style: {
                text: "text-violet-500",
                button: [
                    "text-violet-600 hover:text-violet-500 dark:text-violet-500 dark:hover:text-violet-400",
                    "bg-violet-500  hover:bg-violet-600 text-background dark:text-foreground",
                ],
            },
        },
        {
            name: "Zenium",
            price: "¥99",
            period: "/ month",
            description: "Complete platform experience for power users and long-term learners",
            icon: Crown,
            features: [
                "Unrestricted access to all self-developed packages",
                "Maximum execution capacity",
                "Highest-priority support",
                "Full AI assistance (BYOK) + higher limits",
                "Full Desktop IDE enhancements and exclusive features",
            ],
            buttonText: "Choose Zenium",
            highlighted: false,
            style: {
                text: "text-amber-500",
                button: [
                    "text-amber-600 hover:text-amber-500 dark:text-amber-500 dark:hover:text-amber-400",
                    "bg-amber-500 hover:bg-amber-600 text-background dark:text-foreground",
                ],
            },
        },
    ];

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
                    <Button
                        className={cn("w-full", plan.highlighted ? plan.style.button[1] : plan.style.button[0])}
                        variant={plan.highlighted ? "default" : "outline"}>
                        {plan.buttonText}
                    </Button>
                </CardFooter>
            </Card>
        );
    });
}

function PricingComparisonTable() {
    const tiers = ["Lunium", "Velium", "Cyrum", "Zenium"] as const;

    type Tier = (typeof tiers)[number];

    type FeatureValue = boolean | string;

    interface FeatureRow {
        name: string;
        values: Record<Tier, FeatureValue>;
    }

    const features: FeatureRow[] = [
        {
            name: "Introductory & foundational packages",
            values: { Lunium: true, Velium: true, Cyrum: true, Zenium: true },
        },
        {
            name: "Intermediate packages",
            values: { Lunium: false, Velium: true, Cyrum: true, Zenium: true },
        },
        {
            name: "Advanced & PBL packages",
            values: { Lunium: false, Velium: false, Cyrum: true, Zenium: true },
        },
        {
            name: "Exclusive / early-access packages",
            values: { Lunium: false, Velium: false, Cyrum: false, Zenium: true },
        },
        {
            name: "Full library of self-developed packages",
            values: { Lunium: false, Velium: false, Cyrum: false, Zenium: true },
        },
        {
            name: "Daily code execution quota",
            values: {
                Lunium: "Low",
                Velium: "Medium",
                Cyrum: "High",
                Zenium: "Maximum",
            },
        },
        {
            name: "Standard progress tracking & feedback",
            values: { Lunium: true, Velium: true, Cyrum: true, Zenium: true },
        },
        {
            name: "Enhanced feedback & learning insights",
            values: {
                Lunium: false,
                Velium: false,
                Cyrum: "Limited",
                Zenium: true,
            },
        },
        {
            name: "Basic offline learning support",
            values: {
                Lunium: "Limited",
                Velium: true,
                Cyrum: true,
                Zenium: true,
            },
        },
        {
            name: "Advanced offline & local project features",
            values: {
                Lunium: false,
                Velium: false,
                Cyrum: "Limited",
                Zenium: true,
            },
        },
        {
            name: "Purchase individual packages",
            values: {
                Lunium: "Limited",
                Velium: true,
                Cyrum: true,
                Zenium: true,
            },
        },
        {
            name: "Priority access to new content",
            values: { Lunium: false, Velium: false, Cyrum: true, Zenium: true },
        },
        {
            name: "AI dialogue assistance (BYOK)",
            values: {
                Lunium: false,
                Velium: false,
                Cyrum: "Basic",
                Zenium: "Full + higher limits",
            },
        },
        {
            name: "Priority technical support",
            values: {
                Lunium: false,
                Velium: false,
                Cyrum: false,
                Zenium: "Highest",
            },
        },
        {
            name: "Achievement, badge & level system",
            values: {
                Lunium: "Basic",
                Velium: true,
                Cyrum: true,
                Zenium: "Full + exclusive",
            },
        },
        {
            name: "Detailed learning analytics (Web)",
            values: {
                Lunium: false,
                Velium: false,
                Cyrum: "Limited",
                Zenium: true,
            },
        },
        {
            name: "Advanced Desktop IDE enhancements",
            values: {
                Lunium: false,
                Velium: false,
                Cyrum: false,
                Zenium: true,
            },
        },
        {
            name: "Third-party content discounts",
            values: { Lunium: false, Velium: false, Cyrum: false, Zenium: true },
        },
    ];

    function CellContent({ value }: { value: FeatureValue }) {
        if (typeof value === "boolean") {
            return value ? (
                <Check className="text-primary mx-auto h-4 w-4" />
            ) : (
                <X className="text-muted-foreground/50 mx-auto h-4 w-4" />
            );
        }

        return <span className="text-muted-foreground text-sm">{value}</span>;
    }

    return (
        <div className="bg-background/50 w-full overflow-x-auto rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-70 min-w-55">Feature</TableHead>
                        {tiers.map((tier) => (
                            <TableHead key={tier} className={cn("min-w-25 text-center", tier === "Cyrum" && "bg-primary/5")}>
                                {tier}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {features.map((feature) => (
                        <TableRow key={feature.name}>
                            <TableCell className="font-medium">{feature.name}</TableCell>
                            {tiers.map((tier) => (
                                <TableCell key={tier} className={cn("text-center", tier === "Cyrum" && "bg-primary/5")}>
                                    <CellContent value={feature.values[tier]} />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

export default function Page() {
    return (
        <div className="w-full">
            <section
                id="_zentrix.comp-content"
                className="flex min-h-screen w-full flex-col items-center justify-start gap-12 px-32 py-32">
                <h3 className="text-3xl">View Our Affordable Pricing</h3>
                <div className="grid w-full grid-cols-4 gap-8">
                    <PricingCards />
                </div>

                <h3 className="mt-12 text-3xl">Comparing Plans</h3>
                <PricingComparisonTable />
            </section>
        </div>
    );
}
