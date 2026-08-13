import { AppWrapper } from "@/components/layout/wrappers/app-wrapper";
import { AppShell } from "@/components/layout/app/app-shell";

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <AppWrapper>
            <AppShell>{children}</AppShell>
        </AppWrapper>
    );
}
