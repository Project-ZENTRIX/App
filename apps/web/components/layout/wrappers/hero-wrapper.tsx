/**
 * Hero Layout
 *
 * Use it **Before Everything**
 */
export function HeroWrapper({ children }: { children: React.ReactNode }) {
    return <div className="h-screen min-h-screen w-screen">{children}</div>;
}
