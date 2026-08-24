"use client";

import { useDictionary } from "@/lib/i18n";
import { SettingsSidebar } from "./settings-sidebar";

export default function SettingsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const t = useDictionary();

    return (
        <div className="flex min-h-full flex-col gap-4">
            <header className="border-border/60 bg-muted/20 flex flex-wrap items-start justify-between gap-4 rounded-xl border p-4">
                <div>
                    <div className="text-muted-foreground text-xs tracking-wide uppercase">{t.portal.settingsTitle}</div>
                    <h1 className="mt-1 text-xl font-semibold">{t.portal.settingsTitle}</h1>
                </div>
            </header>

            <div className="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
                <SettingsSidebar />
                <section className="min-w-0">{children}</section>
            </div>
        </div>
    );
}
