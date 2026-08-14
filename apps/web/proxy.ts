import { NextResponse, type NextRequest } from "next/server";

import { defaultLocale, isLocale } from "@/lib/i18n";

const localeCookieName = "zentrix-locale";
const localeHeaderName = "x-zentrix-locale";

function resolvePreferredLocale(request: NextRequest) {
    const cookieLocale = request.cookies.get(localeCookieName)?.value;
    if (cookieLocale && isLocale(cookieLocale)) {
        return cookieLocale;
    }

    const headerLocale = request.headers.get(localeHeaderName);
    if (headerLocale && isLocale(headerLocale)) {
        return headerLocale;
    }

    const acceptLanguage = request.headers.get("accept-language") ?? "";
    if (acceptLanguage.includes("zh")) {
        return "zh-CN";
    }

    if (acceptLanguage.includes("en")) {
        return "en-GB";
    }

    return defaultLocale;
}

export function proxy(request: NextRequest) {
    const locale = resolvePreferredLocale(request);
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(localeHeaderName, locale);
    requestHeaders.set("accept-language", locale);
    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
    response.cookies.set(localeCookieName, locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
    response.headers.set(localeHeaderName, locale);
    return response;
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
