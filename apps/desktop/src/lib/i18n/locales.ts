export const supportedLocales = ["zh-CN", "en-GB"] as const;

export type Locale = (typeof supportedLocales)[number];

export const defaultLocale: Locale = "zh-CN";

export function isLocale(value: string): value is Locale {
    return supportedLocales.includes(value as Locale);
}

export function getPreferredDesktopLocale(): Locale {
    if (typeof window === "undefined") {
        return defaultLocale;
    }

    const stored = window.localStorage.getItem("zentrix-locale");
    if (stored && isLocale(stored)) {
        return stored;
    }

    const language = window.navigator.language || window.navigator.languages?.[0];
    if (language && language.toLowerCase().startsWith("en")) {
        return "en-GB";
    }

    return defaultLocale;
}
