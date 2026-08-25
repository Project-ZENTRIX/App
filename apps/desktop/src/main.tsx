import { createRoot } from "react-dom/client";

import "@workspace/ui/globals.css";
import "./styles/globals.css";
import { StudentDesktopApp } from "./app/StudentDesktopApp";
import { DesktopAppProviders } from "./components/DesktopAppProviders";

const rootElement = document.getElementById("root");

if (!rootElement) {
    throw new Error("Root element not found.");
}

createRoot(rootElement).render(
    <DesktopAppProviders>
        <StudentDesktopApp />
    </DesktopAppProviders>
);
