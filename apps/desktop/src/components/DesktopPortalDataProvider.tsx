"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { loadDesktopPortalSnapshot, type DesktopPortalSnapshot } from "../lib/desktop-api";

const initialSnapshot: DesktopPortalSnapshot = {
    loading: true,
    error: null,
    account: null,
    accessProfile: null,
    license: null,
    courses: [],
    contentPacks: [],
    devices: [],
    orders: [],
    memberships: [],
    progressEvents: [],
    runs: [],
    progress: null,
    cacheCount: 0,
};

const DesktopPortalDataContext = createContext<DesktopPortalSnapshot>(initialSnapshot);

export function DesktopPortalDataProvider({ children }: { children: ReactNode }) {
    const [snapshot, setSnapshot] = useState<DesktopPortalSnapshot>(initialSnapshot);

    useEffect(() => {
        let active = true;

        const load = async () => {
            try {
                const next = await loadDesktopPortalSnapshot();
                if (active) {
                    setSnapshot(next);
                }
            } catch (error) {
                if (!active) {
                    return;
                }

                setSnapshot({
                    ...initialSnapshot,
                    loading: false,
                    error: error instanceof Error ? error.message : "Failed to load desktop portal data",
                });
            }
        };

        void load();

        return () => {
            active = false;
        };
    }, []);

    const value = useMemo(() => snapshot, [snapshot]);

    return <DesktopPortalDataContext.Provider value={value}>{children}</DesktopPortalDataContext.Provider>;
}

export function useDesktopPortalData() {
    return useContext(DesktopPortalDataContext);
}
