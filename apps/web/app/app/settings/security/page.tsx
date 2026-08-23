"use client";

import { useState } from "react";

import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { updatePassword } from "@/lib/supabase/auth-queries";
import { useLocale } from "@/lib/i18n";
import { toast } from "sonner";

const copy = {
    "zh-CN": {
        title: "密码修改",
        description: "更新你的登录密码，保持账号安全。",
        currentPassword: "当前密码",
        newPassword: "新密码",
        confirmPassword: "确认新密码",
        save: "更新密码",
        saving: "正在更新...",
        mismatch: "新密码和确认密码不一致",
        updated: "密码已更新",
        loadError: "无法更新密码",
        updateError: "无法更新密码",
    },
    "en-GB": {
        title: "Password change",
        description: "Update your sign-in password to keep the account secure.",
        currentPassword: "Current password",
        newPassword: "New password",
        confirmPassword: "Confirm new password",
        save: "Update password",
        saving: "Updating...",
        mismatch: "New password and confirmation do not match",
        updated: "Password updated",
        loadError: "Unable to load password settings",
        updateError: "Failed to update password",
    },
} as const;

export default function SecuritySettingsPage() {
    const locale = useLocale();
    const text = copy[locale];
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [pending, setPending] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error(text.mismatch);
            return;
        }

        setPending(true);
        try {
            await updatePassword({ currentPassword, newPassword });
            toast.success(text.updated);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : text.updateError);
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
                <form className="grid gap-4 md:max-w-2xl" onSubmit={handleSubmit}>
                    <label className="grid gap-2">
                        <span className="text-sm font-medium">{text.currentPassword}</span>
                        <Input
                            type="password"
                            autoComplete="current-password"
                            value={currentPassword}
                            onChange={(event) => setCurrentPassword(event.target.value)}
                        />
                    </label>
                    <label className="grid gap-2">
                        <span className="text-sm font-medium">{text.newPassword}</span>
                        <Input
                            type="password"
                            autoComplete="new-password"
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                        />
                    </label>
                    <label className="grid gap-2">
                        <span className="text-sm font-medium">{text.confirmPassword}</span>
                        <Input
                            type="password"
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                        />
                    </label>
                    <div>
                        <Button type="submit" disabled={pending}>
                            {pending ? text.saving : text.save}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
