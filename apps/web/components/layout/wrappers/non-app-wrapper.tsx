import { ReactNode } from "react";
import { HomeNavBar } from "@/components/layout/nav-bar";
import Lightfall from "@workspace/ui/components/Lightfall";

export default function NonAppWrapper({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen w-full flex-col">
            <section className="fixed top-0 left-0 -z-1 h-screen w-screen" id="_zentrix.bg-lightfall">
                <div className="pointer-events-none absolute -z-2 h-full w-full bg-gray-700/10 backdrop-blur-xs"></div>
                <Lightfall
                    className="-z-3"
                    colors={["#BBF7D0", "#22C55E", "#A3E635"]}
                    backgroundColor="#22C55E"
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

            <section id="_zentrix.comp-nav" className="sticky top-4 z-3 w-full px-8">
                <HomeNavBar surface="student" />
            </section>

            {children}
        </div>
    );
}
