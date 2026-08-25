import type { ComponentType } from "react";

import { BarChart3, BookOpenText, Clock3, Cog, PackageSearch, PanelLeftOpen, PlaySquare, Rows3 } from "lucide-react";
import type { StudentPageId } from "../features/navigation/student-pages";

export interface SidebarItem {
    id: StudentPageId;
    label: string;
}

const iconByPageId: Record<StudentPageId, ComponentType<{ className?: string }>> = {
    startup: Clock3,
    "pack-selection": PackageSearch,
    workspace: Rows3,
    "lesson-details": BookOpenText,
    "runs-and-submissions": PlaySquare,
    "sync-cache": BarChart3,
    settings: Cog,
};

interface SidebarNavProps {
    items: readonly SidebarItem[];
    activeId: StudentPageId;
    onSelect: (pageId: StudentPageId) => void;
}

export function SidebarNav({ items, activeId, onSelect }: SidebarNavProps) {
    return (
        <nav aria-label="学生客户端页面" className="sidebar-nav">
            <div className="sidebar-brand">
                <span className="sidebar-brand-mark">ZX</span>
                <div>
                    <div className="sidebar-brand-name">ZENTRIX</div>
                    <div className="sidebar-brand-caption">Student Client</div>
                </div>
            </div>
            <div className="sidebar-group-label">学习执行端</div>
            <div className="sidebar-links">
                {items.map((item) => {
                    const Icon = iconByPageId[item.id]!;
                    const active = item.id === activeId;

                    return (
                        <button
                            key={item.id}
                            type="button"
                            aria-pressed={active}
                            className={active ? "sidebar-link sidebar-link-active" : "sidebar-link"}
                            onClick={() => onSelect(item.id)}>
                            <Icon className="sidebar-link-icon" aria-hidden="true" />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </div>
            <div className="sidebar-footer">
                <PanelLeftOpen className="sidebar-footer-icon" aria-hidden="true" />
                <span>桌面端工作台</span>
            </div>
        </nav>
    );
}
