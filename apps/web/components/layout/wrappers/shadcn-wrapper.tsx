import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@workspace/ui/components/tooltip";

/**
 * shadcn/ui Layout Wrapper
 *
 * Use it **First**
 */
export function ShadcnWrapper({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
    );
}
