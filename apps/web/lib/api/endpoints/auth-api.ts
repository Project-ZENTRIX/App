import { apiRequest } from "../client";

export type SignInInput = {
    email: string;
    password: string;
};

export type SignUpInput = {
    email: string;
    password: string;
    confirmPassword: string;
};

export type AuthSession = {
    token: string | null;
    user: unknown;
};

export type CurrentAccount = {
    user: UserProfile;
    token: string | null;
};

export type UserProfile = {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
    userProfile?: {
        bio: string | null;
        avatarUrl: string | null;
    } | null;
};

export type UpdateProfileInput = {
    name?: string;
    image?: string | null;
    bio?: string | null;
};

export type UpdatePasswordInput = {
    currentPassword: string;
    newPassword: string;
};

export type NotificationPreferences = {
    email: boolean;
    sms: boolean;
    inApp: boolean;
};

export type UpdateNotificationPreferencesInput = Partial<NotificationPreferences>;

export type SessionItem = {
    id: string;
    token: string;
    expiresAt: string;
    createdAt: string;
    revokedAt: string | null;
    ipAddress: string | null;
    userAgent: string | null;
};

export type AuditRecord = {
    id: string;
    action: string;
    createdAt: string;
    metadata?: Record<string, unknown> | null;
};

const AUTH_TOKEN_KEY = "zentrix-auth-token";

export function getAuthToken() {
    if (typeof window === "undefined") {
        return null;
    }

    return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string | null) {
    if (typeof window === "undefined") {
        return;
    }

    if (!token) {
        window.localStorage.removeItem(AUTH_TOKEN_KEY);
        return;
    }

    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

function authHeaders() {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export function signIn(input: SignInInput) {
    return apiRequest<AuthSession>("/auth/signin", {
        method: "POST",
        body: input,
    });
}

export function signUp(input: SignUpInput) {
    return apiRequest<AuthSession>("/auth/signup", {
        method: "POST",
        body: input,
    });
}

export function getCurrentAccount() {
    return apiRequest<CurrentAccount>("/auth/me", {
        method: "GET",
        headers: authHeaders(),
    });
}

export function updateProfile(input: UpdateProfileInput) {
    return apiRequest<{ user: UserProfile }>("/auth/me/profile", {
        method: "PATCH",
        headers: authHeaders(),
        body: input,
    });
}

export function updatePassword(input: UpdatePasswordInput) {
    return apiRequest<{ success: true }>("/auth/me/password", {
        method: "PATCH",
        headers: authHeaders(),
        body: input,
    });
}

export function getNotificationPreferences() {
    return apiRequest<NotificationPreferences>("/auth/me/notification-preferences", {
        method: "GET",
        headers: authHeaders(),
    });
}

export function updateNotificationPreferences(input: UpdateNotificationPreferencesInput) {
    return apiRequest<NotificationPreferences>("/auth/me/notification-preferences", {
        method: "PATCH",
        headers: authHeaders(),
        body: input,
    });
}

export function listSessions() {
    return apiRequest<{ sessions: SessionItem[] }>("/auth/me/sessions", {
        method: "GET",
        headers: authHeaders(),
    });
}

export function revokeSession(sessionId: string) {
    return apiRequest<{ success: true }>(`/auth/me/sessions/${sessionId}`, {
        method: "DELETE",
        headers: authHeaders(),
    });
}

export function getAuditRecords() {
    return apiRequest<{ records: AuditRecord[] }>("/auth/me/audit-records", {
        method: "GET",
        headers: authHeaders(),
    });
}

export function getStoredAuthToken() {
    return getAuthToken();
}
