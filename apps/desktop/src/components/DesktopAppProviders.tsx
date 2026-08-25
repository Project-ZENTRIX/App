"use client";

import type { ReactNode } from "react";

import { ThemeProvider } from "./theme-provider";
import { LocaleProvider } from "../lib/i18n";
import { DesktopPortalDataProvider } from "./DesktopPortalDataProvider";

export function DesktopAppProviders({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider>
            <LocaleProvider>
                <DesktopPortalDataProvider>{children}</DesktopPortalDataProvider>
            </LocaleProvider>
        </ThemeProvider>
    );
}
