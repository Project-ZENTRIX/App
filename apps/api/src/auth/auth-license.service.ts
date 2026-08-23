import { BadRequestException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { errorKeys } from "../common/errors/error-keys.js";
import { SUPABASE_CLIENT } from "../common/supabase/supabase.module.js";
import { SupabaseClient, type CurrentSupabaseUser } from "../common/supabase/supabase.client.js";
import { mapDeviceBinding, mapLicenseEvent, summarizeDesktopLicense } from "./auth-license-mappers.js";

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

type DesktopLicenseWithDevices = DesktopLicenseRow & {
    devices: Array<{
        revokedAt: Date | null;
        deletedAt: Date | null;
        isPrimary: boolean;
    }>;
};

type DeviceBindingWithLicense = DeviceBindingRow & {
    desktopLicense: {
        id: string;
        licenseKey: string;
        status: string;
        expiresAt: Date | null;
    };
};

type DeviceWithBindings = DeviceRow & {
    deviceBindings: Array<DeviceBindingWithLicense>;
};

function toDate(value: string | Date | null | undefined) {
    if (!value) {
        return null;
    }

    return value instanceof Date ? value : new Date(value);
}

function toDesktopLicenseSummary(license: DesktopLicenseRow, devices: DesktopLicenseWithDevices["devices"]) {
    return summarizeDesktopLicense({
        id: license.id,
        licenseKey: license.license_key,
        status: license.status,
        maxDevices: license.max_devices,
        maxPrimaryDevices: license.max_primary_devices,
        issuedAt: toDate(license.issued_at) ?? new Date(license.created_at),
        expiresAt: toDate(license.expires_at),
        devices,
    });
}

function toDeviceBindingPayload(binding: DeviceBindingRow, desktopLicense: DesktopLicenseRow) {
    return mapDeviceBinding({
        id: binding.id,
        bindingKey: binding.binding_key,
        deviceSlot: binding.device_slot,
        isPrimary: binding.is_primary,
        boundAt: toDate(binding.bound_at) ?? new Date(),
        revokedAt: toDate(binding.revoked_at),
        deviceFingerprint: binding.device_fingerprint,
        desktopLicense: {
            id: desktopLicense.id,
            licenseKey: desktopLicense.license_key,
            status: desktopLicense.status,
            expiresAt: toDate(desktopLicense.expires_at),
        },
    });
}

function toDevicePayload(device: DeviceRow, deviceBindings: DeviceBindingWithLicense[]) {
    return {
        id: device.id,
        deviceKey: device.device_key,
        name: device.name,
        platform: device.platform,
        createdAt: toDate(device.created_at) ?? new Date(),
        updatedAt: toDate(device.updated_at) ?? new Date(),
        bindingCount: deviceBindings.filter((binding) => binding.revoked_at === null).length,
        bindings: deviceBindings.map((binding) =>
            mapDeviceBinding({
                id: binding.id,
                bindingKey: binding.binding_key,
                deviceSlot: binding.device_slot,
                isPrimary: binding.is_primary,
                boundAt: toDate(binding.bound_at) ?? new Date(),
                revokedAt: toDate(binding.revoked_at),
                deviceFingerprint: binding.device_fingerprint,
                desktopLicense: {
                    id: binding.desktopLicense.id,
                    licenseKey: binding.desktopLicense.licenseKey,
                    status: binding.desktopLicense.status,
                    expiresAt: binding.desktopLicense.expiresAt,
                },
            })
        ),
    };
}

@Injectable()
export class AuthLicenseService {
    constructor(@Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient) {}

    private async requireCurrentUser(authorization?: string) {
        const user = await this.supabase.getCurrentUser(authorization);
        if (!user) {
            throw new UnauthorizedException(errorKeys.unauthorized);
        }

        return user;
    }

    private async getOrCreateDesktopLicense(userId: string) {
        const existing = await this.supabase.selectOne<DesktopLicenseRow>(
            "public",
            "desktop_licenses",
            {
                user_id: userId,
                deleted_at: null,
            },
            "*",
            { column: "issued_at", ascending: false }
        );

        if (existing) {
            return existing;
        }

        return this.supabase.insertRow<DesktopLicenseRow>("public", "desktop_licenses", {
            id: randomUUID(),
            user_id: userId,
            license_key: randomUUID(),
            status: "active",
            max_devices: 1,
            max_primary_devices: 1,
            issued_at: new Date().toISOString(),
        });
    }

    private async loadBindingsForLicense(licenseId: string) {
        return this.supabase.selectRows<DeviceBindingRow>("public", "device_bindings", {
            desktop_license_id: licenseId,
            deleted_at: null,
        });
    }

    private async loadDeviceBindingsForDevice(userId: string, deviceId: string) {
        return this.supabase.selectRows<DeviceBindingRow>("public", "device_bindings", {
            user_id: userId,
            device_id: deviceId,
            deleted_at: null,
        });
    }

    private async loadDeviceWithBindings(userId: string, deviceId: string) {
        const device = await this.supabase.selectOne<DeviceRow>("public", "devices", {
            id: deviceId,
            user_id: userId,
        });

        if (!device) {
            return null;
        }

        const bindings = await this.loadDeviceBindingsForDevice(userId, device.id);
        const withLicense = await Promise.all(
            bindings.map(async (binding) => {
                const desktopLicense = await this.supabase.selectOne<DesktopLicenseRow>("public", "desktop_licenses", {
                    id: binding.desktop_license_id,
                });

                if (!desktopLicense) {
                    return null;
                }

                return {
                    ...binding,
                    desktopLicense: {
                        id: desktopLicense.id,
                        licenseKey: desktopLicense.license_key,
                        status: desktopLicense.status,
                        expiresAt: toDate(desktopLicense.expires_at),
                    },
                };
            })
        );

        return {
            ...device,
            deviceBindings: withLicense.filter((item): item is DeviceBindingWithLicense => Boolean(item)),
        };
    }

    private async loadLicenseDetails(userId: string) {
        const license = await this.getOrCreateDesktopLicense(userId);
        const [bindings, events] = await Promise.all([
            this.loadBindingsForLicense(license.id),
            this.supabase.selectRows<LicenseEventRow>("public", "license_events", {
                desktop_license_id: license.id,
                archived_at: null,
            }),
        ]);

        return {
            ...license,
            devices: bindings.map((binding) => ({
                revokedAt: toDate(binding.revoked_at),
                deletedAt: toDate(binding.deleted_at),
                isPrimary: binding.is_primary,
            })),
            events,
        };
    }

    async getLicenseOverview(authorization?: string) {
        const session = await this.requireCurrentUser(authorization);
        const license = await this.loadLicenseDetails(session.id);
        return {
            license: license
                ? summarizeDesktopLicense({
                      id: license.id,
                      licenseKey: license.license_key,
                      status: license.status,
                      maxDevices: license.max_devices,
                      maxPrimaryDevices: license.max_primary_devices,
                      issuedAt: toDate(license.issued_at) ?? new Date(license.created_at),
                      expiresAt: toDate(license.expires_at),
                      devices: license.devices,
                  })
                : null,
        };
    }

    async getLicenseHistory(authorization?: string) {
        const session = await this.requireCurrentUser(authorization);
        const licenses = await this.supabase.selectRows<DesktopLicenseRow>(
            "public",
            "desktop_licenses",
            {
                user_id: session.id,
                deleted_at: null,
            },
            "*",
            { column: "issued_at", ascending: false }
        );

        const items = await Promise.all(
            licenses.map(async (license) => {
                const bindings = await this.loadBindingsForLicense(license.id);
                return toDesktopLicenseSummary(
                    license,
                    bindings.map((binding) => ({
                        revokedAt: toDate(binding.revoked_at),
                        deletedAt: toDate(binding.deleted_at),
                        isPrimary: binding.is_primary,
                    }))
                );
            })
        );

        return {
            licenses: items,
        };
    }

    async listDevices(authorization?: string) {
        const session = await this.requireCurrentUser(authorization);
        const devices = await this.supabase.selectRows<DeviceRow>(
            "public",
            "devices",
            {
                user_id: session.id,
            },
            "*",
            { column: "created_at", ascending: false }
        );

        const items = await Promise.all(
            devices.map(async (device) => {
                const bindings = await this.loadDeviceBindingsForDevice(session.id, device.id);
                const withLicense = await Promise.all(
                    bindings.map(async (binding) => {
                        const desktopLicense = await this.supabase.selectOne<DesktopLicenseRow>("public", "desktop_licenses", {
                            id: binding.desktop_license_id,
                        });

                        if (!desktopLicense) {
                            return null;
                        }

                        return {
                            ...binding,
                            desktopLicense: {
                                id: desktopLicense.id,
                                licenseKey: desktopLicense.license_key,
                                status: desktopLicense.status,
                                expiresAt: toDate(desktopLicense.expires_at),
                            },
                        };
                    })
                );

                return toDevicePayload(
                    device,
                    withLicense.filter((item): item is DeviceBindingWithLicense => Boolean(item))
                );
            })
        );

        return {
            devices: items,
        };
    }

    async getDevice(deviceId: string, authorization?: string) {
        const session = await this.requireCurrentUser(authorization);
        const device = await this.loadDeviceWithBindings(session.id, deviceId);

        return {
            device: device ? toDevicePayload(device, device.deviceBindings) : null,
        };
    }

    async generateBindingCode(deviceId: string, authorization?: string) {
        const session = await this.requireCurrentUser(authorization);
        const device = await this.supabase.selectOne<DeviceRow>("public", "devices", {
            id: deviceId,
            user_id: session.id,
        });

        if (!device) {
            throw new BadRequestException(errorKeys.deviceNotFound);
        }

        const license = await this.getOrCreateDesktopLicense(session.id);
        const bindingCode = randomUUID();

        await this.supabase.insertRow("public", "license_events", {
            id: randomUUID(),
            desktop_license_id: license.id,
            event_type: "binding_code_generated",
            payload: {
                deviceId: device.id,
                bindingCode,
                expiresAt: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
            },
        });

        return {
            bindingCode,
            deviceId: device.id,
        };
    }

    async bindDevice(
        body: {
            deviceId: string;
            bindingCode: string;
            deviceFingerprint?: string | null;
            deviceSlot?: number;
            isPrimary?: boolean;
        },
        authorization?: string
    ) {
        const session = await this.requireCurrentUser(authorization);

        if (!body || typeof body.deviceId !== "string" || typeof body.bindingCode !== "string") {
            throw new BadRequestException(errorKeys.invalidRequestPayload);
        }

        const license = await this.getOrCreateDesktopLicense(session.id);
        const codeEvents = await this.supabase.selectRows<LicenseEventRow>(
            "public",
            "license_events",
            {
                desktop_license_id: license.id,
                archived_at: null,
            },
            "*",
            { column: "created_at", ascending: false }
        );
        const codeEvent = codeEvents.find((event) => event.event_type === "binding_code_generated") ?? null;
        const codePayload =
            (codeEvent?.payload as { deviceId?: string; bindingCode?: string; expiresAt?: string } | null) ?? null;

        if (!codeEvent || codePayload?.bindingCode !== body.bindingCode || codePayload?.deviceId !== body.deviceId) {
            throw new BadRequestException(errorKeys.invalidBindingCode);
        }

        if (codePayload.expiresAt && Date.now() > Date.parse(codePayload.expiresAt)) {
            throw new BadRequestException(errorKeys.bindingCodeExpired);
        }

        const device = await this.supabase.selectOne<DeviceRow>("public", "devices", {
            id: body.deviceId,
            user_id: session.id,
        });

        if (!device) {
            throw new BadRequestException(errorKeys.deviceNotFound);
        }

        const activeBindings = await this.supabase.selectRows<DeviceBindingRow>("public", "device_bindings", {
            desktop_license_id: license.id,
            deleted_at: null,
        });
        const existingBindingCount = activeBindings.filter((binding) => binding.revoked_at === null).length;

        if (existingBindingCount >= license.max_devices) {
            throw new BadRequestException(errorKeys.deviceLimitReached);
        }

        const binding = await this.supabase.insertRow<DeviceBindingRow>("public", "device_bindings", {
            id: randomUUID(),
            user_id: session.id,
            desktop_license_id: license.id,
            device_id: device.id,
            binding_key: randomUUID(),
            device_fingerprint: body.deviceFingerprint ?? null,
            device_slot: body.deviceSlot ?? existingBindingCount + 1,
            is_primary: body.isPrimary ?? existingBindingCount === 0,
        });

        await this.supabase.updateRows(
            "public",
            "license_events",
            { id: codeEvent.id },
            { archived_at: new Date().toISOString() }
        );

        await this.supabase.insertRow("public", "license_events", {
            id: randomUUID(),
            desktop_license_id: license.id,
            event_type: "device_bound",
            payload: {
                bindingId: binding.id,
                deviceId: device.id,
                isPrimary: binding.is_primary,
            },
        });

        return {
            binding: mapDeviceBinding({
                id: binding.id,
                bindingKey: binding.binding_key,
                deviceSlot: binding.device_slot,
                isPrimary: binding.is_primary,
                boundAt: toDate(binding.bound_at) ?? new Date(),
                revokedAt: toDate(binding.revoked_at),
                deviceFingerprint: binding.device_fingerprint,
                desktopLicense: {
                    id: license.id,
                    licenseKey: license.license_key,
                    status: license.status,
                    expiresAt: toDate(license.expires_at),
                },
            }),
        };
    }

    async unbindDevice(bindingId: string, authorization?: string) {
        const session = await this.requireCurrentUser(authorization);
        const binding = await this.supabase.selectOne<DeviceBindingRow>("public", "device_bindings", {
            id: bindingId,
            user_id: session.id,
            deleted_at: null,
        });

        if (!binding) {
            throw new BadRequestException(errorKeys.bindingNotFound);
        }

        await this.supabase.updateRows(
            "public",
            "device_bindings",
            { id: binding.id },
            {
                revoked_at: new Date().toISOString(),
                deleted_at: new Date().toISOString(),
            }
        );

        await this.supabase.insertRow("public", "license_events", {
            id: randomUUID(),
            desktop_license_id: binding.desktop_license_id,
            event_type: "device_unbound",
            payload: {
                bindingId: binding.id,
                deviceId: binding.device_id,
            },
        });

        return {
            success: true as const,
        };
    }

    async listLicenseEvents(authorization?: string) {
        const session = await this.requireCurrentUser(authorization);
        const license = await this.getOrCreateDesktopLicense(session.id);
        const events = await this.supabase.selectRows<LicenseEventRow>(
            "public",
            "license_events",
            {
                desktop_license_id: license.id,
                archived_at: null,
            },
            "*",
            { column: "created_at", ascending: false }
        );

        return {
            events: events.map((event) =>
                mapLicenseEvent({
                    id: event.id,
                    eventType: event.event_type,
                    payload: event.payload,
                    createdAt: toDate(event.created_at) ?? new Date(),
                })
            ),
        };
    }

    async listDeviceBindings(authorization?: string) {
        const session = await this.requireCurrentUser(authorization);
        const devices = await this.supabase.selectRows<DeviceRow>("public", "devices", {
            user_id: session.id,
        });

        const items = [];
        for (const device of devices) {
            const bindings = await this.loadDeviceBindingsForDevice(session.id, device.id);
            for (const binding of bindings) {
                const desktopLicense = await this.supabase.selectOne<DesktopLicenseRow>("public", "desktop_licenses", {
                    id: binding.desktop_license_id,
                });
                if (!desktopLicense) {
                    continue;
                }

                items.push(
                    mapDeviceBinding({
                        id: binding.id,
                        bindingKey: binding.binding_key,
                        deviceSlot: binding.device_slot,
                        isPrimary: binding.is_primary,
                        boundAt: toDate(binding.bound_at) ?? new Date(),
                        revokedAt: toDate(binding.revoked_at),
                        deviceFingerprint: binding.device_fingerprint,
                        desktopLicense: {
                            id: desktopLicense.id,
                            licenseKey: desktopLicense.license_key,
                            status: desktopLicense.status,
                            expiresAt: toDate(desktopLicense.expires_at),
                        },
                    })
                );
            }
        }

        return {
            items,
        };
    }

    async unbindDeviceByDeviceId(deviceId: string, authorization?: string) {
        const session = await this.requireCurrentUser(authorization);
        const device = await this.loadDeviceWithBindings(session.id, deviceId);

        const binding = device?.deviceBindings[0];
        if (!binding) {
            throw new BadRequestException(errorKeys.bindingNotFound);
        }

        await this.supabase.updateRows(
            "public",
            "device_bindings",
            { id: binding.id },
            {
                revoked_at: new Date().toISOString(),
                deleted_at: new Date().toISOString(),
            }
        );

        await this.supabase.insertRow("public", "license_events", {
            id: randomUUID(),
            desktop_license_id: binding.desktopLicense.id,
            event_type: "device_unbound",
            payload: {
                bindingId: binding.id,
                deviceId: binding.device_id,
            },
        });

        return {
            success: true as const,
        };
    }
}
