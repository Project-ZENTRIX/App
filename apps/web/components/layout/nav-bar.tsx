import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";

export function HomeNavBar() {
    const NavBarItems = [
        {
            label: "Home",
            href: "/",
        },
        {
            label: "About",
            href: "/about",
        },
        {
            label: "Contact",
            href: "/contact",
        },
    ];

    return (
        <div className="flex h-16 w-full items-center justify-center">
            <nav className="border-accent bg-accent/25 flex h-full w-full items-center rounded-xl border px-4 backdrop-blur-sm">
                <span className="font-mono text-xl font-bold">Project ZENTRIX</span>

                <section className="ml-auto flex items-center gap-4">
                    {NavBarItems.map((item) => (
                        <Button key={item.href} variant="ghost" className="text-foreground/75">
                            {item.label}
                        </Button>
                    ))}
                </section>

                <Separator className="mx-4 my-3" orientation="vertical" />

                <section className="flex items-center gap-4">
                    <Button variant="secondary">Login</Button>
                    <Button>Sign Up</Button>
                </section>
            </nav>
        </div>
    );
}

