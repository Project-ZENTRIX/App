"use client";

import * as React from "react";
import {
    AudioWaveformIcon,
    CommandIcon,
    GraduationCapIcon,
    LayoutDashboardIcon,
    PackageIcon,
    Settings2Icon,
    ShieldCheckIcon,
    UserRoundIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@shared/ui/components/sidebar";
import { NavMain, type NavMainItem } from "./nav-main";
import { NavUser } from "./nav-user";
import { TeamSwitcher, type TeamEntryProp, type TeamRole } from "./team-switcher";
import { useState } from "react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { t } = useTranslation("app-shell");
    const [activeRole, setActiveRole] = useState<TeamRole | undefined>();

    const teams: TeamEntryProp[] = [
        {
            name: t("teams.nexoraStudios"),
            logo: "https://avatars.githubusercontent.com/u/146556636?v=4",
            planKey: "plans.enterprise",
            roles: ["student", "teacher", "admin"],
        },
        {
            name: t("teams.acmeCorp"),
            logo: AudioWaveformIcon,
            planKey: "plans.startup",
            roles: ["student"],
        },
        {
            name: t("teams.evilCorp"),
            logo: CommandIcon,
            planKey: "plans.free",
            roles: ["student", "teacher"],
        },
    ];

    const navMain: NavMainItem[] = [
        {
            titleKey: "nav.dashboard",
            url: "/app/dashboard",
            icon: LayoutDashboardIcon,
            isActive: true,
        },
        {
            titleKey: "nav.learning",
            url: "/app/learning",
            icon: GraduationCapIcon,
            items: [
                {
                    titleKey: "nav.learningChildren.myCourses",
                    url: "/courses",
                    role: "student",
                },
                {
                    titleKey: "nav.learningChildren.progress",
                    url: "/progress",
                    role: "student",
                },
                {
                    titleKey: "nav.learningChildren.courses",
                    url: "/courses",
                    role: "teacher",
                },
            ],
        },
        {
            titleKey: "nav.content",
            url: "/app/content",
            icon: PackageIcon,
            role: "teacher",
            items: [
                {
                    titleKey: "nav.contentChildren.packages",
                    url: "/packages",
                },
                {
                    titleKey: "nav.contentChildren.newPackage",
                    url: "/packages/new",
                },
                {
                    titleKey: "nav.contentChildren.library",
                    url: "/library",
                },
                {
                    titleKey: "nav.contentChildren.publishing",
                    url: "/publishing",
                },
                {
                    titleKey: "nav.contentChildren.review",
                    url: "/review",
                },
            ],
        },
        {
            titleKey: "nav.admin",
            url: "/app/admin",
            icon: ShieldCheckIcon,
            role: "admin",
            items: [
                {
                    titleKey: "nav.adminChildren.console",
                    url: "",
                },
                {
                    titleKey: "nav.adminChildren.users",
                    url: "/users",
                },
                {
                    titleKey: "nav.adminChildren.content",
                    url: "/content",
                },
                {
                    titleKey: "nav.adminChildren.licenses",
                    url: "/licenses",
                },
                {
                    titleKey: "nav.adminChildren.system",
                    url: "/system",
                },
            ],
        },
        {
            titleKey: "nav.account",
            url: "/app/account",
            icon: UserRoundIcon,
            items: [
                {
                    titleKey: "nav.accountChildren.profile",
                    url: "/profile",
                },
                {
                    titleKey: "nav.accountChildren.notifications",
                    url: "/notifications",
                },
                {
                    titleKey: "nav.accountChildren.security",
                    url: "/security",
                },
                {
                    titleKey: "nav.accountChildren.sessions",
                    url: "/sessions",
                },
                {
                    titleKey: "nav.accountChildren.orders",
                    url: "/orders",
                    role: "student",
                },
                {
                    titleKey: "nav.accountChildren.membership",
                    url: "/membership",
                    role: "student",
                },
            ],
        },
        {
            titleKey: "nav.settings",
            url: "/app/settings",
            icon: Settings2Icon,
            items: [
                {
                    titleKey: "nav.settingsChildren.general",
                    url: "/general",
                },
                {
                    titleKey: "nav.settingsChildren.preferences",
                    url: "/preferences",
                },
            ],
        },
    ];

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <TeamSwitcher teams={teams} onUpdateActiveRole={(arg0) => setActiveRole(arg0)} />
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navMain} currentRole={activeRole} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser
                    user={{
                        name: t("user.name"),
                        email: t("user.email"),
                        avatar: "https://avatars.githubusercontent.com/u/187042234?v=4",
                    }}
                />
            </SidebarFooter>
        </Sidebar>
    );
}
