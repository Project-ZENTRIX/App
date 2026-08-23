import { getAuthToken as getStoredAuthToken } from "@/lib/auth/auth-token";

export function getAuthorizedHeaders() {
    const token = getStoredAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : undefined;
}
