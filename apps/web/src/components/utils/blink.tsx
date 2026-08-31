import { Slot } from "@radix-ui/react-slot";
import type { CSSProperties, ReactNode } from "react";

interface BlinkProps {
    children: ReactNode;
    duration?: number;
    delay?: number;
    opacity?: number;
    asChild?: boolean;
}

export function Blink({ children, duration = 1000, delay = 0, opacity = 50, asChild = true }: BlinkProps) {
    const Comp = asChild ? Slot : "div";

    return (
        <Comp
            className="animate-blink"
            data-duration={duration}
            data-delay={delay}
            style={
                {
                    "--blink-duration": `${duration}ms`,
                    "--blink-delay": `${delay}ms`,
                    "--blink-opacity": `${opacity}%`,
                } as CSSProperties
            }>
            {children}
        </Comp>
    );
}
