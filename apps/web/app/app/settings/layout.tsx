"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@workspace/ui/components/button";
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { useDictionary } from "@/lib/i18n";

export default function SettingsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const pathname = usePathname();
    const t = useDictionary();
    const tabs = [
        { href: "/app/settings/profile", label: t.portal.profile },
        { href: "/app/settings/security", label: t.portal.security },
        { href: "/app/settings/notifications", label: t.portal.notifications },
        { href: "/app/settings/sessions", label: t.portal.sessionsTab },
    ];
    const activeTab = tabs.find((item) => pathname.startsWith(item.href))?.href ?? tabs[0]?.href;

    return (
        <div className="flex min-h-full flex-col gap-4">
            <header className="border-border/60 bg-muted/20 flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4">
                <div>
                    <div className="text-muted-foreground text-xs tracking-wide uppercase">{t.portal.settingsTitle}</div>
                    <h1 className="mt-1 text-xl font-semibold">{t.portal.settingsTitle}</h1>
                </div>
                <Button asChild variant="outline">
                    <Link href="/app">{t.portal.dashboardTitle}</Link>
                </Button>
            </header>

            <Tabs value={activeTab} className="w-full gap-0">
                <TabsList className="w-full justify-start">
                    {tabs.map((item) => (
                        <TabsTrigger key={item.href} asChild value={item.href}>
                            <Link href={item.href}>{item.label}</Link>
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            <section className="border-border/60 bg-background rounded-xl border">{children}</section>
        </div>
    );
}
