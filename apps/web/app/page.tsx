import { NavBar } from "@/components/layout/nav-bar";
import { Button } from "@workspace/ui/components/button";
import Lightfall from "@workspace/ui/components/Lightfall";
import RotatingText from "@workspace/ui/components/RotatingText";

import "@/styles/component.css";

export default function Page() {
    return (
        <div className="relative h-full w-full">
            <section className="absolute top-0 left-0 h-full w-full" id="_zentrix.bg-lightfall">
                <div className="pointer-events-none absolute z-1 h-full w-full bg-gray-700/25 backdrop-blur-xs"></div>
                <Lightfall
                    className="-z-1"
                    colors={["#A6C8FF", "#5227FF", "#FF9FFC"]}
                    backgroundColor="#0A29FF"
                    speed={0.5}
                    streakCount={2}
                    streakWidth={1}
                    streakLength={1}
                    density={0.6}
                    twinkle={1}
                    glow={1}
                    backgroundGlow={0.5}
                    zoom={3}
                    opacity={1}
                    mouseInteraction={false}
                />
            </section>

            <section id="_zentrix.comp-nav" className="absolute top-4 z-3 w-full px-16">
                <NavBar />
            </section>

            <section
                id="_zentrix.comp-content"
                className="absolute z-2 flex h-full w-full flex-col items-start justify-center px-32">
                <h1 className="text-5xl font-mono">Project ZENTRIX</h1>
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
                    <Button className="pointer-events-auto p-6 text-lg">Get Started</Button>
                </div>
            </section>
        </div>
    );
}
