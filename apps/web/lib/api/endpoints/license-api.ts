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
        devices: Array<{
            id: string;
            name: string;
            platform: string;
            bindingCount: number;
            lastSeenAt: string | null;
            createdAt: string;
            deviceBindings: Array<{
                id: string;
                bindingKey: string;
                boundAt: string;
                revokedAt: string | null;
                isPrimary: boolean;
                deviceSlot: number;
                desktopLicense: {
                    id: string;
                    licenseKey: string;
                } | null;
            }>;
        }>;
    }>("/auth/me/license/devices", {
        method: "GET",
        headers: getAuthorizedHeaders(),
    });
}
