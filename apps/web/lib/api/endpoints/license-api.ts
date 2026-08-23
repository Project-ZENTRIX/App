import { apiRequest } from "../client";
import { getAuthorizedHeaders } from "../auth";
import {
    getDevice as loadDevice,
    getLicenseHistory as loadLicenseHistory,
    getLicenseOverview as loadLicenseOverview,
    listDevices as loadDevices,
    type DeviceItem,
    type LicenseOverview,
} from "@/lib/supabase/license-queries";

export function getLicenseOverview() {
    return loadLicenseOverview();
}

export function getLicenseHistory() {
    return loadLicenseHistory();
}

export function listDevices() {
    return loadDevices();
}

export function getDevice(deviceId: string) {
    return loadDevice(deviceId);
}

export type { DeviceItem, LicenseOverview };

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
