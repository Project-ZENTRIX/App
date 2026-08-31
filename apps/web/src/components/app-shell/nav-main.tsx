import { Link } from "@tanstack/react-router";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@shared/ui/components/collapsible";
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@shared/ui/components/sidebar";
import type { TeamRole } from "./team-switcher";

export interface NavMainItem {
    titleKey: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    role?: TeamRole;
    items?: {
        titleKey: string;
        url: string;
        role?: TeamRole;
    }[];
}

export function NavMain({ items, currentRole }: { items: NavMainItem[]; currentRole: TeamRole | undefined }) {
    const { t } = useTranslation("app-shell");

    return (
        <SidebarGroup>
            <SidebarGroupLabel>{t("sidebar.platform")}</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const title = t(item.titleKey);
                    if (item.role && item.role !== currentRole) {
                        return null;
                    }
                    if (item.items && item.items.length > 0 && item.items.every((i) => i.role && i.role !== currentRole)) {
                        return null;
                    }
                    return item.items && item.items.length > 0 ? (
                        <Collapsible key={item.titleKey} asChild defaultOpen className="group/collapsible">
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton tooltip={title}>
                                        {item.icon && <item.icon />}
                                        <span>{title}</span>
                                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        {item.items?.map((subItem) =>
                                            !subItem.role || (subItem.role && subItem.role === currentRole) ? (
                                                <SidebarMenuSubItem key={subItem.titleKey}>
                                                    <SidebarMenuSubButton asChild>
                                                        <Link to={item.url + subItem.url}>
                                                            <span>{t(subItem.titleKey)}</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ) : null
                                        )}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>
                    ) : (
                        <SidebarMenuButton asChild tooltip={title}>
                            <Link to={item.url}>
                                {item.icon && <item.icon />}
                                <span>{title}</span>
                            </Link>
                        </SidebarMenuButton>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
