"use client";

import { useEffect, useState } from "react";

import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Switch } from "@workspace/ui/components/switch";
import {
    getNotificationPreferences,
    updateNotificationPreferences,
    type NotificationPreferences,
} from "@/lib/api/endpoints/auth-api";
import { toast } from "sonner";

const preferenceItems = [
    { key: "email", title: "Email notifications", description: "Receive product announcements and account reminders by email" },
    { key: "sms", title: "SMS notifications", description: "Receive high-priority reminders by SMS" },
    { key: "inApp", title: "In-app notifications", description: "Show instant reminders inside the product" },
] as const;

export default function NotificationSettingsPage() {
    const [preferences, setPreferences] = useState<NotificationPreferences>({ email: true, sms: false, inApp: true });
    const [pending, setPending] = useState(false);

    useEffect(() => {
        let active = true;

        const loadPreferences = async () => {
            try {
                const data = await getNotificationPreferences();
                if (!active) {
                    return;
                }

                setPreferences(data);
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Unable to load notification settings");
            }
        };

        void loadPreferences();

        return () => {
            active = false;
        };
    }, []);

    const handleSave = async () => {
        setPending(true);
        try {
            const data = await updateNotificationPreferences(preferences);
            setPreferences(data);
            toast.success("Notification settings saved");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to save notification settings");
        } finally {
            setPending(false);
        }
    };

    return (
        <Card className="border-0 shadow-none">
            <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Control which reminder types you want by channel.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-3">
                    {preferenceItems.map((item) => (
                        <label
                            key={item.key}
                            className="border-border/60 bg-background flex items-center justify-between gap-4 rounded-lg border p-4">
                            <div>
                                <div className="text-sm font-medium">{item.title}</div>
                                <div className="text-muted-foreground text-sm">{item.description}</div>
                            </div>
                            <Switch
                                checked={preferences[item.key]}
                                onCheckedChange={(checked) =>
                                    setPreferences((current) => ({ ...current, [item.key]: checked }))
                                }
                            />
                        </label>
                    ))}
                    <div>
                        <Button type="button" onClick={handleSave} disabled={pending}>
                            {pending ? "Saving..." : "Save settings"}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
