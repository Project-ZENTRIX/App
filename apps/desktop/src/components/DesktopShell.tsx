import type { ComponentType, ReactNode } from "react";
import { useMemo, useState } from "react";
import {
    ArrowLeftRight,
    BookOpenText,
    CalendarRange,
    ChevronRight,
    Clock3,
    FileClock,
    MoonStar,
    MonitorSmartphone,
    PackageSearch,
    PanelLeftClose,
    PlaySquare,
    Rows3,
    Settings,
    ShieldCheck,
    Sparkles,
    SunMedium,
} from "lucide-react";

import { useTheme } from "next-themes";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@workspace/ui/components/tooltip";
import { cn } from "@workspace/ui/lib/utils";

import { LocaleSwitcher, useDictionary } from "../lib/i18n";
import { useDesktopPortalData } from "./DesktopPortalDataProvider";

import { studentPages, type StudentPageId } from "../features/navigation/student-pages";

const iconByPageId: Record<StudentPageId, ComponentType<{ className?: string }>> = {
    startup: ShieldCheck,
    "pack-selection": PackageSearch,
    workspace: Rows3,
    "lesson-details": BookOpenText,
    "runs-and-submissions": PlaySquare,
    "sync-cache": ArrowLeftRight,
    settings: Settings,
};

const groupItems: Array<{ titleKey: "connectionGroup" | "executionGroup" | "systemGroup"; pageIds: StudentPageId[] }> = [
    { titleKey: "connectionGroup", pageIds: ["startup", "pack-selection", "lesson-details"] },
    { titleKey: "executionGroup", pageIds: ["workspace", "runs-and-submissions", "sync-cache"] },
    { titleKey: "systemGroup", pageIds: ["settings"] },
];

interface DesktopShellProps {
    activePageId: StudentPageId;
    onSelectPage: (pageId: StudentPageId) => void;
    children: ReactNode;
}

function ThemeToggleControl() {
    const { resolvedTheme, setTheme } = useTheme();
    const dictionary = useDictionary();
    const isDark = resolvedTheme === "dark";

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={dictionary.navigation.theme}
            title={isDark ? dictionary.navigation.light : dictionary.navigation.dark}
            onClick={() => setTheme(isDark ? "light" : "dark")}>
            {isDark ? <SunMedium className="size-4" /> : <MoonStar className="size-4" />}
        </Button>
    );
}

function PageButton({
    pageId,
    active,
    collapsed,
    onSelect,
}: {
    pageId: StudentPageId;
    active: boolean;
    collapsed: boolean;
    onSelect: (pageId: StudentPageId) => void;
}) {
    const dictionary = useDictionary();
    const page = studentPages.find((item) => item.id === pageId)!;
    const copy = dictionary.pages[pageId] ?? page;
    const Icon = iconByPageId[pageId];
    const button = (
        <Button
            type="button"
            variant="outline"
            size="lg"
            aria-pressed={active}
            className={cn(
                "border-border/80 bg-background h-auto w-full justify-start gap-3 px-3 py-3 text-left text-sm shadow-none",
                active && "border-primary/30 bg-primary/10 text-primary"
            )}
            onClick={() => onSelect(pageId)}>
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            {!collapsed ? (
                <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
                    <span className="truncate font-medium">{copy.label}</span>
                    <span className="text-muted-foreground line-clamp-1 text-xs">{copy.summary}</span>
                </span>
            ) : null}
        </Button>
    );

    if (!collapsed) {
        return button;
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent side="right" align="center" className="max-w-xs">
                <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{copy.label}</span>
                    <span className="text-xs opacity-80">{copy.summary}</span>
                </div>
            </TooltipContent>
        </Tooltip>
    );
}

