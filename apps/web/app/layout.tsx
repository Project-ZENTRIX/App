import { Geist_Mono, Noto_Sans } from "next/font/google";

import { cn } from "@workspace/ui/lib/utils";
import { LayoutWrapper } from "@/components/layout/wrapper";

import "@workspace/ui/globals.css";
import "@/styles/custom.css";

const notoSans = Noto_Sans({ subsets: ["latin"], variable: "--font-sans" });

const fontMono = Geist_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            className={cn("antialiased", fontMono.variable, "font-sans", notoSans.variable)}>
            <body className="min-h-screen w-full">
                <LayoutWrapper>{children}</LayoutWrapper>
            </body>
        </html>
    );
}
