"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { useLocale } from "@/lib/i18n";

export default function AdminShellPage() {
    const locale = useLocale();
    const title = locale === "zh-CN" ? "管理员中心" : "Admin centre";
    const description =
        locale === "zh-CN" ? "管理员相关功能与入口会集中在这里。" : "Admin-facing tools and entry points are grouped here.";

    return (
        <section className="flex min-h-full flex-col gap-5">
            <header className="border-border/60 bg-muted/20 flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5">
                <div className="min-w-0">
                    <div className="text-muted-foreground text-xs tracking-[0.28em] uppercase">{title}</div>
                    <h1 className="mt-1 text-2xl font-semibold">{title}</h1>
                    <p className="text-muted-foreground mt-1 text-sm">{description}</p>
                </div>
                <Badge variant="secondary">{locale === "zh-CN" ? "壳子" : "Shell"}</Badge>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>{locale === "zh-CN" ? "管理入口" : "Management hub"}</CardTitle>
                    <CardDescription>
                        {locale === "zh-CN"
                            ? "用于进入租户、审计、发布与角色管理。"
                            : "Use this area to reach tenant, audit, release, and role management."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-muted-foreground text-sm">
                    {locale === "zh-CN"
                        ? "管理员可以在这里查看和切换相关管理功能。"
                        : "Admins can review and switch between the related management tools here."}
                </CardContent>
            </Card>
        </section>
    );
}
