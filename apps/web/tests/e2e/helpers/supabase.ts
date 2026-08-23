import { expect, type APIRequestContext } from "@playwright/test";
import { loadLocalEnv } from "../../../lib/env/load-local-env";

export const supabaseRestUrl = "http://127.20.0.1:54321/rest/v1";

loadLocalEnv(process.cwd());

function readRequiredEnv(name: string) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
}

export const supabaseAnonKey = readRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
export const supabaseServiceRoleKey = readRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");

type SupabaseSignupResponse = {
    user: { id: string; email: string };
    access_token?: string;
    session: { access_token: string } | null;
};

export async function createSupabaseTestAccount(request: APIRequestContext, email: string, password: string) {
    const response = await request.post("http://127.20.0.1:54321/auth/v1/signup", {
        headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
            "Content-Type": "application/json",
        },
        data: {
            email,
            password,
            data: {
                name: email.split("@")[0],
            },
        },
    });

    expect(response.ok(), "supabase sign up should succeed").toBeTruthy();

    const payload = (await response.json()) as SupabaseSignupResponse;
    expect(payload.user.id).toBeTruthy();

    let token = payload.session?.access_token ?? payload.access_token ?? "";
    if (!token) {
        const signInResponse = await request.post("http://127.20.0.1:54321/auth/v1/token?grant_type=password", {
            headers: {
                apikey: supabaseAnonKey,
                Authorization: `Bearer ${supabaseAnonKey}`,
                "Content-Type": "application/json",
            },
            data: {
                email,
                password,
            },
        });

        expect(signInResponse.ok(), "supabase sign in should succeed").toBeTruthy();
        const signInPayload = (await signInResponse.json()) as { access_token?: string };
        token = signInPayload.access_token ?? "";
    }

    expect(token).toBeTruthy();

    const sessionResponse = await request.post(`${supabaseRestUrl}/user_sessions`, {
        headers: {
            apikey: supabaseServiceRoleKey,
            Authorization: `Bearer ${supabaseServiceRoleKey}`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
        },
        data: [
            {
                id: `session-${payload.user.id}-${Date.now()}`,
                user_id: payload.user.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                expires_at: null,
                revoked_at: null,
                ip_address: null,
                user_agent: null,
            },
        ],
    });

    expect(sessionResponse.ok(), "supabase session record should succeed").toBeTruthy();

    return {
        token,
        user: payload.user,
    };
}
