"use client";

import { useEffect, useState } from "react";

import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { getCurrentAccount, updateProfile, type UserProfile } from "@/lib/api/endpoints/auth-api";
import { toast } from "sonner";

export default function ProfileSettingsPage() {
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
                toast.error(error instanceof Error ? error.message : "Unable to load profile");
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
            toast.success("Profile updated");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update profile");
        } finally {
            setPending(false);
        }
    };

    return (
        <Card className="border-0 shadow-none">
            <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Edit your public name, avatar, and bio.</CardDescription>
            </CardHeader>
            <CardContent>
                <form className="grid gap-4 md:max-w-2xl" onSubmit={handleSubmit}>
                    <label className="grid gap-2">
                        <span className="text-sm font-medium">Name</span>
                        <Input
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder={user?.email ?? "Enter a name"}
                        />
                    </label>
                    <label className="grid gap-2">
                        <span className="text-sm font-medium">Avatar URL</span>
                        <Input value={image} onChange={(event) => setImage(event.target.value)} placeholder="https://" />
                    </label>
                    <label className="grid gap-2">
                        <span className="text-sm font-medium">Bio</span>
                        <Textarea
                            value={bio}
                            onChange={(event) => setBio(event.target.value)}
                            placeholder="Write a short bio about what you're doing now"
                        />
                    </label>
                    <div>
                        <Button type="submit" disabled={pending}>
                            {pending ? "Saving..." : "Save profile"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
