"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentAccount } from "@/lib/api/endpoints/auth-api";

export function AppWrapper({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let active = true;

        const checkAccount = async () => {
            try {
                await getCurrentAccount();
                if (active) {
                    setReady(true);
                }
            } catch {
                router.replace(`/account/login?redirect=${encodeURIComponent(pathname)}`);
            }
        };

        if (pathname.startsWith("/app")) {
            void checkAccount();
        } else {
            setTimeout(() => {
                setReady(true);
            }, 0);
        }

        return () => {
            active = false;
        };
    }, [pathname, router]);

    if (!ready && pathname.startsWith("/app")) {
        return null;
    }

    return <>{children}</>;
}
