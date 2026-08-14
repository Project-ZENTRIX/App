"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@workspace/ui/components/button";
import RotatingText from "@workspace/ui/components/RotatingText";
import { useDictionary } from "@/lib/i18n";

export default function Page() {
    const router = useRouter();
    const t = useDictionary();

    return (
        <section
            id="_zentrix.comp-content"
            className="flex min-h-[calc(100dvh-64px)] w-full flex-col items-start justify-center px-6 py-16 pt-8 md:px-12 lg:px-32">
            <h1 className="font-mono text-5xl">{t.appName}</h1>
            <div className="mt-8 flex flex-wrap items-center gap-4">
                <h2 className="text-3xl">{t.landing.tagline}</h2>
                <RotatingText
                    texts={[t.landing.accent, t.landing.getStarted, t.landing.readFaq]}
                    mainClassName="px-2 sm:px-2 md:px-3 bg-primary text-foreground text-3xl overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
                    staggerFrom="last"
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "-120%" }}
                    staggerDuration={0.025}
                    splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                    rotationInterval={3500}
                    splitBy="characters"
                    auto
                    loop
                />
            </div>
            <div className="mt-8 flex items-center gap-4">
                <Button variant="outline" className="p-6 text-lg" onClick={() => router.push("/account/login")}>
                    {t.landing.getStarted}
                </Button>
                <Button asChild variant="ghost" className="p-6 text-lg">
                    <Link href="/faq">{t.landing.readFaq}</Link>
                </Button>
            </div>
        </section>
    );
}
