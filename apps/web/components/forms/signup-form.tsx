"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { IconifyIcon } from "@/components/iconify-icon";
import { signUp } from "@/lib/supabase/auth-queries";
import { useDictionary } from "@/lib/i18n";
import { toast } from "sonner";

export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [pending, setPending] = useState(false);
    const router = useRouter();
    const t = useDictionary();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setPending(true);

        try {
            await signUp({ email, password, confirmPassword });
            toast.success(t.auth.createAccountSuccess);
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            router.push("/account/login");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : t.auth.createAccountFailed);
        } finally {
            setPending(false);
        }
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="overflow-hidden p-0">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <form className="p-6 md:p-8" onSubmit={handleSubmit}>
                        <FieldGroup>
                            <div className="flex flex-col items-center gap-2 text-center">
                                <h1 className="text-2xl font-bold">{t.auth.createAccountTitle}</h1>
                                <p className="text-muted-foreground text-sm text-balance">{t.auth.createAccountDescription}</p>
                            </div>
                            <Field>
                                <FieldLabel htmlFor="email">{t.auth.emailLabel}</FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                />
                                <FieldDescription>{t.auth.emailHint}</FieldDescription>
                            </Field>
                            <Field>
                                <Field className="grid grid-cols-2 gap-4">
                                    <Field>
                                        <FieldLabel htmlFor="password">{t.auth.passwordLabel}</FieldLabel>
                                        <Input
                                            id="password"
                                            type="password"
                                            required
                                            autoComplete="new-password"
                                            value={password}
                                            onChange={(event) => setPassword(event.target.value)}
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="confirm-password">{t.auth.confirmPasswordLabel}</FieldLabel>
                                        <Input
                                            id="confirm-password"
                                            type="password"
                                            required
                                            autoComplete="new-password"
                                            value={confirmPassword}
                                            onChange={(event) => setConfirmPassword(event.target.value)}
                                        />
                                    </Field>
                                </Field>
                                <FieldDescription>{t.auth.passwordHint}</FieldDescription>
                            </Field>
                            <Field>
                                <Button type="submit" disabled={pending}>
                                    {pending ? t.auth.loading : t.auth.createAccountButton}
                                </Button>
                            </Field>
                            <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                                {t.auth.continueWith}
                            </FieldSeparator>
                            <Field className="grid grid-cols-4 gap-4">
                                <Button variant="outline" type="button" disabled>
                                    <IconifyIcon icon="fa6-brands:apple" className="size-4.25 -translate-y-px" />
                                    <span className="sr-only">Continue with Apple</span>
                                </Button>
                                <Button variant="outline" type="button">
                                    <IconifyIcon icon="fa6-brands:google" className="size-3.5" />
                                    <span className="sr-only">Continue with Google</span>
                                </Button>
                                <Button variant="outline" type="button">
                                    <IconifyIcon icon="fa6-brands:github" />
                                    <span className="sr-only">Continue with GitHub</span>
                                </Button>
                                <Button variant="outline" type="button">
                                    <IconifyIcon icon="fa6-brands:meta" />
                                    <span className="sr-only">Continue with Meta</span>
                                </Button>
                            </Field>
                            <FieldDescription className="text-center">
                                {t.auth.signupPromptPrefix} <Link href="/account/login">{t.navigation.login}</Link>
                            </FieldDescription>
                        </FieldGroup>
                    </form>
                    <div className="bg-muted relative hidden md:block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/static/images/account-page-deco.png"
                            alt="Project ZENTRIX account artwork"
                            width={1024}
                            height={1536}
                            className="absolute inset-0 h-full w-full object-cover opacity-90 grayscale-50 dark:brightness-60"
                        />
                    </div>
                </CardContent>
            </Card>
            <FieldDescription className="px-6 text-center">
                {t.auth.agreementPrefix} <a href="#">{t.auth.footerTerms}</a> {t.auth.agreementAnd}{" "}
                <a href="#">{t.auth.footerPolicy}</a>.
            </FieldDescription>
        </div>
    );
}
