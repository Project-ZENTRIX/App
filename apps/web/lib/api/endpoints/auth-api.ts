import { apiRequest } from "../client";
import { getAuthToken as readAuthToken } from "@/lib/auth/auth-token";

export type SessionItem = {
    id: string;
    token: string;
    expiresAt: string;
    createdAt: string;
    revokedAt: string | null;
    ipAddress: string | null;
    userAgent: string | null;
};

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

function authHeaders() {
    const token = readAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : undefined;
}
