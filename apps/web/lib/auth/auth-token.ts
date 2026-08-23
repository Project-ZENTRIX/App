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
