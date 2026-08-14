import { Geist_Mono, Noto_Sans } from "next/font/google";

import { cn } from "@workspace/ui/lib/utils";
import { LayoutWrapper } from "@/components/layout/wrapper";
import { LocaleProvider } from "@/lib/i18n/locale-context";
import { dictionaries } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n/request";

import "@workspace/ui/globals.css";
import "@/styles/custom.css";

const notoSans = Noto_Sans({ subsets: ["latin"], variable: "--font-sans" });

const fontMono = Geist_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
});

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const locale = await getRequestLocale();
    const dictionary = dictionaries[locale];

    return (
        <html
            lang={locale}
            suppressHydrationWarning
            className={cn("antialiased", fontMono.variable, "font-sans", notoSans.variable)}>
            <body className="min-h-screen w-full">
                <LocaleProvider locale={locale} dictionary={dictionary}>
                    <LayoutWrapper>{children}</LayoutWrapper>
                </LocaleProvider>
            </body>
        </html>
    );
}
