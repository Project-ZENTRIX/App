export function AccountFormsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="bg-background/95 flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    <a href="#" className="flex items-center gap-3 font-mono text-lg font-bold">
                        <img src="/images/logo-dark.png" className="size-8 rounded-md" />
                        Project ZENTRIX
                    </a>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">{children}</div>
                </div>
            </div>
            <div className="relative hidden lg:block"></div>
        </div>
    );
}
