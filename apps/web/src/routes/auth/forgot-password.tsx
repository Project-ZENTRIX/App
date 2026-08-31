import { ForgotpasswordForm } from "$/components/forms/forgot-password-form";
import { AccountFormsLayout } from "$/layouts/account-forms";
import { LightfallBackgroundLayout } from "$/layouts/lightfall-background";

import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/auth/forgot-password")({
    component: LoginPage,
});

function LoginPage() {
    return (
        <LightfallBackgroundLayout>
            <AccountFormsLayout>
                <ForgotpasswordForm />
            </AccountFormsLayout>
        </LightfallBackgroundLayout>
    );
}
