import { cookies, headers } from "next/headers";

import { dictionaries } from "./dictionaries";
import { defaultLocale, getLocaleFromValue, isLocale, type Locale } from "./locales";

const localeCookieName = "zentrix-locale";

export async function getRequestLocale(): Promise<Locale> {
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get(localeCookieName)?.value;
    if (cookieLocale && isLocale(cookieLocale)) {
        return cookieLocale;
    }

    const headerStore = await headers();
    const headerLocale = headerStore.get("x-zentrix-locale");
    if (headerLocale && isLocale(headerLocale)) {
        return headerLocale;
    }

    const acceptLanguage = headerStore.get("accept-language") ?? "";
    const preferredLocale = acceptLanguage
        .split(",")
        .map((item: string) => item.trim())
        .find((value: string) => {
            if (value.startsWith("zh")) {
                return true;
            }

            if (value.startsWith("en")) {
                return true;
            }

            return false;
        });

    if (preferredLocale?.startsWith("en")) {
        return "en-GB";
    }

    if (preferredLocale?.startsWith("zh")) {
        return "zh-CN";
    }

    return defaultLocale;
}

export function getServerDictionary(locale: Locale) {
    return dictionaries[locale];
}

export function getLocaleCookieName() {
    return localeCookieName;
}

export function getLocaleFromCookieValue(value: string | null | undefined) {
    return getLocaleFromValue(value);
}
