import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { Button } from "@shared/ui/components/button";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from "@shared/ui/components/field";
import { Input } from "@shared/ui/components/input";
import { cn } from "@shared/ui/lib/utils";

export function ForgotpasswordForm({ className, ...props }: React.ComponentProps<"form">) {
    const { t } = useTranslation("account-forms");

    return (
        <form className={cn("flex flex-col gap-6", className)} {...props}>
            <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold">{t("forgot-password.title")}</h1>
                    <p className="text-muted-foreground text-sm text-balance">{t("forgot-password.description")}</p>
                </div>
                <Field>
                    <FieldLabel htmlFor="email">{t("forgot-password.email.label")}</FieldLabel>
                    <Input id="email" type="email" placeholder="m@example.com" autoComplete="email" required />
                </Field>
                <Field>
                    <Button type="submit">{t("forgot-password.action")}</Button>
                </Field>
                <FieldSeparator />
                <Field>
                    <FieldDescription className="text-center">
                        {t("forgot-password.jumps.remember")}{" "}
                        <Link to="/auth/login" className="underline underline-offset-4">
                            {t("login.action")}
                        </Link>
                    </FieldDescription>
                </Field>
            </FieldGroup>
        </form>
    );
}
