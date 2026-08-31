import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";
import { Badge } from "@shared/ui/components/badge";
import { Button } from "@shared/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/ui/components/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@shared/ui/components/table";

export type Metric = {
    label: string;
    value: string;
    detail: string;
    tone?: "default" | "success" | "warning" | "destructive";
};

export type Row = string[];

export type SectionTable = {
    columns: string[];
    rows: Row[];
};

export function PageHeader({
    eyebrow,
    title,
    description,
    actions,
}: {
    eyebrow: string;
    title: string;
    description: string;
    actions?: ReactNode;
}) {
    return (
        <div className="border-border/60 flex flex-col gap-4 border-b pb-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
                <p className="text-muted-foreground text-sm font-medium tracking-[0.2em] uppercase">{eyebrow}</p>
                <div className="space-y-1">
                    <h1 className="text-foreground text-2xl font-semibold tracking-tight">{title}</h1>
                    <p className="text-muted-foreground max-w-3xl text-sm">{description}</p>
                </div>
            </div>
            {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
    );
}

export function MetricGrid({ metrics }: { metrics: Metric[] }) {
    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
                <Card key={metric.label} size="sm" className="border-border/70 shadow-none">
                    <CardHeader className="space-y-2 pb-3">
                        <CardDescription>{metric.label}</CardDescription>
                        <CardTitle className="text-2xl">{metric.value}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Badge
                            variant={
                                metric.tone === "success"
                                    ? "default"
                                    : metric.tone === "warning"
                                      ? "secondary"
                                      : metric.tone === "destructive"
                                        ? "destructive"
                                        : "outline"
                            }
                            className="rounded-md px-2 py-0.5 text-xs">
                            {metric.detail}
                        </Badge>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export function SimpleTable({ columns, rows }: SectionTable) {
    return (
        <div className="overflow-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        {columns.map((column) => (
                            <TableHead key={column}>{column}</TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row, rowIndex) => (
                        <TableRow key={`${row[0]}-${rowIndex}`}>
                            {row.map((cell, cellIndex) => (
                                <TableCell key={`${rowIndex}-${cellIndex}`}>{cell}</TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

export function Panel({
    title,
    description,
    action,
    children,
}: {
    title: string;
    description: string;
    action?: ReactNode;
    children: ReactNode;
}) {
    return (
        <Card className="border-border/70 shadow-none">
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-3">
                <div className="space-y-1">
                    <CardTitle className="text-base">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </div>
                {action}
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}

export function QuickAction({
    title,
    description,
    icon,
    href,
}: {
    title: string;
    description: string;
    icon: ReactNode;
    href: string;
}) {
    return (
        <Button asChild variant="outline" className="h-auto justify-start gap-3 px-3 py-3 text-left">
            <Link to={href}>
                <span className="bg-muted text-foreground flex size-9 items-center justify-center rounded-lg">{icon}</span>
                <span className="flex min-w-0 flex-col items-start gap-0.5">
                    <span className="text-sm font-medium">{title}</span>
                    <span className="text-muted-foreground text-xs font-normal">{description}</span>
                </span>
                <ArrowRightIcon className="text-muted-foreground ml-auto size-4" />
            </Link>
        </Button>
    );
}

export function TextList({
    items,
}: {
    items: { title: string; detail: string; tone?: "default" | "success" | "warning" | "destructive" }[];
}) {
    return (
        <div className="space-y-3">
            {items.map((item) => (
                <div
                    key={item.title}
                    className="border-border/60 flex items-start justify-between gap-4 rounded-lg border px-3 py-2.5">
                    <div className="min-w-0">
                        <p className="text-foreground text-sm font-medium">{item.title}</p>
                        <p className="text-muted-foreground text-sm">{item.detail}</p>
                    </div>
                    <Badge
                        variant={
                            item.tone === "success"
                                ? "default"
                                : item.tone === "warning"
                                  ? "secondary"
                                  : item.tone === "destructive"
                                    ? "destructive"
                                    : "outline"
                        }
                        className="rounded-md px-2 py-0.5 text-xs">
                        {item.tone ?? "open"}
                    </Badge>
                </div>
            ))}
        </div>
    );
}
