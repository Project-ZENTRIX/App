"use client";

import { usePathname } from "next/navigation";
import { ShadcnWrapper } from "./wrappers/shadcn-wrapper";
import { HeroWrapper } from "./wrappers/hero-wrapper";

type WrapperComponent = React.ComponentType<{ children: React.ReactNode }>;

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // compiled wrapper list
    // push node into it with same layout order
    const wrappers: WrapperComponent[] = [];

    if (pathname === "/") {
        wrappers.push(HeroWrapper);
    }

    wrappers.push(ShadcnWrapper);

    // wrap children
    return wrappers.reduceRight((acc, Wrapper) => <Wrapper>{acc}</Wrapper>, children);
}
