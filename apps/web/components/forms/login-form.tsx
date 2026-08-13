"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { IconifyIcon } from "@/components/iconify-icon";
import { setAuthToken, signIn } from "@/lib/api/endpoints/auth-api";
import { toast } from "sonner";

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [pending, setPending] = useState(false);
    const redirectTo = useMemo(() => {
        const redirect = searchParams.get("redirect");
        if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
            return redirect;
        }
        return "/app";
    }, [searchParams]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setPending(true);

        try {
            const account = await signIn({ email, password });
            setAuthToken(account.token);
            toast.success("Logged in successfully");
            router.replace(redirectTo);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Login failed");
        } finally {
            setPending(false);
        }
    };

    if (searchParams.get("redirect")) {
        toast.info("Please login first");
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} data-pathname={pathname} {...props}>
            <Card className="overflow-hidden p-0">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <form className="p-6 md:p-8" onSubmit={handleSubmit}>
                        <FieldGroup>
                            <div className="flex flex-col items-center gap-2 text-center">
                                <h1 className="text-2xl font-bold">Welcome back</h1>
                                <p className="text-muted-foreground text-balance">Login to your Project ZENTRIX account</p>
                            </div>
                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    required
                                    autoComplete="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                />
                            </Field>
                            <Field>
                                <div className="flex items-center">
                                    <FieldLabel htmlFor="password">Password</FieldLabel>
                                    <a href="#" className="ms-auto text-sm underline-offset-2 hover:underline">
                                        Forgot your password?
                                    </a>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                />
                            </Field>
                            <Field>
                                <Button type="submit" disabled={pending}>
                                    {pending ? "Logging in..." : "Login"}
                                </Button>
                            </Field>
                            <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                                or continue with
                            </FieldSeparator>
                            <Field className="grid grid-cols-4 gap-4">
                                <Button variant="outline" type="button" disabled>
                                    <IconifyIcon icon="fa6-brands:apple" className="size-4.25 -translate-y-px" />
                                    <span className="sr-only">Login with Apple</span>
                                </Button>
                                <Button variant="outline" type="button">
                                    <IconifyIcon icon="fa6-brands:google" className="size-3.5" />
                                    <span className="sr-only">Login with Google</span>
                                </Button>
                                <Button variant="outline" type="button">
                                    <IconifyIcon icon="fa6-brands:github" />
                                    <span className="sr-only">Login with GitHub</span>
                                </Button>
                                <Button variant="outline" type="button">
                                    <IconifyIcon icon="fa6-brands:meta" />
                                    <span className="sr-only">Login with Meta</span>
                                </Button>
                            </Field>
                            <FieldDescription className="text-center">
                                Don&apos;t have an account? <Link href="/account/signup">Sign up</Link>
                            </FieldDescription>
                        </FieldGroup>
                    </form>
                    <div className="bg-muted relative hidden md:block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/static/images/account-page-deco.png"
                            alt="Image"
                            width={1024}
                            height={1536}
                            className="absolute inset-0 h-full w-full object-cover opacity-90 grayscale-50 dark:brightness-50"
                        />
                    </div>
                </CardContent>
            </Card>
            <FieldDescription className="px-6 text-center">
                By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
            </FieldDescription>
        </div>
    );
}
