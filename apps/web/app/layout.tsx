import { Geist_Mono, Noto_Sans } from "next/font/google";

import "@workspace/ui/globals.css";
import { cn } from "@workspace/ui/lib/utils";
import { LayoutWrapper } from "@/components/layout/wrapper";

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
            <body>
                <LayoutWrapper>{children}</LayoutWrapper>
            </body>
        </html>
    );
}
