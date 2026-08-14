"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/layout/error-state";
import { useLocale } from "@/lib/i18n";

const copy = {
    "zh-CN": {
        title: "有内容暂停了门户",
        description: "应用区域遇到了意外问题。你可以尝试重新加载当前视图，或者先离开错误页继续从仪表盘操作。",
        message: "应用的这一部分遇到了一个意外运行时错误。",
        retry: "再试一次",
        home: "返回仪表盘",
    },
    "en-GB": {
        title: "Something paused the portal",
        description:
            "The app section hit an unexpected problem. You can try loading this view again, or leave the error state and continue from the dashboard.",
        message: "An unexpected runtime error interrupted this area of the app.",
        retry: "Try again",
        home: "Back to dashboard",
    },
} as const;

type AppErrorProps = {
    error: Error & { digest?: string };
    unstable_retry: () => void;
};

export default function AppError({ error, unstable_retry }: AppErrorProps) {
    const locale = useLocale();
    const text = copy[locale];

    useEffect(() => {
        console.error(error);
    }, [error]);

    const isDevMessage = error.message && error.message.trim().length > 0;

    return (
        <section className="flex min-h-full items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
            <ErrorState
                title={text.title}
                description={text.description}
                message={isDevMessage ? error.message : text.message}
                retryLabel={text.retry}
                onRetry={unstable_retry}
                homeHref="/app"
                homeLabel={text.home}
                digest={error.digest}
            />
        </section>
    );
}
