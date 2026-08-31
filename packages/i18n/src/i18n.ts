import i18next, { type i18n } from "i18next";

import { resources } from "./resources";

export const defaultNS = "common";

export const supportedLngs = ["en", "zh-CN"] as const;

export type Locale = (typeof supportedLngs)[number];

export const i18nInst: i18n = i18next.createInstance();

export async function initI18n(locale: Locale = "en"): Promise<i18n> {
    if (i18nInst.isInitialized) {
        await i18nInst.changeLanguage(locale);
        return i18nInst;
    }

    await i18nInst.init({
        resources,

        lng: locale,
        fallbackLng: "en",

        supportedLngs,
        defaultNS,

        interpolation: {
            escapeValue: false,
        },

        react: {
            useSuspense: false,
        },
    });

    return i18nInst;
}
