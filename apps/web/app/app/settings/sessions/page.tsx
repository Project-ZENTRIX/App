"use client";

import { useEffect, useState } from "react";

import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { revokeSession, listSessions, type SessionItem } from "@/lib/api/endpoints/auth-api";
import { useLocale } from "@/lib/i18n";
import { toast } from "sonner";

const copy = {
    "zh-CN": {
        title: "会话",
        description: "查看当前登录会话，并撤销你不再使用的设备。",
        loadError: "无法加载会话",
        revoked: "会话已撤销",
        revokeError: "无法撤销会话",
        unknownDevice: "未知设备",
        created: "创建于",
        expires: "到期于",
        revoke: "撤销会话",
        revoking: "正在撤销...",
        empty: "暂时没有会话。",
    },
    "en-GB": {
        title: "Sessions",
        description: "Review current sign-in sessions and revoke devices you no longer use.",
        loadError: "Unable to load sessions",
        revoked: "Session revoked",
        revokeError: "Failed to revoke session",
        unknownDevice: "Unknown device",
        created: "Created",
        expires: "Expires",
        revoke: "Revoke session",
        revoking: "Revoking...",
        empty: "No sessions yet.",
    },
} as const;

function formatDateTime(value: string, locale = "en-GB") {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

export default function SessionsSettingsPage() {
    const locale = useLocale();
    const text = copy[locale];
    const [sessions, setSessions] = useState<SessionItem[]>([]);
    const [pendingId, setPendingId] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        const loadSessions = async () => {
            try {
                const data = await listSessions();
                if (!active) {
                    return;
                }

                setSessions(data.sessions);
            } catch (error) {
                toast.error(error instanceof Error ? error.message : text.loadError);
            }
        };

        void loadSessions();

        return () => {
            active = false;
        };
    }, []);

    const handleRevoke = async (sessionId: string) => {
        setPendingId(sessionId);
        try {
            await revokeSession(sessionId);
            setSessions((current) => current.filter((item) => item.id !== sessionId));
            toast.success(text.revoked);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : text.revokeError);
        } finally {
            setPendingId(null);
        }
    };

    return (
        <Card className="border-0 shadow-none">
            <CardHeader>
                <CardTitle>{text.title}</CardTitle>
                <CardDescription>{text.description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-3">
                    {sessions.map((session) => (
                        <div
                            key={session.id}
                            className="border-border/60 bg-background flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
                            <div className="min-w-0">
                                <div className="text-sm font-medium">{session.userAgent ?? text.unknownDevice}</div>
                                <div className="text-muted-foreground text-sm">
                                    {text.created}: {formatDateTime(session.createdAt, locale)}
                                </div>
                                <div className="text-muted-foreground text-sm">
                                    {text.expires}: {formatDateTime(session.expiresAt, locale)}
                                </div>
                            </div>
                            <Button
                                variant="destructive"
                                type="button"
                                disabled={pendingId === session.id}
                                onClick={() => void handleRevoke(session.id)}>
                                {pendingId === session.id ? text.revoking : text.revoke}
                            </Button>
                        </div>
                    ))}
                    {!sessions.length ? (
                        <div className="text-muted-foreground rounded-lg border border-dashed p-4 text-sm">{text.empty}</div>
                    ) : null}
                </div>
            </CardContent>
        </Card>
    );
}
