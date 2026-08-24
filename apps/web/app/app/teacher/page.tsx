"use client";

import Link from "next/link";
import { ArrowRight, Files, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { useLocale } from "@/lib/i18n";

export default function TeacherHomePage() {
    const locale = useLocale();
    const title = locale === "zh-CN" ? "教师工作台" : "Teacher workspace";
    const description =
        locale === "zh-CN"
            ? "管理课包、审阅发布和控制内容边界的入口。"
            : "The place to manage packs, review releases, and control content boundaries.";

    return (
        <section className="flex min-h-full flex-col gap-5">
            <header className="border-border/60 bg-muted/20 flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5">
                <div className="min-w-0">
                    <div className="text-muted-foreground text-xs tracking-[0.28em] uppercase">{title}</div>
                    <h1 className="mt-1 text-2xl font-semibold">{title}</h1>
                    <p className="text-muted-foreground mt-1 text-sm">{description}</p>
                </div>
                <Button asChild>
                    <Link href="/app/teacher/content-packs">
                        {locale === "zh-CN" ? "进入课包" : "Open content packs"}
                        <ArrowRight className="size-4" />
                    </Link>
                </Button>
            </header>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Files className="size-4" />
                            {locale === "zh-CN" ? "课包" : "Content packs"}
                        </CardTitle>
                        <CardDescription>
                            {locale === "zh-CN" ? "查看与整理课包文件。" : "Inspect and organize pack files."}
                        </CardDescription>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Sparkles className="size-4" />
                            {locale === "zh-CN" ? "发布审阅" : "Release review"}
                        </CardTitle>
                        <CardDescription>
                            {locale === "zh-CN" ? "准备后续审批流。" : "Prepare the next approval flow."}
                        </CardDescription>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <ShieldCheck className="size-4" />
                            {locale === "zh-CN" ? "权限边界" : "Permissions"}
                        </CardTitle>
                        <CardDescription>
                            {locale === "zh-CN" ? "只暴露教师可见内容。" : "Show only teacher-visible content."}
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{locale === "zh-CN" ? "下一步" : "Next"}</CardTitle>
                    <CardDescription>
                        {locale === "zh-CN"
                            ? "教师内容会先集中在课包管理页面。"
                            : "Teacher-facing content starts in the content pack manager."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild variant="outline">
                        <Link href="/app/teacher/content-packs">
                            {locale === "zh-CN" ? "打开课包列表" : "Open content pack list"}
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </section>
    );
}
