import { useState } from "react";

import { DesktopAppProviders } from "../components/DesktopAppProviders";
import { DesktopPages } from "../components/DesktopPages";
import { DesktopShell } from "../components/DesktopShell";
import { defaultStudentPageId, type StudentPageId } from "../features/navigation/student-pages";

export function StudentDesktopApp() {
    const [activePageId, setActivePageId] = useState<StudentPageId>(defaultStudentPageId);

    return (
        <DesktopAppProviders>
            <DesktopShell activePageId={activePageId} onSelectPage={setActivePageId}>
                <DesktopPages pageId={activePageId} />
            </DesktopShell>
        </DesktopAppProviders>
    );
}
