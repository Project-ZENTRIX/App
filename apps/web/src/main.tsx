import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { initI18n } from "@shared/i18n";
import { router } from "./router";

import "@shared/ui/globals.css";
import "$/assets/custom.css";

async function bootstrap() {
    await initI18n("zh-CN");
    ReactDOM.createRoot(document.getElementById("root")!).render(
        <React.StrictMode>
            <RouterProvider router={router} />
        </React.StrictMode>
    );
}

bootstrap();
