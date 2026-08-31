import { I18nextProvider } from "react-i18next";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { TooltipProvider } from "@shared/ui/components/tooltip";
import { i18n } from "@shared/i18n";
import { ThemeProvider } from "$/components/theme-provider";

export const Route = createRootRoute({
    component: () => (
        <>
            <ThemeProvider>
                <I18nextProvider i18n={i18n}>
                    <TooltipProvider>
                        <Outlet />
                    </TooltipProvider>
                </I18nextProvider>
            </ThemeProvider>
            {import.meta.env.DEV && <TanStackRouterDevtools position="bottom-right" />}
        </>
    ),
});
