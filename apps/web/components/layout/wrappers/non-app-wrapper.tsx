import { ReactNode } from "react";
import { HomeNavBar } from "../nav-bar";

export default function NonAppWrapper({ children }: { children: ReactNode }) {
    return (
        <div className="relative h-full w-full">
            <section id="_zentrix.comp-nav" className="absolute top-4 z-3 w-full px-16">
                <HomeNavBar />
            </section>

            {children}
        </div>
    );
}

