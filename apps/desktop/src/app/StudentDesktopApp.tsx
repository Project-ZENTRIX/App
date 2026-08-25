import { useMemo, useState } from "react";

import { PageCanvas } from "../components/PageCanvas";
import { SidebarNav } from "../components/SidebarNav";
import { StatusBadge } from "../components/StatusBadge";
import { defaultStudentPageId, getStudentPage, studentPages, type StudentPageId } from "../features/navigation/student-pages";

const pageItems = studentPages.map((page) => ({ id: page.id, label: page.label }));

export function StudentDesktopApp() {
    const [activePageId, setActivePageId] = useState<StudentPageId>(defaultStudentPageId);
    const activePage = useMemo(() => getStudentPage(activePageId), [activePageId]);

    return (
        <div className="app-shell">
            <SidebarNav items={pageItems} activeId={activePageId} onSelect={setActivePageId} />
            <main className="workspace-shell">
                <header className="workspace-topbar">
                    <div>
                        <div className="workspace-eyebrow">学习执行端</div>
                        <div className="workspace-product">ZENTRIX Student Client</div>
                    </div>
                    <div className="workspace-status-row">
                        <StatusBadge label="授权有效" tone="success" />
                        <StatusBadge label="本地缓存就绪" tone="neutral" />
                    </div>
                </header>
                <PageCanvas title={activePage.title} summary={activePage.summary} sections={activePage.sections} />
            </main>
        </div>
    );
}
