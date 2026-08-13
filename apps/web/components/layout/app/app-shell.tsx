"use client";

import { useState } from "react";
import { HomeNavBar } from "../nav-bar";
import { LeftRail } from "./left-rail";
import { RightRail } from "./right-rail";

export function AppShell({ children }: { children: React.ReactNode }) {
    const [isLeftRailCollapsed, setIsLeftRailCollapsed] = useState(false);

    return (
        <div className="bg-background text-foreground flex h-dvh w-full flex-col overflow-hidden">
            <section className="sticky top-4 z-20 w-full shrink-0 px-8">
                <HomeNavBar />
            </section>

            <main className="mt-4 flex min-h-0 flex-1 overflow-hidden px-4 py-4 sm:px-6 lg:px-8">
                <div className="flex min-h-0 w-full items-stretch gap-4 overflow-hidden">
                    <LeftRail
                        collapsed={isLeftRailCollapsed}
                        onToggleAction={() => setIsLeftRailCollapsed((value) => !value)}
                    />

                    <section className="border-border/70 bg-background min-h-0 flex-1 overflow-hidden rounded-xl border">
                        <div className="h-full min-h-0 overflow-y-auto p-4">{children}</div>
                    </section>

                    <div className="h-full w-80 shrink-0 overflow-hidden">
                        <RightRail />
                    </div>
                </div>
            </main>
        </div>
    );
}
