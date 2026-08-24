"use client";

import { useEffect, useState } from "react";

import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { getCurrentAccount, updateProfile, type UserProfile } from "@/lib/supabase/auth-queries";
import { useLocale } from "@/lib/i18n";
import { toast } from "sonner";

const copy = {
    "zh-CN": {
        title: "资料",
        description: "编辑你的公开名称、头像和简介。",
        name: "名称",
        avatarUrl: "头像 URL",
        bio: "简介",
        save: "保存资料",
        saving: "正在保存...",
        loadError: "无法加载资料",
        updateError: "无法更新资料",
        placeholder: "你的资料名称",
        bioPlaceholder: "简单写一句，介绍你正在做什么",
        updated: "资料已更新",
    },
    "en-GB": {
        title: "Profile",
        description: "Edit your public name, avatar, and bio.",
        name: "Name",
        avatarUrl: "Avatar URL",
        bio: "Bio",
        save: "Save profile",
        saving: "Saving...",
        loadError: "Unable to load profile",
        updateError: "Failed to update profile",
        placeholder: "Your profile name",
        bioPlaceholder: "Add a short bio about your current work",
        updated: "Profile updated",
    },
} as const;

export default function ProfileSettingsPage() {
    const locale = useLocale();
    const text = copy[locale];
    const [user, setUser] = useState<UserProfile | null>(null);
    const [name, setName] = useState("");
    const [image, setImage] = useState("");
    const [bio, setBio] = useState("");
    const [pending, setPending] = useState(false);

    useEffect(() => {
        let active = true;

        const loadProfile = async () => {
            try {
                const account = await getCurrentAccount();
                if (!active) {
                    return;
                }

                setUser(account.user);
                setName(account.user.name ?? "");
                setImage(account.user.image ?? "");
                setBio(account.user.userProfile?.bio ?? "");
            } catch (error) {
                toast.error(error instanceof Error ? error.message : text.loadError);
            }
        };

        void loadProfile();

        return () => {
            active = false;
        };
    }, []);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setPending(true);

        try {
            const result = await updateProfile({
                name: name.trim() || undefined,
                image: image.trim() || null,
                bio: bio.trim() || null,
            });
            setUser(result.user);
            toast.success(text.updated);
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
                        <span className="text-sm font-medium">{text.name}</span>
                        <Input value={name} onChange={(event) => setName(event.target.value)} />
                    </label>
                    <label className="grid gap-2">
                        <span className="text-sm font-medium">{text.avatarUrl}</span>
                        <Input value={image} onChange={(event) => setImage(event.target.value)} />
                    </label>
                    <label className="grid gap-2">
                        <span className="text-sm font-medium">{text.bio}</span>
                        <Textarea value={bio} onChange={(event) => setBio(event.target.value)} />
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
