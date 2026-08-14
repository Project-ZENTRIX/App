import { cookies, headers } from "next/headers";

import { defaultLocale, isLocale, type Locale } from "./locales";

const localeCookieName = "zentrix-locale";
const localeHeaderName = "x-zentrix-locale";

export async function getRequestLocale(): Promise<Locale> {
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get(localeCookieName)?.value;
    if (cookieLocale && isLocale(cookieLocale)) {
        return cookieLocale;
    }

    const headerLocale = (await headers()).get(localeHeaderName);
    if (headerLocale && isLocale(headerLocale)) {
        return headerLocale;
    }

    const acceptLanguage = (await headers()).get("accept-language") ?? "";
    const preferred = acceptLanguage
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .find((value) => value.startsWith("zh") || value.startsWith("en"));

    if (preferred?.startsWith("en")) {
        return "en-GB";
    }

    if (preferred?.startsWith("zh")) {
        return "zh-CN";
    }

    return defaultLocale;
}

export function getLocaleCookieName() {
    return localeCookieName;
}

export function getLocaleHeaderName() {
    return localeHeaderName;
}
