import { LoginForm } from "$/components/forms/login-form";
import { AccountFormsLayout } from "$/layouts/account-forms";
import { LightfallBackgroundLayout } from "$/layouts/lightfall-background";

import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/auth/login")({
    component: LoginPage,
});

function LoginPage() {
    return (
        <LightfallBackgroundLayout>
            <AccountFormsLayout>
                <LoginForm />
            </AccountFormsLayout>
        </LightfallBackgroundLayout>
    );
}
