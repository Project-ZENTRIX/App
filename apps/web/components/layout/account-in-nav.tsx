"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Settings2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { setAuthToken, getCurrentAccount, type UserProfile } from "@/lib/api/endpoints/auth-api";

function getDisplayName(user: UserProfile | null) {
    return user?.name?.trim() || user?.email || "User";
}

function getInitials(user: UserProfile | null) {
    const source = user?.name?.trim() || user?.email || "Z";
    return source
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");
}

export function AccountNavModule() {
    const { push } = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        const loadAccount = async () => {
            try {
                const account = await getCurrentAccount();
                if (!active) {
                    return;
                }

                setUser(account.user);
            } catch {
                if (!active) {
                    return;
                }

                setUser(null);
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void loadAccount();

        return () => {
            active = false;
        };
    }, []);

    const displayName = useMemo(() => getDisplayName(user), [user]);
    const initials = useMemo(() => getInitials(user), [user]);

    const handleLogout = () => {
        setAuthToken(null);
        setUser(null);
        push("/");
    };

    if (loading) {
        return <div className="border-border/60 bg-background h-9 w-32 animate-pulse rounded-lg border" />;
    }

    if (!user) {
        return (
            <div className="flex items-center gap-4">
                <Button variant="secondary" onClick={() => push("/account/login")}>
                    Login
                </Button>
                <Button onClick={() => push("/account/signup")}>Sign up</Button>
            </div>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="hover:bg-muted/70 h-10 gap-3 px-2.5">
                    <Avatar size="sm" className="size-7">
                        <AvatarImage src={user.image ?? user.userProfile?.avatarUrl ?? undefined} alt={displayName} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <span className="max-w-40 truncate text-left text-sm font-medium">{displayName}</span>
                    <ChevronDown className="text-muted-foreground size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                    <div className="grid gap-0.5">
                        <span className="truncate text-sm font-medium">{displayName}</span>
                        <span className="text-muted-foreground truncate text-xs">{user.email}</span>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/app/settings/profile">
                        <Settings2 className="size-4" />
                        Settings
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} variant="destructive">
                    <LogOut className="size-4" />
                    Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
