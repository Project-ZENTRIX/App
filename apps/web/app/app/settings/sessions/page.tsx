"use client";

import { useEffect, useState } from "react";

import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { revokeSession, listSessions, type SessionItem } from "@/lib/api/endpoints/auth-api";
import { toast } from "sonner";

function formatDateTime(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

export default function SessionsSettingsPage() {
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
                toast.error(error instanceof Error ? error.message : "Unable to load sessions");
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
            toast.success("Session revoked");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to revoke session");
        } finally {
            setPendingId(null);
        }
    };

    return (
        <Card className="border-0 shadow-none">
            <CardHeader>
                <CardTitle>Sessions</CardTitle>
                <CardDescription>Review current sign-in sessions and revoke devices you no longer use.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-3">
                    {sessions.map((session) => (
                        <div
                            key={session.id}
                            className="border-border/60 bg-background flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
                            <div className="min-w-0">
                                <div className="text-sm font-medium">{session.userAgent ?? "Unknown device"}</div>
                                <div className="text-muted-foreground text-sm">
                                    Created: {formatDateTime(session.createdAt)}
                                </div>
                                <div className="text-muted-foreground text-sm">
                                    Expires: {formatDateTime(session.expiresAt)}
                                </div>
                            </div>
                            <Button
                                variant="destructive"
                                type="button"
                                disabled={pendingId === session.id}
                                onClick={() => void handleRevoke(session.id)}>
                                {pendingId === session.id ? "Revoking..." : "Revoke session"}
                            </Button>
                        </div>
                    ))}
                    {!sessions.length ? (
                        <div className="text-muted-foreground rounded-lg border border-dashed p-4 text-sm">
                            No sessions yet.
                        </div>
                    ) : null}
                </div>
            </CardContent>
        </Card>
    );
}
