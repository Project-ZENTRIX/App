"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    ChevronRight,
    Crown,
    LayoutDashboard,
    MonitorSmartphone,
    ReceiptText,
    Settings2,
    Store,
    Trophy,
    LibraryBig,
    PanelLeftClose,
} from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@workspace/ui/components/tooltip";
import { cn } from "@workspace/ui/lib/utils";
import { useDictionary } from "@/lib/i18n";

type MenuItem = {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    detail: string;
    disabled?: boolean;
};

type MenuGroup = {
    title: string;
    items: MenuItem[];
};

type LeftRailProps = {
    collapsed: boolean;
    onToggleAction: () => void;
};

function MenuRow({
    item,
    collapsed,
    active,
    disabled,
}: {
    item: MenuItem;
    collapsed: boolean;
    active: boolean;
    disabled: boolean;
}) {
    const Icon = item.icon;
    const triggerClassName = cn(
        "relative w-full",
        collapsed ? "justify-center px-0 py-7" : "justify-start py-7",
        active && "bg-primary/25!"
    );

    if (!collapsed) {
        return (
            <Button asChild variant="outline" size="lg" className={triggerClassName} disabled={disabled}>
                <Link href={item.href} aria-label={item.label}>
                    <Icon className="border-border size-10 rounded-md border p-1.5" />
                    <div className="ml-1 flex flex-col items-start gap-0.5">
                        <h3>{item.label}</h3>
                        <span className="text-xs">{item.detail}</span>
                    </div>
                </Link>
            </Button>
        );
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button asChild variant="outline" size="lg" className={triggerClassName} disabled={disabled}>
                    <Link href={item.href} aria-label={item.label}>
                        <Icon className="size-8" />
                    </Link>
                </Button>
            </TooltipTrigger>
            <TooltipContent side="right" align="center" className="max-w-sm">
                <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-xs opacity-80">{item.detail}</span>
                </div>
            </TooltipContent>
        </Tooltip>
    );
}

export function LeftRail({ collapsed, onToggleAction }: LeftRailProps) {
    const pathname = usePathname();
    const t = useDictionary();

    const menuGroups: MenuGroup[] = [
        {
            title: t.shell.mainNavigation,
            items: [
                {
                    label: t.portal.dashboardTitle,
                    href: "/app",
                    icon: LayoutDashboard,
                    detail: t.shell.overviewAndQuickAccess,
                },
                {
                    label: t.portal.courseMarket,
                    href: "/app/courses",
                    icon: Store,
                    detail: t.shell.browseAndBuyCourses,
                },
                {
                    label: t.portal.owned,
                    href: "/app/library",
                    icon: LibraryBig,
                    detail: t.shell.ownedContentAndAccess,
                },
                {
                    label: t.portal.membershipTitle,
                    href: "/app/membership",
                    icon: Crown,
                    detail: t.shell.subscriptionStatusAndPerks,
                },
            ],
        },
        {
            title: t.shell.management,
            items: [
                {
                    label: t.portal.ordersTitle,
                    href: "/app/orders",
                    icon: ReceiptText,
                    detail: t.shell.orderAndPaymentStatus,
                },
                {
                    label: t.portal.progressTitle,
                    href: "/app/progress",
                    icon: Trophy,
                    detail: t.shell.achievementsAndLevels,
                },
                {
                    label: t.portal.devicesTitle,
                    href: "/app/devices",
                    icon: MonitorSmartphone,
                    detail: t.shell.licencesAndBindings,
                },
                {
                    label: t.portal.settingsTitle,
                    href: "/app/settings/profile",
                    icon: Settings2,
                    detail: t.shell.profilePasswordAndSessions,
                },
            ],
        },
    ];

    return (
        <aside
            className={cn(
                "border-border/70 bg-muted/20 relative flex h-full min-h-0 flex-col overflow-hidden rounded-xl border p-4 transition-[width,padding] duration-300 ease-out",
                collapsed ? "w-20 p-2" : "w-76"
            )}>
            <div
                className={cn(
                    "relative mb-4 flex shrink-0 items-center gap-3",
                    collapsed ? "h-10 justify-center" : "h-12 justify-between"
                )}>
                {!collapsed ? (
                    <div className="min-w-0 overflow-hidden">
                        <div className="text-sm font-semibold">{t.shell.menu}</div>
                        <div className="text-muted-foreground text-xs">{t.shell.portalLabel}</div>
                    </div>
                ) : null}
                <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={collapsed ? t.shell.expandSidebar : t.shell.collapseSidebar}
                    className="shrink-0"
                    onClick={onToggleAction}>
                    {collapsed ? <ChevronRight className="size-4" /> : <PanelLeftClose className="size-4" />}
                </Button>
            </div>

            <div
                className={cn(
                    "min-h-0 flex-1 overflow-y-auto pr-1 transition-all duration-300 ease-out",
                    collapsed ? "translate-y-0.5 pr-0" : "space-y-4"
                )}>
                {menuGroups.map((group) => (
                    <div key={group.title} className="flex flex-col gap-2">
                        <div className="text-muted-foreground px-1 text-[11px] font-medium tracking-[0.18em] uppercase">
                            {!collapsed ? <>{group.title}</> : null}
                        </div>
                        <div className="flex flex-col gap-2">
                            {group.items.map((item) => {
                                const active = pathname === item.href;
                                return (
                                    <MenuRow
                                        key={item.label}
                                        item={item}
                                        collapsed={collapsed}
                                        disabled={item.disabled ?? false}
                                        active={active}
                                    />
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
}
