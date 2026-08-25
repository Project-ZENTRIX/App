import { enGB } from "./en-GB";
import { zhCN } from "./zh-CN";
import type { Locale } from "./locales";
import type { DesktopDictionary } from "./types";

export const dictionaries: Record<Locale, DesktopDictionary> = {
    "zh-CN": zhCN,
    "en-GB": enGB,
};

export type Dictionary = (typeof dictionaries)[Locale];
