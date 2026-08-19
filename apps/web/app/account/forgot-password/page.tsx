"use client";

import Link from "next/link";

import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Field, FieldGroup, FieldLabel, FieldSeparator } from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { useLocale } from "@/lib/i18n";

const copy = {
    "zh-CN": {
        title: "重置密码",
        description: "输入你的邮箱地址，我们会把重置指引发给你。",
        email: "邮箱",
        send: "发送重置链接",
        back: "返回登录",
        note: "当前版本只展示找回密码入口，后续可接入真实邮件流程。",
    },
    "en-GB": {
        title: "Reset your password",
        description: "Enter your email address and we will send reset instructions.",
        email: "Email",
        send: "Send reset link",
        back: "Back to sign in",
        note: "This page currently exposes the recovery entry point and can later connect to a real mail flow.",
    },
} as const;

export default function ForgotPasswordPage() {
    const locale = useLocale();
    const text = copy[locale];

    return (
        <div className="flex min-h-[calc(100dvh-64px)] items-center justify-center px-6 py-12">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>{text.title}</CardTitle>
                    <CardDescription>{text.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="email">{text.email}</FieldLabel>
                            <Input id="email" type="email" placeholder="m@example.com" />
                        </Field>
                        <Field>
                            <Button type="button" className="w-full">
                                {text.send}
                            </Button>
                        </Field>
                        <FieldSeparator>{text.note}</FieldSeparator>
                        <Field className="text-center">
                            <Link href="/account/login" className="text-sm underline-offset-4 hover:underline">
                                {text.back}
                            </Link>
                        </Field>
                    </FieldGroup>
                </CardContent>
            </Card>
        </div>
    );
}
