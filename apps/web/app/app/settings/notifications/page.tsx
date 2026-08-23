"use client";

import { useEffect, useState } from "react";

import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Switch } from "@workspace/ui/components/switch";
import {
    getNotificationPreferences,
    updateNotificationPreferences,
    type NotificationPreferences,
} from "@/lib/supabase/auth-queries";
import { useLocale } from "@/lib/i18n";
import { toast } from "sonner";

const preferenceItems = [{ key: "email" }, { key: "sms" }, { key: "inApp" }] as const satisfies Array<{
    key: keyof NotificationPreferences;
}>;

const copy = {
    "zh-CN": {
        title: "通知",
        description: "按渠道控制你想接收的提醒类型。",
        save: "保存设置",
        saving: "正在保存...",
        loadError: "无法加载通知设置",
        saveError: "无法保存通知设置",
        saved: "通知设置已保存",
        email: "邮件通知",
        emailDesc: "通过邮件接收产品公告和账号提醒",
        sms: "短信通知",
        smsDesc: "通过短信接收高优先级提醒",
        inApp: "站内通知",
        inAppDesc: "在产品内显示即时提醒",
    },
    "en-GB": {
        title: "Notifications",
        description: "Control which reminder types you want by channel.",
        save: "Save settings",
        saving: "Saving...",
        loadError: "Unable to load notification settings",
        saveError: "Failed to save notification settings",
        saved: "Notification settings saved",
        email: "Email notifications",
        emailDesc: "Receive product announcements and account reminders by email",
        sms: "SMS notifications",
        smsDesc: "Receive high-priority reminders by SMS",
        inApp: "In-app notifications",
        inAppDesc: "Show instant reminders inside the product",
    },
} as const;

export default function NotificationSettingsPage() {
    const locale = useLocale();
    const text = copy[locale];
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
                toast.error(error instanceof Error ? error.message : text.loadError);
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
            toast.success(text.saved);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : text.saveError);
        } finally {
            setPending(false);
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
                    {preferenceItems.map((item) => (
                        <label
                            key={item.key}
                            className="border-border/60 bg-background flex items-center justify-between gap-4 rounded-lg border p-4">
                            <div>
                                <div className="text-sm font-medium">
                                    {item.key === "email" ? text.email : item.key === "sms" ? text.sms : text.inApp}
                                </div>
                                <div className="text-muted-foreground text-sm">
                                    {item.key === "email" ? text.emailDesc : item.key === "sms" ? text.smsDesc : text.inAppDesc}
                                </div>
                            </div>
                            <Switch
                                disabled={item.key === "sms"}
                                checked={preferences[item.key]}
                                onCheckedChange={(checked) =>
                                    setPreferences((current) => ({ ...current, [item.key]: checked }))
                                }
                            />
                        </label>
                    ))}
                    <div>
                        <Button type="button" onClick={handleSave} disabled={pending}>
                            {pending ? text.saving : text.save}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