export function DesktopShell({ activePageId, onSelectPage, children }: DesktopShellProps) {
    const dictionary = useDictionary();
    const { account, license, contentPacks } = useDesktopPortalData();
    const activePage =
        dictionary.pages[activePageId] ?? studentPages.find((item) => item.id === activePageId) ?? studentPages[0]!;
    const [collapsed, setCollapsed] = useState(false);

    const statusBadges = useMemo(
        () => [
            {
                variant: account ? ("secondary" as const) : ("outline" as const),
                icon: Sparkles,
                label: account ? dictionary.shell.webLoginConnected : "等待 Web 授权",
            },
            {
                variant: license?.status === "active" ? ("secondary" as const) : ("outline" as const),
                icon: MonitorSmartphone,
                label: license?.status === "active" ? dictionary.shell.desktopAuthValid : "Desktop 授权待接入",
            },
            {
                variant: "outline" as const,
                icon: CalendarRange,
                label: contentPacks.length > 0 ? dictionary.shell.localPackCached : "本地课包待同步",
            },
        ],
        [account, contentPacks.length, dictionary, license?.status]
    );

    return (
        <TooltipProvider>
            <div className="bg-background text-foreground flex h-dvh w-full overflow-hidden">
                <aside
                    className={cn(
                        "border-border/70 bg-muted/20 flex h-full min-h-0 flex-col overflow-hidden border-r p-3 transition-[width,padding] duration-300 ease-out",
                        collapsed ? "w-[88px]" : "w-[320px]"
                    )}>
                    <div className={cn("flex shrink-0 items-center gap-3", collapsed ? "justify-center" : "justify-between")}>
                        {!collapsed ? (
                            <div className="min-w-0">
                                <div className="text-muted-foreground text-[11px] tracking-[0.28em] uppercase">
                                    {dictionary.shell.portalLabel}
                                </div>
                                <div className="font-heading truncate text-lg font-semibold">{dictionary.appName}</div>
                            </div>
                        ) : null}
                        <Button
                            variant="ghost"
                            size="icon-xs"
                            aria-label={collapsed ? dictionary.shell.expandSidebar : dictionary.shell.collapseSidebar}
                            onClick={() => setCollapsed((value) => !value)}>
                            {collapsed ? <ChevronRight className="size-4" /> : <PanelLeftClose className="size-4" />}
                        </Button>
                    </div>

                    {!collapsed ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {statusBadges.map(({ variant, icon: Icon, label }) => (
                                <Badge key={label} variant={variant}>
                                    <Icon className="mr-1 size-3.5" />
                                    {label}
                                </Badge>
                            ))}
                        </div>
                    ) : null}

                    <Separator className="my-3" />

                    <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                        <div className="space-y-4">
                            {groupItems.map((group) => (
                                <div key={group.titleKey} className="space-y-2">
                                    {!collapsed ? (
                                        <div className="text-muted-foreground px-1 text-[11px] tracking-[0.24em] uppercase">
                                            {dictionary.shell[group.titleKey]}
                                        </div>
                                    ) : null}
                                    <div className="space-y-2">
                                        {group.pageIds.map((pageId) => (
                                            <PageButton
                                                key={pageId}
                                                pageId={pageId}
                                                active={pageId === activePageId}
                                                collapsed={collapsed}
                                                onSelect={onSelectPage}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator className="my-3" />

                    <div className={cn("border-border/70 bg-background shrink-0 rounded-xl border p-3", collapsed && "p-2")}>
                        {!collapsed ? (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <FileClock className="size-4" />
                                    {dictionary.shell.recentSync}
                                </div>
                                <div className="text-muted-foreground text-xs leading-5">{dictionary.shell.recentSyncBody}</div>
                            </div>
                        ) : (
                            <ArrowLeftRight className="text-muted-foreground mx-auto size-4" aria-hidden="true" />
                        )}
                    </div>
                </aside>

                <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
                    <header className="border-border/70 bg-background/90 flex shrink-0 items-center justify-between gap-4 border-b px-5 py-4 backdrop-blur-sm">
                        <div className="min-w-0">
                            <div className="text-muted-foreground text-[11px] tracking-[0.28em] uppercase">
                                {dictionary.shell.currentPage}
                            </div>
                            <div className="font-heading truncate text-xl font-semibold">{activePage.label}</div>
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-2">
                            <LocaleSwitcher />
                            <ThemeToggleControl />
                            {statusBadges.map(({ variant, icon: Icon, label }) => (
                                <Badge key={label} variant={variant}>
                                    <Icon className="mr-1 size-3.5" />
                                    {label}
                                </Badge>
                            ))}
                        </div>
                    </header>

                    <section className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</section>
                </main>
            </div>
        </TooltipProvider>
    );
}
