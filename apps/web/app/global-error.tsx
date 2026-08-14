"use client";

import { useEffect, useState } from "react";

import { ErrorState } from "@/components/layout/error-state";

const copy = {
    "zh-CN": {
        title: "整个外壳需要重置",
        description: "一个顶层错误越过了路由边界。这个兜底页会保留站点风格，并给你一条返回路径。",
        message: "应用壳层遇到了一个顶层运行时错误。",
        retry: "重新加载外壳",
        home: "返回首页",
    },
    "en-GB": {
        title: "The whole shell needs a reset",
        description:
            "A top-level error escaped the route boundary. This fallback keeps the site branded and gives you a path back in.",
        message: "A top-level runtime error interrupted the application shell.",
        retry: "Reload shell",
        home: "Go home",
    },
} as const;

function resolveLocale() {
    if (typeof document === "undefined") {
        return "en-GB";
    }

    return document.documentElement.lang === "zh-CN" ? "zh-CN" : "en-GB";
}

type GlobalErrorProps = {
    error: Error & { digest?: string };
    unstable_retry: () => void;
};

export default function GlobalError({ error, unstable_retry }: GlobalErrorProps) {
    const [locale, setLocale] = useState<keyof typeof copy>("en-GB");
    const text = copy[locale];

    useEffect(() => {
        console.error(error);
    }, [error]);

    useEffect(() => {
        setLocale(resolveLocale());
    }, []);

    const hasMessage = error.message && error.message.trim().length > 0;

    return (
        <html lang={locale}>
            <body className="bg-background text-foreground min-h-screen">
                <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
                    <ErrorState
                        title={text.title}
                        description={text.description}
                        message={hasMessage ? error.message : text.message}
                        retryLabel={text.retry}
                        onRetry={unstable_retry}
                        homeHref="/"
                        homeLabel={text.home}
                        digest={error.digest}
                    />
                </main>
            </body>
        </html>
    );
}
