import { type ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";

import { dictionaries } from "./dictionaries";
import type { DesktopDictionary } from "./types";
import { defaultLocale, getPreferredDesktopLocale, type Locale } from "./locales";

interface LocaleContextValue {
    locale: Locale;
    dictionary: DesktopDictionary;
    setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
    const [locale, setLocale] = useState<Locale>(() => getPreferredDesktopLocale());

    useEffect(() => {
        setLocale(getPreferredDesktopLocale());
    }, []);

    useEffect(() => {
        const dictionary = dictionaries[locale];
        window.localStorage.setItem("zentrix-locale", locale);
        document.documentElement.lang = locale;
        document.title = dictionary.appName;
    }, [locale]);

    const value = useMemo(() => ({ locale, dictionary: dictionaries[locale], setLocale }), [locale]);

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

export function useSetLocale() {
    const context = useContext(LocaleContext);
    if (!context) {
        throw new Error("LocaleProvider is missing");
    }

    return context.setLocale;
}
