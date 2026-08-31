"use client";

import { useEffect, useState, type ElementType } from "react";
import { ChevronRightCircleIcon, NotebookPenIcon, Plus, PresentationIcon, ShieldUserIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@shared/ui/components/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@shared/ui/components/sidebar";

export type TeamRole = "student" | "teacher" | "admin";
export interface TeamEntry {
    labelKey: string;
    icon: ElementType;
}

export interface TeamEntryProp {
    name: string;
    logo: ElementType | string;
    planKey: "plans.enterprise" | "plans.startup" | "plans.free";
    roles: TeamRole[];
}

function TeamLogo({ logo, ...props }: { logo: ElementType | string; className?: string }) {
    switch (typeof logo) {
        case "string":
            return <img src={logo} {...props} />;
        default: {
            const Logo = logo;
            return <Logo {...props} />;
        }
    }
}

function ActiveTeamLogo({ logo, ...props }: { logo: ElementType | string }) {
    switch (typeof logo) {
        case "string":
            return <TeamLogo logo={logo} className="size-8 rounded-lg" {...props} />;

        default:
            return (
                <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <TeamLogo logo={logo} className="size-4" {...props} />
                </div>
            );
    }
}

const ROLES: Record<TeamRole, TeamEntry> = {
    student: {
        labelKey: "rolesConfig.student",
        icon: NotebookPenIcon,
    },
    teacher: {
        labelKey: "rolesConfig.teacher",
        icon: PresentationIcon,
    },
    admin: {
        labelKey: "rolesConfig.admin",
        icon: ShieldUserIcon,
    },
};

const ACTIVE_TEAM_STORAGE_KEY = "zentrix.active-team";
const ACTIVE_ROLE_STORAGE_KEY = "zentrix.active-role";

function readStoredTeam(teams: TeamEntryProp[]): TeamEntryProp | undefined {
    if (typeof window === "undefined") {
        return teams[0];
    }
    const storedName = window.localStorage.getItem(ACTIVE_TEAM_STORAGE_KEY);
    return teams.find((team) => team.name === storedName) ?? teams[0];
}

function readStoredRole(team: TeamEntryProp | undefined): TeamRole | undefined {
    if (!team) {
        return undefined;
    }
    if (typeof window === "undefined") {
        return team.roles.at(-1);
    }
    const storedRole = window.localStorage.getItem(ACTIVE_ROLE_STORAGE_KEY) as TeamRole | null;
    return storedRole && team.roles.includes(storedRole) ? storedRole : team.roles.at(-1);
}

export function TeamSwitcher({
    teams,
    onUpdateActiveRole,
}: {
    teams: TeamEntryProp[];
    onUpdateActiveRole: (arg0: TeamRole | undefined) => void;
}) {
    const { t } = useTranslation("app-shell");
    const { isMobile } = useSidebar();
    const [activeTeam, setActiveTeam] = useState<TeamEntryProp | undefined>(() => readStoredTeam(teams));
    const [activeRole, setActiveRole] = useState<TeamRole | undefined>(() => readStoredRole(readStoredTeam(teams)));
    const roles = activeTeam?.roles ?? [];

    const handleTeamChange = (team: TeamEntryProp) => {
        setActiveTeam(team);
        setActiveRole((currentRole) => {
            const nextRole = currentRole && team.roles.includes(currentRole) ? currentRole : team.roles.at(-1);
            if (typeof window !== "undefined" && nextRole) {
                window.localStorage.setItem(ACTIVE_TEAM_STORAGE_KEY, team.name);
                window.localStorage.setItem(ACTIVE_ROLE_STORAGE_KEY, nextRole);
            }
            return nextRole;
        });
    };

    useEffect(() => {
        if (!activeTeam) {
            const fallbackTeam = readStoredTeam(teams);
            setActiveTeam(fallbackTeam);
            setActiveRole(readStoredRole(fallbackTeam));
            return;
        }
        const newActiveTeam = teams.find((team) => team.name === activeTeam.name);
        if (!newActiveTeam) {
            const fallbackTeam = readStoredTeam(teams);
            setActiveTeam(fallbackTeam);
            setActiveRole(readStoredRole(fallbackTeam));
            return;
        }
        if (!activeRole || !newActiveTeam.roles.includes(activeRole)) {
            setActiveRole(readStoredRole(newActiveTeam));
        }
    }, [teams, activeTeam, activeRole]);

    useEffect(() => {
        if (typeof window === "undefined" || !activeTeam || !activeRole) {
            return;
        }
        window.localStorage.setItem(ACTIVE_TEAM_STORAGE_KEY, activeTeam.name);
        window.localStorage.setItem(ACTIVE_ROLE_STORAGE_KEY, activeRole);
    }, [activeTeam, activeRole]);

    useEffect(() => {
        onUpdateActiveRole(activeRole);
    }, [activeRole, onUpdateActiveRole]);

    if (!activeTeam) {
        return null;
    }

    const activeRoleConfig = activeRole ? ROLES[activeRole] : undefined;

    return (
        <SidebarMenu className="space-y-1">
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group/sidebar-btn1">
                            <ActiveTeamLogo logo={activeTeam.logo} />
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{activeTeam.name}</span>
                                <span className="truncate text-xs">{t(`teams.${activeTeam.planKey}`)}</span>
                            </div>
                            <ChevronRightCircleIcon className="ml-auto transition-all duration-150 ease-in-out group-data-[state=open]/sidebar-btn1:rotate-180" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        align="start"
                        side={isMobile ? "bottom" : "right"}
                        sideOffset={4}>
                        <DropdownMenuLabel className="text-muted-foreground text-xs">{t("sidebar.teams")}</DropdownMenuLabel>
                        {teams.map((team, index) => (
                            <DropdownMenuItem key={team.name} onClick={() => handleTeamChange(team)} className="gap-2 p-2">
                                <div className="flex size-6 items-center justify-center rounded-md border">
                                    <TeamLogo logo={team.logo} className="size-3.5 shrink-0" />
                                </div>
                                {team.name}
                                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 p-2">
                            <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                                <Plus className="size-4" />
                            </div>
                            <div className="text-muted-foreground font-medium">{t("sidebar.addTeam")}</div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>

            {activeRole &&
                activeRoleConfig &&
                (roles.length > 1 ? (
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="default"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group/sidebar-btn2">
                                    <div className="flex flex-1 items-center gap-1 text-left text-sm leading-tight">
                                        <span className="mr-1 truncate group-data-[state=collapsed]:hidden">
                                            {t("sidebar.currentRole")}
                                        </span>
                                        <activeRoleConfig.icon className="size-3.5! group-data-[state=collapsed]:size-4!" />
                                        <span className="truncate font-medium group-data-[state=collapsed]:hidden">
                                            {t(activeRoleConfig.labelKey)}
                                        </span>
                                    </div>
                                    <ChevronRightCircleIcon className="ml-auto transition-all duration-150 ease-in-out group-data-[state=collapsed]:hidden group-data-[state=open]/sidebar-btn2:rotate-180" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                                align="start"
                                side={isMobile ? "bottom" : "right"}
                                sideOffset={4}>
                                <DropdownMenuLabel className="text-muted-foreground text-xs">
                                    {t("sidebar.roles")}
                                </DropdownMenuLabel>
                                {Object.entries(ROLES).map((role) => {
                                    const [name, config] = role as [TeamRole, TeamEntry];
                                    const Icon = config.icon;
                                    return (
                                        <DropdownMenuItem
                                            key={name}
                                            onClick={() => setActiveRole(name)}
                                            className="gap-2 p-2"
                                            disabled={!roles.includes(name)}>
                                            <div className="flex size-6 items-center justify-center rounded-md border">
                                                <Icon className="size-3.5" />
                                            </div>
                                            {t(config.labelKey)}
                                        </DropdownMenuItem>
                                    );
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                ) : (
                    <SidebarMenuButton
                        size="default"
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group/sidebar-btn2">
                        <div className="flex flex-1 items-center gap-1 text-left text-sm leading-tight">
                            <span className="mr-1 truncate group-data-[state=collapsed]:hidden">
                                {t("sidebar.currentRole")}
                            </span>
                            <activeRoleConfig.icon className="size-3.5! group-data-[state=collapsed]:size-4!" />
                            <span className="truncate font-medium group-data-[state=collapsed]:hidden">
                                {t(activeRoleConfig.labelKey)}
                            </span>
                        </div>
                    </SidebarMenuButton>
                ))}
        </SidebarMenu>
    );
}
