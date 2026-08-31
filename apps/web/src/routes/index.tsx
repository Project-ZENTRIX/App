import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@shared/ui";
import RotatingText from "@shared/ui/components/RotatingText";
import { LightfallBackgroundLayout } from "$/layouts/lightfall-background";

export const Route = createFileRoute("/")({
    component: HomePage,
});

function HomePage() {
    return (
        <LightfallBackgroundLayout>
            <main className="flex min-h-screen flex-col items-start justify-center p-24">
                <h1 className="font-mono text-6xl">{"Project ZENTRIX"}</h1>
                <div className="mt-8 transition-all duration-500">
                    <RotatingText
                        texts={[
                            "Learn coding, Build for real.",
                            "Learn coding, Step by step.",
                            "Learn coding, Project by project.",
                        ]}
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
                    <Button variant="outline" className="p-6 text-lg">
                        {"Get Started"}
                    </Button>
                    <Button variant="ghost" className="p-6 text-lg">
                        {"Read FAQ"}
                    </Button>
                </div>
            </main>
        </LightfallBackgroundLayout>
    );
}
