import { SignupForm } from "@/components/forms/signup-form";

export default function SignupPage() {
    return (
        <section
            id="_zentrix.comp-content"
            className="flex min-h-[calc(100svh-64px)] flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm md:max-w-4xl">
                <SignupForm />
            </div>
        </section>
    );
}
