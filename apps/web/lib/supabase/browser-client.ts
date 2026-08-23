import { getAuthToken } from "@/lib/auth/auth-token";

const DEFAULT_SUPABASE_URL = "http://127.20.0.1:54321";

type RestFetchOptions = Omit<RequestInit, "body"> & {
    body?: unknown;
    token?: string | null;
};

type SupabaseErrorPayload = {
    message?: string;
    error_description?: string;
};

type SupabaseAuthUser = {
    id: string;
    email: string;
    created_at: string;
    updated_at: string;
    email_confirmed_at?: string | null;
    user_metadata?: Record<string, unknown> | null;
    raw_user_meta_data?: Record<string, unknown> | null;
};

type SupabaseAuthSession = {
    access_token: string;
    refresh_token: string;
    user: SupabaseAuthUser;
};

type SupabaseSignupResponse = {
    access_token?: string;
    refresh_token?: string;
    user: SupabaseAuthUser;
    session?: SupabaseAuthSession | null;
};

type ProfileRow = {
    id: string;
    display_name: string;
    avatar_url: string | null;
    bio: string | null;
    created_at: string;
    updated_at: string;
};

type NotificationPreferencesRow = {
    user_id: string;
    email: boolean;
    sms: boolean;
    in_app: boolean;
};

type AuditLogRow = {
    id: string;
    action: string;
    created_at: string;
    payload: Record<string, unknown> | null;
};

export class SupabaseBrowserError extends Error {
    constructor(
        message: string,
        public readonly status: number,
        public readonly payload: SupabaseErrorPayload | null
    ) {
        super(message);
        this.name = "SupabaseBrowserError";
    }
}

function getSupabaseConfig() {
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!anonKey) {
        throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY");
    }

    return {
        baseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? DEFAULT_SUPABASE_URL,
        anonKey,
    };
}

function toHeaders(initHeaders?: HeadersInit, token?: string | null) {
    const headers = new Headers(initHeaders);
    const { anonKey } = getSupabaseConfig();

    headers.set("apikey", anonKey);
    headers.set("Authorization", `Bearer ${token ?? getAuthToken() ?? anonKey}`);

    return headers;
}

function buildUrl(path: string) {
    const { baseUrl } = getSupabaseConfig();
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }

    return `${baseUrl}${path}`;
}

async function parseJson<T>(response: Response) {
    const text = await response.text();
    if (!text) {
        return null as T | null;
    }

    return JSON.parse(text) as T;
}

