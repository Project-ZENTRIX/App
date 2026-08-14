type DesktopLicensePayload = {
    id: string;
    licenseKey: string;
    status: string;
    maxDevices: number;
    maxPrimaryDevices: number;
    issuedAt: Date;
    expiresAt: Date | null;
    deviceCount: number;
    primaryDeviceCount: number;
};

type LicenseEventPayload = {
    id: string;
    eventType: string;
    payload: unknown;
    createdAt: Date;
};

type DeviceBindingPayload = {
    id: string;
    bindingKey: string;
    deviceSlot: number;
    isPrimary: boolean;
    boundAt: Date;
    revokedAt: Date | null;
    deviceFingerprint: string | null;
    desktopLicense: {
        id: string;
        licenseKey: string;
        status: string;
        expiresAt: Date | null;
    };
};

type DevicePayload = {
    id: string;
    deviceKey: string;
    name: string | null;
    platform: string | null;
    createdAt: Date;
    updatedAt: Date;
    bindingCount: number;
    bindings: DeviceBindingPayload[];
};

export function summarizeDesktopLicense(license: {
    id: string;
    licenseKey: string;
    status: string;
    maxDevices: number;
    maxPrimaryDevices: number;
    issuedAt: Date;
    expiresAt: Date | null;
    devices: Array<{ revokedAt: Date | null; deletedAt: Date | null; isPrimary: boolean }>;
}): DesktopLicensePayload {
    const activeDevices = license.devices.filter((binding) => binding.deletedAt === null && binding.revokedAt === null);
    const primaryDevices = activeDevices.filter((binding) => binding.isPrimary);

    return {
        id: license.id,
        licenseKey: license.licenseKey,
        status: license.status,
        maxDevices: license.maxDevices,
        maxPrimaryDevices: license.maxPrimaryDevices,
        issuedAt: license.issuedAt,
        expiresAt: license.expiresAt,
        deviceCount: activeDevices.length,
        primaryDeviceCount: primaryDevices.length,
    };
}

export function mapDeviceBinding(binding: {
    id: string;
    bindingKey: string;
    deviceSlot: number;
    isPrimary: boolean;
    boundAt: Date;
    revokedAt: Date | null;
    deviceFingerprint: string | null;
    desktopLicense: {
        id: string;
        licenseKey: string;
        status: string;
        expiresAt: Date | null;
    };
}): DeviceBindingPayload {
    return {
        id: binding.id,
        bindingKey: binding.bindingKey,
        deviceSlot: binding.deviceSlot,
        isPrimary: binding.isPrimary,
        boundAt: binding.boundAt,
        revokedAt: binding.revokedAt,
        deviceFingerprint: binding.deviceFingerprint,
        desktopLicense: {
            id: binding.desktopLicense.id,
            licenseKey: binding.desktopLicense.licenseKey,
            status: binding.desktopLicense.status,
            expiresAt: binding.desktopLicense.expiresAt,
        },
    };
}

export function mapDevice(device: {
    id: string;
    deviceKey: string;
    name: string | null;
    platform: string | null;
    createdAt: Date;
    updatedAt: Date;
    deviceBindings: Array<{
        id: string;
        bindingKey: string;
        deviceSlot: number;
        isPrimary: boolean;
        boundAt: Date;
        revokedAt: Date | null;
        deletedAt: Date | null;
        deviceFingerprint: string | null;
        desktopLicense: {
            id: string;
            licenseKey: string;
            status: string;
            expiresAt: Date | null;
        };
    }>;
}): DevicePayload {
    return {
        id: device.id,
        deviceKey: device.deviceKey,
        name: device.name,
        platform: device.platform,
        createdAt: device.createdAt,
        updatedAt: device.updatedAt,
        bindingCount: device.deviceBindings.filter((binding) => binding.revokedAt === null).length,
        bindings: device.deviceBindings.map((binding) => mapDeviceBinding(binding)),
    };
}

export function mapLicenseEvent(event: {
    id: string;
    eventType: string;
    payload: unknown;
    createdAt: Date;
}): LicenseEventPayload {
    return {
        id: event.id,
        eventType: event.eventType,
        payload: event.payload,
        createdAt: event.createdAt,
    };
}
