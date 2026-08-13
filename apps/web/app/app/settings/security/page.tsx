"use client";

import { useState } from "react";

import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { updatePassword } from "@/lib/api/endpoints/auth-api";
import { toast } from "sonner";

export default function SecuritySettingsPage() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [pending, setPending] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error("New password and confirmation do not match");
            return;
        }

        setPending(true);
        try {
            await updatePassword({ currentPassword, newPassword });
            toast.success("Password updated");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update password");
        } finally {
            setPending(false);
        }
    };

    return (
        <Card className="border-0 shadow-none">
            <CardHeader>
                <CardTitle>Password change</CardTitle>
                <CardDescription>Update your sign-in password to keep the account secure.</CardDescription>
            </CardHeader>
            <CardContent>
                <form className="grid gap-4 md:max-w-2xl" onSubmit={handleSubmit}>
                    <label className="grid gap-2">
                        <span className="text-sm font-medium">Current password</span>
                        <Input
                            type="password"
                            autoComplete="current-password"
                            value={currentPassword}
                            onChange={(event) => setCurrentPassword(event.target.value)}
                        />
                    </label>
                    <label className="grid gap-2">
                        <span className="text-sm font-medium">New password</span>
                        <Input
                            type="password"
                            autoComplete="new-password"
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                        />
                    </label>
                    <label className="grid gap-2">
                        <span className="text-sm font-medium">Confirm new password</span>
                        <Input
                            type="password"
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                        />
                    </label>
                    <div>
                        <Button type="submit" disabled={pending}>
                            {pending ? "Updating..." : "Update password"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
