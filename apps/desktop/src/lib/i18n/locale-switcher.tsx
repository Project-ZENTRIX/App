import { Button } from "@workspace/ui/components/button";

import { useDictionary, useLocale, useSetLocale } from "./locale-context";

export function LocaleSwitcher() {
    const locale = useLocale();
    const dictionary = useDictionary();
    const setLocale = useSetLocale();

    const nextLocale = locale === "zh-CN" ? "en-GB" : "zh-CN";

    return (
        <Button
            variant="ghost"
            size="sm"
            className="text-foreground/75"
            aria-label={dictionary.navigation.language}
            onClick={() => setLocale(nextLocale)}>
            {dictionary.navigation.language}: {dictionary.localeNames[locale]}
        </Button>
    );
}
