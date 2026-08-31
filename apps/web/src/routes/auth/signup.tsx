import { SignupForm } from "$/components/forms/signup-form";
import { AccountFormsLayout } from "$/layouts/account-forms";
import { LightfallBackgroundLayout } from "$/layouts/lightfall-background";

import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/auth/signup")({
    component: LoginPage,
});

function LoginPage() {
    return (
        <LightfallBackgroundLayout>
            <AccountFormsLayout>
                <SignupForm />
            </AccountFormsLayout>
        </LightfallBackgroundLayout>
    );
}
