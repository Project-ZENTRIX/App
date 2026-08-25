import { createRoot } from "react-dom/client";

import { StudentDesktopApp } from "./app/StudentDesktopApp";
import "./styles/globals.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
    throw new Error("Root element not found.");
}

createRoot(rootElement).render(<StudentDesktopApp />);
