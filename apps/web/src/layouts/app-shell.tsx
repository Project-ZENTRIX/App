import { useTranslation } from "react-i18next";
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbSeparator,
    BreadcrumbPage,
} from "@shared/ui/components/breadcrumb";
import { Separator } from "@shared/ui/components/separator";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@shared/ui/components/sidebar";
import { AppSidebar } from "$/components/app-shell/app-sidebar";

export function AppShellLayout({ children }: { children: React.ReactNode }) {
    const { t } = useTranslation("app-shell");

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="-mt-1 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:my-auto data-[orientation=vertical]:h-4"
                        />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="#">{t("breadcrumb.buildYourApplication")}</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>{t("breadcrumb.dataFetching")}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-6 pt-0">{children}</div>
            </SidebarInset>
        </SidebarProvider>
    );
}
