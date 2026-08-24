"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { getCurrentAccessProfile, type AccessProfile, type AppRole } from "@/lib/api/endpoints/access-api";
import { getPreferredAppSurface, resolveAppSurface, resolveCanonicalAppPath } from "@/lib/app-routing";
import { getAuthToken } from "@/lib/supabase/auth-queries";
import { HomeNavBar } from "../nav-bar";
import { LeftRail } from "./left-rail";

function LoadingShell() {
    return (
        <div className="bg-background text-foreground flex h-dvh w-full items-center justify-center">
            <div className="border-border/70 bg-muted/20 rounded-2xl border px-5 py-4 text-sm">Loading workspace...</div>
        </div>
    );
}

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [accessProfile, setAccessProfile] = useState<AccessProfile | null>(null);
    const [loadingAccess, setLoadingAccess] = useState(true);
    const [isLeftRailCollapsed, setIsLeftRailCollapsed] = useState(false);

    useEffect(() => {
        let active = true;

        const loadAccess = async () => {
            if (!getAuthToken()) {
                router.replace("/account/login");
                return;
            }

            try {
                const profile = await getCurrentAccessProfile();
                if (!active) {
                    return;
                }

                setAccessProfile(profile);
            } catch {
                if (!active) {
                    return;
                }

                router.replace("/account/login");
                return;
            } finally {
                if (active) {
                    setLoadingAccess(false);
                }
            }
        };

        void loadAccess();

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (loadingAccess) {
            return;
        }

        const redirect = resolveCanonicalAppPath(pathname, accessProfile);
        if (redirect && redirect !== pathname) {
            router.replace(redirect);
        }
    }, [accessProfile, loadingAccess, pathname, router]);

    const preferredSurface = getPreferredAppSurface(accessProfile);
    const routeSurface = resolveAppSurface(pathname);
    const currentSurface =
        routeSurface && accessProfile?.allowedSurfaces.includes(routeSurface) ? routeSurface : preferredSurface;

    if (loadingAccess) {
        return <LoadingShell />;
    }

    return (
        <div className="bg-background text-foreground flex h-dvh w-full flex-col overflow-hidden">
            <section className="sticky top-4 z-20 w-full shrink-0 px-8">
                <HomeNavBar surface={currentSurface} />
            </section>

            <main className="mt-4 flex min-h-0 flex-1 overflow-hidden px-4 py-4 sm:px-6 lg:px-8">
                <div className="flex min-h-0 w-full items-stretch gap-4 overflow-hidden">
                    <LeftRail
                        collapsed={isLeftRailCollapsed}
                        onToggleAction={() => setIsLeftRailCollapsed((value) => !value)}
                        accessProfile={accessProfile}
                        surface={currentSurface}
                    />

                    <section className="border-border/70 bg-background min-h-0 flex-1 overflow-hidden rounded-xl border">
                        <div className="h-full min-h-0 overflow-y-auto p-4">{children}</div>
                    </section>
                </div>
            </main>
        </div>
    );
}
