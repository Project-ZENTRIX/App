import { expect, type APIResponse } from "@playwright/test";

export type ApiEnvelope<T> = {
    success: boolean;
    message: string;
    data: T;
};

export async function expectApiOk<T>(responsePromise: Promise<APIResponse>, message: string) {
    const response = await responsePromise;
    expect(response.ok(), message).toBeTruthy();
    const payload = (await response.json()) as ApiEnvelope<T>;
    expect(payload.success, message).toBe(true);
    expect(payload.message, message).toBe("OK");
    return payload.data;
}

export function createTestEmail(label: string) {
    return `${label}.${Date.now()}.${Math.random().toString(36).slice(2)}@zentrix.test`;
}

export function createTestPassword() {
    return "ZentrixPass123!";
}

export const apiBaseUrl = "http://127.20.0.1:4000/api";

export function apiUrl(path: string) {
    return `${apiBaseUrl}${path}`;
}
