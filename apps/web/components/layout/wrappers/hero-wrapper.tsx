/**
 * Hero Layout
 *
 * Use it **Before Everything**
 */
export function HeroWrapper({ children }: { children: React.ReactNode }) {
    return <div className="flex min-h-screen w-full flex-col">{children}</div>;
}
