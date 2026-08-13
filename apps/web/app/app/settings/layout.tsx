"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@workspace/ui/components/button";
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";

const tabs = [
    { href: "/app/settings/profile", label: "Profile" },
    { href: "/app/settings/security", label: "Security" },
    { href: "/app/settings/notifications", label: "Notifications" },
    { href: "/app/settings/sessions", label: "Sessions" },
];

export default function SettingsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const pathname = usePathname();
    const activeTab = tabs.find((item) => pathname.startsWith(item.href))?.href ?? tabs[0]?.href;

    return (
        <div className="flex min-h-full flex-col gap-4">
            <header className="border-border/60 bg-muted/20 flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4">
                <div>
                    <div className="text-muted-foreground text-xs tracking-wide uppercase">Settings</div>
                    <h1 className="mt-1 text-xl font-semibold">Personal Settings</h1>
                </div>
                <Button asChild variant="outline">
                    <Link href="/app">Dashboard</Link>
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
