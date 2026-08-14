import type { Dictionary } from "./dictionaries";
import type { Locale } from "./locales";

export function formatTemplate(template: string, params?: Record<string, string | number>) {
    if (!params) {
        return template;
    }

    return Object.entries(params).reduce((current, [key, value]) => current.replaceAll(`{${key}}`, String(value)), template);
}

export function localizeErrorMessage(message: string, dictionary: Dictionary) {
    const key = message.startsWith("error.") ? message.slice("error.".length) : message;
    const map = dictionary.errors as Record<string, string>;
    return map[key] ?? message;
}

export function getBrowserLocale(fallback: Locale): Locale {
    if (typeof document !== "undefined") {
        const cookieLocale = document.cookie
            .split(";")
            .map((item) => item.trim())
            .find((item) => item.startsWith("zentrix-locale="))
            ?.split("=")[1];
        if (cookieLocale === "zh-CN" || cookieLocale === "en-GB") {
            return cookieLocale;
        }
    }

    if (typeof navigator !== "undefined") {
        const language = navigator.language;
        if (language.startsWith("en")) {
            return "en-GB";
        }
        if (language.startsWith("zh")) {
            return "zh-CN";
        }
    }

    return fallback;
}
