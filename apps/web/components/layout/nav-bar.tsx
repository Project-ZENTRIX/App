import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";

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

export function NavBar() {
    return (
        <div className="flex h-16 w-full items-center justify-center">
            <nav className="border-accent bg-accent/25 flex h-full w-full items-center rounded-xl border px-4 backdrop-blur-sm">
                <span className="text-xl font-bold font-mono">Project ZENTRIX</span>

                <section className="flex items-center ml-auto gap-4">
                    {NavBarItems.map((item) => (
                        <Button key={item.href} variant="ghost" className="text-foreground/75">
                            {item.label}
                        </Button>
                    ))}
                </section>

                    <Separator className="my-3 mx-4" orientation="vertical" />

                <section className="flex items-center gap-4">
                    <Button variant="secondary">Login</Button>
                    <Button>Sign Up</Button>
                </section>
            </nav>
        </div>
    );
}

