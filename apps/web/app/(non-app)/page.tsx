"use client";

import { useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import RotatingText from "@workspace/ui/components/RotatingText";

export default function Page() {
    const router = useRouter();

    return (
        <section
            id="_zentrix.comp-content"
            className="flex min-h-[calc(100svh-64px)] w-full flex-col items-start justify-center px-32 py-16">
            <h1 className="font-mono text-5xl">Project ZENTRIX</h1>
            <div className="mt-8 flex items-center gap-4">
                <h2 className="text-3xl">Learning Coding</h2>
                <RotatingText
                    texts={["Authentically", "Professionally", "Practically", "Deeply", "Truly"]}
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
                    Get Started
                </Button>
            </div>
        </section>
    );
}
