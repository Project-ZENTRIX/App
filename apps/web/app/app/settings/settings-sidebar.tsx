"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@workspace/ui/lib/utils";
import { useDictionary } from "@/lib/i18n";

export function SettingsSidebar() {
    const pathname = usePathname();
    const t = useDictionary();
    const normalizedPathname = pathname.replace(/^\/app\/(?:student|teacher|admin)\/settings/, "/app/settings");
    const items = [
        { href: "/app/settings/profile", label: t.portal.profile },
        { href: "/app/settings/security", label: t.portal.security },
        { href: "/app/settings/notifications", label: t.portal.notifications },
        { href: "/app/settings/sessions", label: t.portal.sessionsTab },
    ];

    return (
        <aside className="border-border/60 bg-muted/20 rounded-xl border p-3 lg:w-72">
            <div className="border-border/60 bg-background rounded-lg border px-3 py-3">
                <div className="text-muted-foreground text-xs tracking-[0.24em] uppercase">{t.portal.settingsTitle}</div>
                <div className="mt-1 text-sm font-medium">{t.shell.profilePasswordAndSessions}</div>
            </div>

            <nav aria-label={t.portal.settingsTitle} className="mt-3 grid gap-1">
                {items.map((item) => {
                    const active = normalizedPathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-current={active ? "page" : undefined}
                            className={cn(
                                "hover:bg-muted/70 rounded-lg px-3 py-2 text-sm transition-colors",
                                active && "bg-primary text-primary-foreground hover:bg-primary/90"
                            )}>
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
