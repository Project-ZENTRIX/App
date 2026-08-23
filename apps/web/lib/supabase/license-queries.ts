import { getCurrentUser, selectOne, selectRows } from "./browser-client";

type DesktopLicenseRow = {
    id: string;
    user_id: string;
    license_key: string;
    status: string;
    max_devices: number;
    max_primary_devices: number;
    issued_at: string;
    expires_at: string | null;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
};

type DeviceRow = {
    id: string;
    user_id: string;
    device_key: string;
    name: string | null;
    platform: string | null;
    created_at: string;
    updated_at: string;
};

type DeviceBindingRow = {
    id: string;
    user_id: string;
    desktop_license_id: string;
    device_id: string;
    binding_key: string;
    device_fingerprint: string | null;
    device_slot: number;
    is_primary: boolean;
    bound_at: string;
    revoked_at: string | null;
    deleted_at: string | null;
};

type LicenseEventRow = {
    id: string;
    desktop_license_id: string;
    event_type: string;
    payload: unknown;
    created_at: string;
    archived_at: string | null;
};

type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

export type LicenseOverview = {
    license: {
        id: string;
        licenseKey: string;
        status: string;
        maxDevices: number;
        deviceCount: number;
        issuedAt: string;
        expiresAt: string | null;
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

function toDateString(value: string | null | undefined) {
    return value ?? null;
}

async function requireSession(token?: string | null): Promise<CurrentUser> {
    const session = await getCurrentUser(token);
    if (!session) {
        throw new Error("Unauthorized");
    }

    return session;
}

function sortByCreatedAtDesc<T extends { created_at: string }>(items: T[]) {
    return [...items].sort((left, right) => right.created_at.localeCompare(left.created_at));
}

function mapLicenseEvent(event: LicenseEventRow) {
    return {
        id: event.id,
        eventType: event.event_type,
        createdAt: event.created_at,
        payload: event.payload,
    };
}

function mapLicenseSummary(
    license: DesktopLicenseRow,
    bindings: DeviceBindingRow[],
    devices: DeviceRow[],
    events: LicenseEventRow[]
) {
    const deviceById = new Map(devices.map((device) => [device.id, device]));
    const activeBindings = bindings.filter((binding) => binding.deleted_at === null && binding.revoked_at === null);

    return {
        id: license.id,
        licenseKey: license.license_key,
        status: license.status,
        maxDevices: license.max_devices,
        deviceCount: activeBindings.length,
        issuedAt: license.issued_at,
        expiresAt: license.expires_at,
        latestEventAt: events[0]?.created_at ?? null,
        devices: activeBindings.map((binding) => {
            const device = deviceById.get(binding.device_id) ?? null;
            return {
                id: binding.id,
                deviceId: binding.device_id,
                bindingKey: binding.binding_key,
                deviceSlot: binding.device_slot,
                isPrimary: binding.is_primary,
                boundAt: binding.bound_at,
                revokedAt: binding.revoked_at,
                device: device
                    ? {
                          id: device.id,
                          name: device.name ?? device.device_key,
                          platform: device.platform ?? "",
                          lastSeenAt: device.updated_at,
                      }
                    : null,
            };
        }),
        events: events.map(mapLicenseEvent),
    };
}

async function loadDesktopLicenses(userId: string, token?: string | null) {
    return selectRows<DesktopLicenseRow>(
        "public",
        "desktop_licenses",
        {
            user_id: userId,
            deleted_at: null,
        },
        "*",
        {
            column: "issued_at",
            ascending: false,
        },
        token
    );
}

async function loadBindingsForLicense(licenseId: string, token?: string | null) {
    return selectRows<DeviceBindingRow>(
        "public",
        "device_bindings",
        {
            desktop_license_id: licenseId,
            deleted_at: null,
        },
        "*",
        {
            column: "bound_at",
            ascending: false,
        },
        token
    );
}

async function loadDevicesForUser(userId: string, token?: string | null) {
    return selectRows<DeviceRow>(
        "public",
        "devices",
        {
            user_id: userId,
        },
        "*",
        {
            column: "created_at",
            ascending: false,
        },
        token
    );
}

async function loadEventsForLicense(licenseId: string, token?: string | null) {
    try {
        return await selectRows<LicenseEventRow>(
            "public",
            "license_events",
            {
                desktop_license_id: licenseId,
                archived_at: null,
            },
            "*",
            {
                column: "created_at",
                ascending: false,
            },
            token
        );
    } catch {
        return [];
    }
}

async function loadLicenseSummary(license: DesktopLicenseRow, token?: string | null) {
    const [bindings, devices, events] = await Promise.all([
        loadBindingsForLicense(license.id, token),
        loadDevicesForUser(license.user_id, token),
        loadEventsForLicense(license.id, token),
    ]);

    return mapLicenseSummary(license, bindings, devices, events);
}

async function loadDeviceBindings(deviceId: string, userId: string, token?: string | null) {
    return selectRows<DeviceBindingRow>(
        "public",
        "device_bindings",
        {
            device_id: deviceId,
            user_id: userId,
            deleted_at: null,
        },
        "*",
        {
            column: "bound_at",
            ascending: false,
        },
        token
    );
}

async function loadLicenseById(licenseId: string, userId: string, token?: string | null) {
    return selectOne<DesktopLicenseRow>(
        "public",
        "desktop_licenses",
        {
            id: licenseId,
            user_id: userId,
            deleted_at: null,
        },
        "*",
        undefined,
        token
    );
}

async function mapDeviceItem(device: DeviceRow, bindings: DeviceBindingRow[], token?: string | null): Promise<DeviceItem> {
    const licenseIds = Array.from(new Set(bindings.map((binding) => binding.desktop_license_id)));
    const licenses = await Promise.all(licenseIds.map((licenseId) => loadLicenseById(licenseId, device.user_id, token)));
    const licenseById = new Map(licenses.filter(Boolean).map((license) => [license!.id, license!]));

    return {
        id: device.id,
        deviceKey: device.device_key,
        name: device.name ?? device.device_key,
        platform: device.platform ?? "",
        bindingCount: bindings.filter((binding) => binding.revoked_at === null).length,
        lastSeenAt: toDateString(device.updated_at),
        createdAt: device.created_at,
        updatedAt: device.updated_at,
        bindings: bindings.map((binding) => ({
            id: binding.id,
            bindingKey: binding.binding_key,
            deviceSlot: binding.device_slot,
            isPrimary: binding.is_primary,
            boundAt: binding.bound_at,
            revokedAt: binding.revoked_at,
            deviceFingerprint: binding.device_fingerprint,
            desktopLicense: licenseById.get(binding.desktop_license_id)
                ? {
                      id: licenseById.get(binding.desktop_license_id)!.id,
                      licenseKey: licenseById.get(binding.desktop_license_id)!.license_key,
                      status: licenseById.get(binding.desktop_license_id)!.status,
                      expiresAt: licenseById.get(binding.desktop_license_id)!.expires_at,
                  }
                : null,
        })),
    };
}

export async function getLicenseOverview(token?: string | null): Promise<LicenseOverview> {
    const session = await requireSession(token);
    const licenses = await loadDesktopLicenses(session.id, token);
    const current = licenses.find((license) => license.status === "active") ?? licenses[0] ?? null;

    if (!current) {
        return { license: null };
    }

    return {
        license: await loadLicenseSummary(current, token),
    };
}

export async function getLicenseHistory(token?: string | null) {
    const session = await requireSession(token);
    const licenses = await loadDesktopLicenses(session.id, token);

    return {
        licenses: await Promise.all(licenses.map((license) => loadLicenseSummary(license, token))),
    };
}

export async function listDevices(token?: string | null) {
    const session = await requireSession(token);
    const devices = await loadDevicesForUser(session.id, token);

    return {
        devices: await Promise.all(
            sortByCreatedAtDesc(devices).map(async (device) => {
                const bindings = await loadDeviceBindings(device.id, session.id, token);
                return mapDeviceItem(device, bindings, token);
            })
        ),
    };
}

export async function getDevice(deviceId: string, token?: string | null) {
    const session = await requireSession(token);
    const device = await selectOne<DeviceRow>(
        "public",
        "devices",
        {
            id: deviceId,
            user_id: session.id,
        },
        "*",
        undefined,
        token
    );

    if (!device) {
        return { device: null };
    }

    const bindings = await loadDeviceBindings(device.id, session.id, token);
    return {
        device: await mapDeviceItem(device, bindings, token),
    };
}
