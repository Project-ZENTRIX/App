"use client";

import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { useRouter } from "next/navigation";
import { LocaleSwitcher, useDictionary } from "@/lib/i18n";
import { AccountNavModule } from "./account-in-nav";

export function HomeNavBar() {
    const { push } = useRouter();
    const t = useDictionary();

    const navBarItems = [
        {
            label: t.navigation.home,
            href: "/",
        },
        {
            label: t.navigation.pricing,
            href: "/pricing",
        },
        {
            label: t.navigation.faq,
            href: "/faq",
        },
    ];

    return (
        <div className="flex h-16 w-full items-center justify-center">
            <nav className="border-accent bg-accent/25 flex h-full w-full items-center rounded-xl border px-4 backdrop-blur-sm">
                <span className="font-mono text-xl font-bold">{t.appName}</span>

                <section className="ml-auto flex items-center gap-4">
                    {navBarItems.map((item) => (
                        <Button key={item.href} variant="ghost" className="text-foreground/75" onClick={() => push(item.href)}>
                            {item.label}
                        </Button>
                    ))}
                </section>

                <Separator className="mx-4 my-3" orientation="vertical" />

                <section className="flex items-center gap-2">
                    <LocaleSwitcher />
                    <AccountNavModule />
                </section>
            </nav>
        </div>
    );
}
