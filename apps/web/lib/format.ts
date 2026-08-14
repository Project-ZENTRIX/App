import { defaultLocale, type Locale } from "./i18n/locales";

export function formatDateTime(value: string | null | undefined, locale: Locale = defaultLocale) {
    if (!value) {
        return "-";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

export function formatCurrency(amount: string | number, currency = "CNY", locale: Locale = defaultLocale) {
    const value = typeof amount === "string" ? Number(amount) : amount;
    if (!Number.isFinite(value)) {
        return `${amount} ${currency}`;
    }

    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
    }).format(value);
}
