export const supportedLocales = ["zh-CN", "en-GB"] as const;

export type Locale = (typeof supportedLocales)[number];

export const defaultLocale: Locale = "en-GB";

export function isLocale(value: string): value is Locale {
    return supportedLocales.includes(value as Locale);
}

export function getLocaleFromValue(value: string | null | undefined): Locale {
    if (value && isLocale(value)) {
        return value;
    }

    return defaultLocale;
}
