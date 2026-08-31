import Lightfall from "@shared/ui/components/Lightfall";

export function LightfallBackgroundLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-background text-foreground relative min-h-screen antialiased">
            <Lightfall
                className="pointer-events-none fixed inset-0 z-0"
                colors={["#BBF7D0", "#22C55E", "#A3E635"]}
                backgroundColor="#22C55E"
                speed={0.5}
                streakCount={2}
                streakWidth={1}
                streakLength={1}
                density={0.6}
                twinkle={1}
                glow={1}
                backgroundGlow={0}
                zoom={2.5}
                opacity={1}
                mouseInteraction={false}
            />
            <div className="relative z-10 flex min-h-screen flex-col backdrop-blur-[2px]">{children}</div>
        </div>
    );
}
