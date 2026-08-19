import { apiRequest } from "../client";
import { getAuthorizedHeaders } from "../auth";

export type LicenseOverview = {
    license: {
        id: string;
        licenseKey: string;
        status: string;
        maxDevices: number;
        deviceCount: number;
        issuedAt: string;
        expiresAt: string;
        latestEventAt: string | null;
        devices: Array<{
            id: string;
            deviceId: string;
            bindingKey: string;
            deviceSlot: number;
            isPrimary: boolean;
            boundAt: string;
            revokedAt: string | null;
            device: {
                id: string;
                name: string;
                platform: string;
                lastSeenAt: string | null;
            } | null;
        }>;
        events: Array<{
            id: string;
            eventType: string;
            createdAt: string;
            payload: unknown;
        }>;
    } | null;
};

export type DeviceItem = {
    id: string;
    deviceKey?: string;
    name: string;
    platform: string;
    bindingCount: number;
    lastSeenAt: string | null;
    createdAt: string;
    updatedAt: string;
    bindings: Array<{
        id: string;
        bindingKey: string;
        deviceSlot: number;
        isPrimary: boolean;
        boundAt: string;
        revokedAt: string | null;
        deviceFingerprint: string | null;
        desktopLicense: {
            id: string;
            licenseKey: string;
            status: string;
            expiresAt: string | null;
        } | null;
    }>;
};

export function getLicenseOverview() {
    return apiRequest<LicenseOverview>("/auth/me/license", {
        method: "GET",
        headers: getAuthorizedHeaders(),
    });
}

export function getLicenseHistory() {
    return apiRequest<{ licenses: LicenseOverview["license"][] }>("/auth/me/license/history", {
        method: "GET",
        headers: getAuthorizedHeaders(),
    });
}

export function listDevices() {
    return apiRequest<{
        devices: DeviceItem[];
    }>("/auth/me/license/devices", {
        method: "GET",
        headers: getAuthorizedHeaders(),
    });
}

export function getDevice(deviceId: string) {
    return apiRequest<{ device: DeviceItem | null }>(`/auth/me/license/devices/${deviceId}`, {
        method: "GET",
        headers: getAuthorizedHeaders(),
    });
}

export function generateBindingCode(deviceId: string) {
    return apiRequest<{ bindingCode: string; deviceId: string }>(`/auth/me/license/devices/${deviceId}/binding-code`, {
        method: "POST",
        headers: getAuthorizedHeaders(),
    });
}

export function bindDevice(input: {
    deviceId: string;
    bindingCode: string;
    deviceFingerprint?: string | null;
    deviceSlot?: number;
    isPrimary?: boolean;
}) {
    return apiRequest<{ binding: unknown }>("/auth/me/license/bindings", {
        method: "POST",
        headers: getAuthorizedHeaders(),
        body: input,
    });
}

export function unbindDevice(bindingId: string) {
    return apiRequest<{ success: true }>(`/auth/me/license/bindings/${bindingId}`, {
        method: "DELETE",
        headers: getAuthorizedHeaders(),
    });
}
