"use client";

import * as React from "react";
import { MoonStar, SunMedium } from "lucide-react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";

import { Button } from "@workspace/ui/components/button";

function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
    return (
        <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange {...props}>
            <ThemeHotkey />
            {children}
        </NextThemesProvider>
    );
}

function isTypingTarget(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) {
        return false;
    }

    return (
        target.isContentEditable || target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT"
    );
}

function ThemeHotkey() {
    const { resolvedTheme, setTheme } = useTheme();

    React.useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (event.defaultPrevented || event.repeat) {
                return;
            }

            if (event.metaKey || event.ctrlKey || event.altKey) {
                return;
            }

            if (!(event.shiftKey && event.key.toLowerCase() === "t")) {
                return;
            }

            if (isTypingTarget(event.target)) {
                return;
            }

            setTheme(resolvedTheme === "dark" ? "light" : "dark");
        }

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [resolvedTheme, setTheme]);

    return null;
}

function ThemeToggleButton() {
    const { resolvedTheme, setTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={isDark ? "切换到浅色主题" : "切换到深色主题"}
            title={isDark ? "切换到浅色主题" : "切换到深色主题"}
            onClick={() => setTheme(isDark ? "light" : "dark")}>
            {isDark ? <SunMedium className="size-4" /> : <MoonStar className="size-4" />}
        </Button>
    );
}

export { ThemeProvider, ThemeToggleButton };
