type FetchLike = typeof fetch;

type SupabaseClientConfig = {
    baseUrl: string;
    anonKey: string;
    serviceRoleKey: string;
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
    raw_user_meta_data?: Record<string, unknown> | null;
    user_metadata?: Record<string, unknown> | null;
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

type CurrentSupabaseUser = SupabaseAuthUser & {
    access_token: string;
};

export class SupabaseClientError extends Error {
    constructor(
        message: string,
        public readonly status: number,
        public readonly payload: SupabaseErrorPayload | null
    ) {
        super(message);
        this.name = "SupabaseClientError";
    }
}

function normalizeHeaders(headers?: HeadersInit) {
    if (!headers) {
        return {};
    }

    if (headers instanceof Headers) {
        return Object.fromEntries(headers.entries());
    }

    if (Array.isArray(headers)) {
        return Object.fromEntries(headers);
    }

    return headers;
}

export class SupabaseClient {
    constructor(
        private readonly config: SupabaseClientConfig,
        private readonly transport: FetchLike = globalThis.fetch.bind(globalThis)
    ) {}

    private buildTablePath(schema: string, table: string) {
        return schema === "public" ? table : `${schema}.${table}`;
    }

    private async parseJson<T>(response: Response) {
        const text = await response.text();
        if (!text) {
            return null as T | null;
        }

        return JSON.parse(text) as T;
    }

    private async request<T>(url: string, init: RequestInit, apiKey = this.config.serviceRoleKey): Promise<T> {
        const providedHeaders = normalizeHeaders(init.headers);
        const response = await this.transport(url, {
            ...init,
            headers: {
                apikey: apiKey,
                Authorization: providedHeaders.Authorization ?? `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                ...providedHeaders,
            },
        });

        const payload = (await this.parseJson<SupabaseErrorPayload | T>(response)) as T | SupabaseErrorPayload | null;
        if (!response.ok) {
            const errorPayload =
                payload && typeof payload === "object" && ("message" in payload || "error_description" in payload)
                    ? (payload as SupabaseErrorPayload)
                    : null;
            throw new SupabaseClientError(
                errorPayload?.message ??
                    errorPayload?.error_description ??
                    `Supabase request failed with status ${response.status}`,
                response.status,
                errorPayload
            );
        }

        return payload as T;
    }

    async signInWithPassword(email: string, password: string): Promise<SupabaseAuthSession> {
        return this.request<SupabaseAuthSession>(
            `${this.config.baseUrl}/auth/v1/token?grant_type=password`,
            {
                method: "POST",
                headers: {
                    apikey: this.config.anonKey,
                    Authorization: `Bearer ${this.config.anonKey}`,
                },
                body: JSON.stringify({ email, password }),
            },
            this.config.anonKey
        );
    }

    async signUpWithPassword(
        email: string,
        password: string,
        data?: Record<string, unknown>
    ): Promise<{ user: SupabaseAuthUser; session: SupabaseAuthSession | null }> {
        const payload = await this.request<SupabaseSignupResponse>(
            `${this.config.baseUrl}/auth/v1/signup`,
            {
                method: "POST",
                headers: {
                    apikey: this.config.anonKey,
                    Authorization: `Bearer ${this.config.anonKey}`,
                },
                body: JSON.stringify({ email, password, data }),
            },
            this.config.anonKey
        );

        if (payload.session) {
            return {
                user: payload.user,
                session: payload.session,
            };
        }

        if (payload.access_token && payload.refresh_token) {
            return {
                user: payload.user,
                session: {
                    access_token: payload.access_token,
                    refresh_token: payload.refresh_token,
                    user: payload.user,
                },
            };
        }

        return {
            user: payload.user,
            session: null,
        };
    }

    async getCurrentUser(authorization?: string): Promise<CurrentSupabaseUser | null> {
        if (!authorization) {
            return null;
        }

        try {
            const user = await this.request<SupabaseAuthUser>(`${this.config.baseUrl}/auth/v1/user`, {
                method: "GET",
                headers: {
                    Authorization: authorization,
                },
            });

            return {
                ...user,
                access_token: authorization.split(" ")[1] ?? authorization,
            };
        } catch (error) {
            if (error instanceof SupabaseClientError && error.status === 401) {
                return null;
            }

            throw error;
        }
    }

    async updateCurrentUser(authorization: string, data: Record<string, unknown>): Promise<SupabaseAuthUser> {
        return this.request<SupabaseAuthUser>(`${this.config.baseUrl}/auth/v1/user`, {
            method: "PUT",
            headers: {
                Authorization: authorization,
            },
            body: JSON.stringify(data),
        });
    }

    async selectRows<T>(
        schema: string,
        table: string,
        filters: Record<string, string | number | boolean | null> = {},
        select = "*",
        orderBy?: { column: string; ascending?: boolean }
    ): Promise<T[]> {
        const url = new URL(`${this.config.baseUrl}/rest/v1/${this.buildTablePath(schema, table)}`);
        url.searchParams.set("select", select);

        for (const [key, value] of Object.entries(filters)) {
            if (value === null) {
                url.searchParams.set(key, "is.null");
            } else {
                url.searchParams.set(key, `eq.${String(value)}`);
            }
        }

        if (orderBy) {
            url.searchParams.set("order", `${orderBy.column}.${orderBy.ascending === false ? "desc" : "asc"}`);
        }

        return this.request<T[]>(url.toString(), {
            method: "GET",
        });
    }

    async selectOne<T>(
        schema: string,
        table: string,
        filters: Record<string, string | number | boolean | null> = {},
        select = "*",
        orderBy?: { column: string; ascending?: boolean }
    ): Promise<T | null> {
        const rows = await this.selectRows<T>(schema, table, filters, select, orderBy);
        return rows[0] ?? null;
    }

    async upsertRow<T>(schema: string, table: string, row: Record<string, unknown>, onConflict: string): Promise<T> {
        const url = new URL(`${this.config.baseUrl}/rest/v1/${this.buildTablePath(schema, table)}`);
        url.searchParams.set("on_conflict", onConflict);

        const rows = await this.request<T[]>(url.toString(), {
            method: "POST",
            headers: {
                Prefer: "resolution=merge-duplicates,return=representation",
            },
            body: JSON.stringify([row]),
        });

        return rows[0];
    }

    async insertRow<T>(schema: string, table: string, row: Record<string, unknown>): Promise<T> {
        const rows = await this.request<T[]>(`${this.config.baseUrl}/rest/v1/${this.buildTablePath(schema, table)}`, {
            method: "POST",
            headers: {
                Prefer: "return=representation",
            },
            body: JSON.stringify([row]),
        });

        return rows[0];
    }

    async updateRows<T>(
        schema: string,
        table: string,
        filters: Record<string, string | number | boolean | null>,
        patch: Record<string, unknown>
    ): Promise<T[]> {
        const url = new URL(`${this.config.baseUrl}/rest/v1/${this.buildTablePath(schema, table)}`);
        for (const [key, value] of Object.entries(filters)) {
            url.searchParams.set(key, value === null ? "is.null" : `eq.${String(value)}`);
        }

        return this.request<T[]>(url.toString(), {
            method: "PATCH",
            headers: {
                Prefer: "return=representation",
            },
            body: JSON.stringify(patch),
        });
    }

    async deleteRows<T>(
        schema: string,
        table: string,
        filters: Record<string, string | number | boolean | null>
    ): Promise<T[]> {
        const url = new URL(`${this.config.baseUrl}/rest/v1/${this.buildTablePath(schema, table)}`);
        for (const [key, value] of Object.entries(filters)) {
            url.searchParams.set(key, value === null ? "is.null" : `eq.${String(value)}`);
        }

        return this.request<T[]>(url.toString(), {
            method: "DELETE",
            headers: {
                Prefer: "return=representation",
            },
        });
    }

    async listSessions(userId: string) {
        return this.selectRows<Record<string, unknown>>(
            "public",
            "user_sessions",
            {
                user_id: userId,
            },
            "id,user_id,created_at,updated_at,expires_at,revoked_at,ip_address,user_agent",
            { column: "created_at", ascending: false }
        );
    }

    async revokeSession(userId: string, sessionId: string) {
        await this.deleteRows("public", "user_sessions", {
            id: sessionId,
            user_id: userId,
        });
    }

    async signOut(authorization: string) {
        return this.request<Record<string, never>>(`${this.config.baseUrl}/auth/v1/logout`, {
            method: "POST",
            headers: {
                Authorization: authorization,
            },
        });
    }
}

export function createSupabaseClient(config: SupabaseClientConfig) {
    return new SupabaseClient(config);
}

export type { CurrentSupabaseUser, SupabaseAuthSession, SupabaseAuthUser, SupabaseClientConfig };
