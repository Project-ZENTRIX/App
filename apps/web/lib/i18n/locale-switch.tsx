"use client";

import { useRouter } from "next/navigation";

import { Button } from "@workspace/ui/components/button";
import { useDictionary, useLocale } from "./locale-context";
import type { Locale } from "./locales";

function setLocaleCookie(locale: Locale) {
    document.cookie = `zentrix-locale=${locale}; path=/; max-age=31536000`;
}

export function LocaleSwitcher() {
    const router = useRouter();
    const locale = useLocale();
    const dictionary = useDictionary();

    const nextLocale: Locale = locale === "zh-CN" ? "en-GB" : "zh-CN";

    const handleChange = () => {
        setLocaleCookie(nextLocale);
        router.refresh();
    };

    return (
        <Button variant="ghost" size="sm" className="text-foreground/75" onClick={handleChange}>
            {dictionary.navigation.language}: {dictionary.languageNames[locale]}
        </Button>
    );
}