async function request<T>(path: string, init: RestFetchOptions = {}) {
    const { token, body, ...requestInit } = init;
    const headers = toHeaders(requestInit.headers, token);
    const hasBody = body !== undefined;

    if (hasBody && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetch(buildUrl(path), {
        ...requestInit,
        headers,
        body: hasBody ? JSON.stringify(body) : undefined,
    });

    const payload = (await parseJson<SupabaseErrorPayload | T>(response)) as T | SupabaseErrorPayload | null;
    if (!response.ok) {
        const errorPayload =
            payload && typeof payload === "object" && ("message" in payload || "error_description" in payload)
                ? (payload as SupabaseErrorPayload)
                : null;

        throw new SupabaseBrowserError(
            errorPayload?.message ??
                errorPayload?.error_description ??
                `Supabase request failed with status ${response.status}`,
            response.status,
            errorPayload
        );
    }

    return payload as T;
}

type AuthUserResponse = Pick<
    SupabaseAuthUser,
    "id" | "email" | "created_at" | "updated_at" | "email_confirmed_at" | "user_metadata" | "raw_user_meta_data"
>;

export async function signInWithPassword(email: string, password: string) {
    const { baseUrl, anonKey } = getSupabaseConfig();
    const response = await fetch(`${baseUrl}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: {
            apikey: anonKey,
            Authorization: `Bearer ${anonKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    });

    const payload = (await parseJson<SupabaseAuthSession | SupabaseErrorPayload>(response)) as
        | SupabaseAuthSession
        | SupabaseErrorPayload
        | null;
    if (!response.ok) {
        const errorPayload =
            payload && typeof payload === "object" && ("message" in payload || "error_description" in payload)
                ? (payload as SupabaseErrorPayload)
                : null;

        throw new SupabaseBrowserError(
            errorPayload?.message ??
                errorPayload?.error_description ??
                `Supabase request failed with status ${response.status}`,
            response.status,
            errorPayload
        );
    }

    return payload as SupabaseAuthSession;
}

export async function signUpWithPassword(email: string, password: string, data?: Record<string, unknown>) {
    const { baseUrl, anonKey } = getSupabaseConfig();
    const response = await fetch(`${baseUrl}/auth/v1/signup`, {
        method: "POST",
        headers: {
            apikey: anonKey,
            Authorization: `Bearer ${anonKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, data }),
    });

    const payload = (await parseJson<SupabaseSignupResponse | SupabaseErrorPayload>(response)) as
        | SupabaseSignupResponse
        | SupabaseErrorPayload
        | null;
    if (!response.ok) {
        const errorPayload =
            payload && typeof payload === "object" && ("message" in payload || "error_description" in payload)
                ? (payload as SupabaseErrorPayload)
                : null;

        throw new SupabaseBrowserError(
            errorPayload?.message ??
                errorPayload?.error_description ??
                `Supabase request failed with status ${response.status}`,
            response.status,
            errorPayload
        );
    }

    const signupPayload = payload as SupabaseSignupResponse;
    if (signupPayload.session) {
        return {
            user: signupPayload.user,
            session: signupPayload.session,
        };
    }

    if (signupPayload.access_token && signupPayload.refresh_token) {
        return {
            user: signupPayload.user,
            session: {
                access_token: signupPayload.access_token,
                refresh_token: signupPayload.refresh_token,
                user: signupPayload.user,
            },
        };
    }

    return {
        user: signupPayload.user,
        session: null,
    };
}

export async function getCurrentUser(token?: string | null) {
    const { anonKey } = getSupabaseConfig();
    const response = await fetch(buildUrl("/auth/v1/user"), {
        method: "GET",
        headers: {
            apikey: anonKey,
            Authorization: `Bearer ${token ?? getAuthToken() ?? anonKey}`,
        },
    });

    if (response.status === 401) {
        throw new SupabaseBrowserError("Unauthorized", response.status, null);
    }

    const payload = (await parseJson<AuthUserResponse | SupabaseErrorPayload>(response)) as
        | AuthUserResponse
        | SupabaseErrorPayload
        | null;
    if (!response.ok) {
        const errorPayload =
            payload && typeof payload === "object" && ("message" in payload || "error_description" in payload)
                ? (payload as SupabaseErrorPayload)
                : null;

        throw new SupabaseBrowserError(
            errorPayload?.message ??
                errorPayload?.error_description ??
                `Supabase request failed with status ${response.status}`,
            response.status,
            errorPayload
        );
    }

    return payload as AuthUserResponse;
}

export async function updateCurrentUser(token: string, data: Record<string, unknown>) {
    const { anonKey } = getSupabaseConfig();
    return request<SupabaseAuthUser>("/auth/v1/user", {
        method: "PUT",
        headers: {
            apikey: anonKey,
            Authorization: `Bearer ${token}`,
        },
        body: data,
        token,
    });
}

function buildTablePath(schema: string, table: string) {
    return schema === "public" ? table : `${schema}.${table}`;
}

export async function selectRows<T>(
    schema: string,
    table: string,
    filters: Record<string, string | number | boolean | null> = {},
    select = "*",
    orderBy?: { column: string; ascending?: boolean },
    token?: string | null
) {
    const url = new URL(buildUrl(`/rest/v1/${buildTablePath(schema, table)}`));
    url.searchParams.set("select", select);

    Object.entries(filters).forEach(([key, value]) => {
        url.searchParams.set(key, value === null ? "is.null" : `eq.${String(value)}`);
    });

    if (orderBy) {
        url.searchParams.set("order", `${orderBy.column}.${orderBy.ascending === false ? "desc" : "asc"}`);
    }

    const { anonKey } = getSupabaseConfig();
    return request<T[]>(url.toString(), {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token ?? getAuthToken() ?? anonKey}`,
        },
        token,
    });
}

export async function selectOne<T>(
    schema: string,
    table: string,
    filters: Record<string, string | number | boolean | null> = {},
    select = "*",
    orderBy?: { column: string; ascending?: boolean },
    token?: string | null
) {
    const rows = await selectRows<T>(schema, table, filters, select, orderBy, token);
    return rows[0] ?? null;
}

export async function upsertRow<T>(
    schema: string,
    table: string,
    row: Record<string, unknown>,
    onConflict: string,
    token?: string | null
) {
    const url = new URL(buildUrl(`/rest/v1/${buildTablePath(schema, table)}`));
    url.searchParams.set("on_conflict", onConflict);

    const rows = await request<T[]>(url.toString(), {
        method: "POST",
        headers: {
            Prefer: "resolution=merge-duplicates,return=representation",
        },
        body: [row],
        token,
    });

    return rows[0];
}

export type { AuditLogRow, NotificationPreferencesRow, ProfileRow, SupabaseAuthSession, SupabaseAuthUser };
