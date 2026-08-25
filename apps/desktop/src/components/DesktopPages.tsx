import type { StudentPageId } from "../features/navigation/student-pages";
import { CatalogSurface, StartupSurface } from "./desktop-startup-catalog";
import { RecordsSurface, SettingsSurface, SyncCacheSurface, WorkspaceSurface, LessonDetailsSurface } from "./desktop-workspace";

export function DesktopPages({ pageId }: { pageId: StudentPageId }) {
    switch (pageId) {
        case "startup":
            return <StartupSurface />;
        case "pack-selection":
            return <CatalogSurface />;
        case "workspace":
            return <WorkspaceSurface />;
        case "lesson-details":
            return <LessonDetailsSurface />;
        case "runs-and-submissions":
            return <RecordsSurface />;
        case "sync-cache":
            return <SyncCacheSurface />;
        case "settings":
            return <SettingsSurface />;
        default:
            return null;
    }
}
