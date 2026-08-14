import { getStoredAuthToken } from "./endpoints/auth-api";

export function getAuthorizedHeaders() {
    const token = getStoredAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : undefined;
}
