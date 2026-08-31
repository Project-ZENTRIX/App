import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShellLayout } from "$/layouts/app-shell";

export const Route = createFileRoute("/app")({
    component: AppRoute,
});

function AppRoute() {
    return (
        <AppShellLayout>
            <Outlet />
        </AppShellLayout>
    );
}
