"use client";

import { createContext, useContext, useMemo } from "react";

import type { Dictionary } from "./dictionaries";
import type { Locale } from "./locales";

type LocaleContextValue = {
    locale: Locale;
    dictionary: Dictionary;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
    locale,
    dictionary,
    children,
}: Readonly<{
    locale: Locale;
    dictionary: Dictionary;
    children: React.ReactNode;
}>) {
    const value = useMemo(() => ({ locale, dictionary }), [dictionary, locale]);
    return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
    const context = useContext(LocaleContext);
    if (!context) {
        throw new Error("LocaleProvider is missing");
    }

    return context.locale;
}

export function useDictionary() {
    const context = useContext(LocaleContext);
    if (!context) {
        throw new Error("LocaleProvider is missing");
    }

    return context.dictionary;
}
