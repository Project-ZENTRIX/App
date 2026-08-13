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
import { cn } from "@workspace/ui/lib/utils";
import { Badge } from "@workspace/ui/components/badge";

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

const menuGroups: MenuGroup[] = [
    {
        title: "Main navigation",
        items: [
            {
                label: "Dashboard",
                href: "/app",
                icon: LayoutDashboard,
                detail: "Overview and quick access",
            },
            {
                label: "Courses",
                href: "#",
                icon: Store,
                detail: "Browse and buy courses",
                disabled: true,
            },
            {
                label: "My items",
                href: "#",
                icon: LibraryBig,
                detail: "Owned content and access",
                disabled: true,
            },
            {
                label: "Plan",
                href: "#",
                icon: Crown,
                detail: "Subscription status and perks",
                disabled: true,
            },
        ],
    },
    {
        title: "Management",
        items: [
            {
                label: "Orders",
                href: "#",
                icon: ReceiptText,
                detail: "Order and payment status",
                disabled: true,
            },
            {
                label: "Progress",
                href: "#",
                icon: Trophy,
                detail: "Achievements and levels",
                disabled: true,
            },
            {
                label: "Devices",
                href: "#",
                icon: MonitorSmartphone,
                detail: "Licenses and bindings",
                disabled: true,
            },
            {
                label: "Settings",
                href: "/app/settings/profile",
                icon: Settings2,
                detail: "Profile, password, and sessions",
            },
        ],
    },
];

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
    return (
        <Link href={item.href} className="w-full">
            <Button
                variant="outline"
                size="lg"
                className={cn(
                    "relative aspect-square w-full",
                    collapsed ? "py-7" : "justify-start py-7",
                    active && "bg-primary/25!"
                )}
                disabled={disabled}>
                <Icon className={cn(collapsed ? "size-8" : "border-border size-10 rounded-md border p-1.5")} />
                {!collapsed && (
                    <div className="ml-1 flex flex-col items-start gap-0.5">
                        <h3>{item.label}</h3>
                        <span className="text-xs">{item.detail}</span>
                    </div>
                )}
            </Button>
        </Link>
    );
}

export function LeftRail({ collapsed, onToggleAction }: LeftRailProps) {
    const pathname = usePathname();

    return (
        <aside
            className={cn(
                "border-border/70 bg-muted/20 relative flex h-full min-h-0 flex-col overflow-hidden rounded-xl border p-4 transition-[width,padding] duration-300 ease-out",
                collapsed ? "w-20 p-2" : "w-76"
            )}>
            <div className={cn("relative mb-4 flex shrink-0 items-start justify-between gap-3", collapsed ? "h-10" : "h-12")}>
                <div className={cn("min-w-0 overflow-hidden transition-all duration-200", collapsed && "opacity-0")}>
                    <div className="text-sm font-semibold">Menu</div>
                    <div className="text-muted-foreground text-xs">Portal</div>
                </div>
                <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    className="shrink-0"
                    onClick={onToggleAction}>
                    {collapsed ? <ChevronRight className="size-4" /> : <PanelLeftClose className="size-4" />}
                </Button>
            </div>

            <div
                className={cn(
                    "min-h-0 flex-1 space-y-4 overflow-y-auto pr-1 transition-all duration-300 ease-out",
                    collapsed && "translate-y-0.5 pr-0"
                )}>
                {menuGroups.map((group) => (
                    <div key={group.title} className="space-y-2">
                        <div className={cn("text-muted-foreground px-1 text-[11px] font-medium tracking-[0.18em] uppercase")}>
                            {group.title}
                        </div>
                        <div className="flex flex-col space-y-2">
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
