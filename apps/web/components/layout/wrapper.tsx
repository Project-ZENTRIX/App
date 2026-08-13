"use client";

import { usePathname } from "next/navigation";
import { ShadcnWrapper } from "./wrappers/shadcn-wrapper";
import { HeroWrapper } from "./wrappers/hero-wrapper";
import NonAppWrapper from "./wrappers/non-app-wrapper";

type WrapperComponent = React.ComponentType<{ children: React.ReactNode }>;

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // compiled wrapper list
    // push node into it with same layout order
    const wrappers: WrapperComponent[] = [];

    if (pathname === "/" || pathname === "/pricing") {
        wrappers.push(HeroWrapper);
    }

    if (!pathname.includes("/app") || pathname.includes("/account")) {
        wrappers.push(NonAppWrapper);
    }

    wrappers.push(ShadcnWrapper);

    // wrap children
    return wrappers.reduceRight((acc, Wrapper) => <Wrapper>{acc}</Wrapper>, children);
}
