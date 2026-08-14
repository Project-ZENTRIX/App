import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { PrismaService } from "../../prisma/prisma.service.js";
import { errorKeys } from "../common/errors/error-keys.js";
import { getSessionFromAuthorizationHeader } from "./auth-session.js";
import { mapDevice, mapDeviceBinding, mapLicenseEvent, summarizeDesktopLicense } from "./auth-license-mappers.js";

@Injectable()
export class AuthLicenseService {
    constructor(private readonly prisma: PrismaService) {}

    private async getOrCreateDesktopLicense(userId: string) {
        const license = await this.prisma.desktopLicense.findFirst({
            where: {
                userId,
                deletedAt: null,
            },
            orderBy: {
                issuedAt: "desc",
            },
        });

        if (license) {
            return license;
        }

        return this.prisma.desktopLicense.create({
            data: {
                userId,
                licenseKey: randomUUID(),
            },
        });
    }

    private async getLicenseWithDetails(userId: string) {
        const license = await this.getOrCreateDesktopLicense(userId);

        return this.prisma.desktopLicense.findUnique({
            where: {
                id: license.id,
            },
            include: {
                devices: {
                    where: {
                        deletedAt: null,
                    },
                    orderBy: {
                        boundAt: "desc",
                    },
                    include: {
                        device: true,
                        desktopLicense: true,
                    },
                },
                events: {
                    where: {
                        archivedAt: null,
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                },
            },
        });
    }

    async getLicenseOverview(authorization?: string) {
        const session = await getSessionFromAuthorizationHeader(this.prisma, authorization);
        if (!session) {
            throw new UnauthorizedException(errorKeys.unauthorized);
        }

        const license = await this.getLicenseWithDetails(session.user.id as string);
        return {
            license: license ? summarizeDesktopLicense(license) : null,
        };
    }

    async getLicenseHistory(authorization?: string) {
        const session = await getSessionFromAuthorizationHeader(this.prisma, authorization);
        if (!session) {
            throw new UnauthorizedException(errorKeys.unauthorized);
        }

        const licenses = await this.prisma.desktopLicense.findMany({
            where: {
                userId: session.user.id as string,
                deletedAt: null,
            },
            orderBy: {
                issuedAt: "desc",
            },
            include: {
                devices: {
                    where: {
                        deletedAt: null,
                    },
                },
            },
        });

        return {
            licenses: licenses.map((license) => summarizeDesktopLicense(license)),
        };
    }

    async listDevices(authorization?: string) {
        const session = await getSessionFromAuthorizationHeader(this.prisma, authorization);
        if (!session) {
            throw new UnauthorizedException(errorKeys.unauthorized);
        }

        const devices = await this.prisma.device.findMany({
            where: {
                userId: session.user.id as string,
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                deviceBindings: {
                    where: {
                        deletedAt: null,
                    },
                    orderBy: {
                        boundAt: "desc",
                    },
                    include: {
                        desktopLicense: true,
                    },
                },
            },
        });

        return {
            devices: devices.map((device) => mapDevice(device)),
        };
    }

    async getDevice(deviceId: string, authorization?: string) {
        const session = await getSessionFromAuthorizationHeader(this.prisma, authorization);
        if (!session) {
            throw new UnauthorizedException(errorKeys.unauthorized);
        }

        const device = await this.prisma.device.findFirst({
            where: {
                id: deviceId,
                userId: session.user.id as string,
            },
            include: {
                deviceBindings: {
                    where: {
                        deletedAt: null,
                    },
                    orderBy: {
                        boundAt: "desc",
                    },
                    include: {
                        desktopLicense: true,
                    },
                },
            },
        });

        return {
            device: device ? mapDevice(device) : null,
        };
    }

    async generateBindingCode(deviceId: string, authorization?: string) {
        const session = await getSessionFromAuthorizationHeader(this.prisma, authorization);
        if (!session) {
            throw new UnauthorizedException(errorKeys.unauthorized);
        }

        const device = await this.prisma.device.findFirst({
            where: {
                id: deviceId,
                userId: session.user.id as string,
            },
        });

        if (!device) {
            throw new BadRequestException(errorKeys.deviceNotFound);
        }

        const license = await this.getOrCreateDesktopLicense(session.user.id as string);
        const bindingCode = randomUUID();

        await this.prisma.licenseEvent.create({
            data: {
                desktopLicenseId: license.id,
                eventType: "binding_code_generated",
                payload: {
                    deviceId: device.id,
                    bindingCode,
                    expiresAt: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
                },
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
        const session = await getSessionFromAuthorizationHeader(this.prisma, authorization);
        if (!session) {
            throw new UnauthorizedException(errorKeys.unauthorized);
        }

        if (!body || typeof body.deviceId !== "string" || typeof body.bindingCode !== "string") {
            throw new BadRequestException(errorKeys.invalidRequestPayload);
        }

        const license = await this.getOrCreateDesktopLicense(session.user.id as string);
        const codeEvent = await this.prisma.licenseEvent.findFirst({
            where: {
                desktopLicenseId: license.id,
                eventType: "binding_code_generated",
                archivedAt: null,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        const codePayload =
            (codeEvent?.payload as { deviceId?: string; bindingCode?: string; expiresAt?: string } | null) ?? null;
        if (!codeEvent || codePayload?.bindingCode !== body.bindingCode || codePayload?.deviceId !== body.deviceId) {
            throw new BadRequestException(errorKeys.invalidBindingCode);
        }

        if (codePayload.expiresAt && Date.now() > Date.parse(codePayload.expiresAt)) {
            throw new BadRequestException(errorKeys.bindingCodeExpired);
        }

        const device = await this.prisma.device.findFirst({
            where: {
                id: body.deviceId,
                userId: session.user.id as string,
            },
        });

        if (!device) {
            throw new BadRequestException(errorKeys.deviceNotFound);
        }

        const existingBindingCount = await this.prisma.deviceBinding.count({
            where: {
                desktopLicenseId: license.id,
                deletedAt: null,
                revokedAt: null,
            },
        });

        if (existingBindingCount >= license.maxDevices) {
            throw new BadRequestException(errorKeys.deviceLimitReached);
        }

        const binding = await this.prisma.deviceBinding.create({
            data: {
                userId: session.user.id as string,
                desktopLicenseId: license.id,
                deviceId: device.id,
                bindingKey: randomUUID(),
                deviceFingerprint: body.deviceFingerprint ?? null,
                deviceSlot: body.deviceSlot ?? existingBindingCount + 1,
                isPrimary: body.isPrimary ?? existingBindingCount === 0,
            },
            include: {
                desktopLicense: true,
            },
        });

        await this.prisma.licenseEvent.update({
            where: {
                id: codeEvent.id,
            },
            data: {
                archivedAt: new Date(),
            },
        });

        await this.prisma.licenseEvent.create({
            data: {
                desktopLicenseId: license.id,
                eventType: "device_bound",
                payload: {
                    bindingId: binding.id,
                    deviceId: device.id,
                    isPrimary: binding.isPrimary,
                },
            },
        });

        return {
            binding: mapDeviceBinding(binding),
        };
    }

    async unbindDevice(bindingId: string, authorization?: string) {
        const session = await getSessionFromAuthorizationHeader(this.prisma, authorization);
        if (!session) {
            throw new UnauthorizedException(errorKeys.unauthorized);
        }

        const binding = await this.prisma.deviceBinding.findFirst({
            where: {
                id: bindingId,
                userId: session.user.id as string,
                deletedAt: null,
            },
        });

        if (!binding) {
            throw new BadRequestException(errorKeys.bindingNotFound);
        }

        await this.prisma.deviceBinding.update({
            where: {
                id: binding.id,
            },
            data: {
                revokedAt: new Date(),
                deletedAt: new Date(),
            },
        });

        await this.prisma.licenseEvent.create({
            data: {
                desktopLicenseId: binding.desktopLicenseId,
                eventType: "device_unbound",
                payload: {
                    bindingId: binding.id,
                    deviceId: binding.deviceId,
                },
            },
        });

        return {
            success: true as const,
        };
    }

    async listLicenseEvents(authorization?: string) {
        const session = await getSessionFromAuthorizationHeader(this.prisma, authorization);
        if (!session) {
            throw new UnauthorizedException(errorKeys.unauthorized);
        }

        const license = await this.getOrCreateDesktopLicense(session.user.id as string);
        const events = await this.prisma.licenseEvent.findMany({
            where: {
                desktopLicenseId: license.id,
                archivedAt: null,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return {
            events: events.map((event) => mapLicenseEvent(event)),
        };
    }

    async listDeviceBindings(authorization?: string) {
        const session = await getSessionFromAuthorizationHeader(this.prisma, authorization);
        if (!session) {
            throw new UnauthorizedException(errorKeys.unauthorized);
        }

        const devices = await this.prisma.device.findMany({
            where: {
                userId: session.user.id as string,
            },
            include: {
                deviceBindings: {
                    where: {
                        deletedAt: null,
                    },
                    orderBy: {
                        boundAt: "desc",
                    },
                    include: {
                        desktopLicense: true,
                    },
                },
            },
        });

        return {
            items: devices.flatMap((device) => device.deviceBindings.map((binding) => mapDeviceBinding(binding))),
        };
    }

    async unbindDeviceByDeviceId(deviceId: string, authorization?: string) {
        const session = await getSessionFromAuthorizationHeader(this.prisma, authorization);
        if (!session) {
            throw new UnauthorizedException(errorKeys.unauthorized);
        }

        const device = await this.prisma.device.findFirst({
            where: {
                id: deviceId,
                userId: session.user.id as string,
            },
            include: {
                deviceBindings: {
                    where: {
                        deletedAt: null,
                    },
                    orderBy: {
                        boundAt: "desc",
                    },
                },
            },
        });

        const binding = device?.deviceBindings[0];
        if (!binding) {
            throw new BadRequestException(errorKeys.bindingNotFound);
        }

        await this.prisma.deviceBinding.update({
            where: {
                id: binding.id,
            },
            data: {
                revokedAt: new Date(),
                deletedAt: new Date(),
            },
        });

        await this.prisma.licenseEvent.create({
            data: {
                desktopLicenseId: binding.desktopLicenseId,
                eventType: "device_unbound",
                payload: {
                    bindingId: binding.id,
                    deviceId: binding.deviceId,
                },
            },
        });

        return {
            success: true as const,
        };
    }
}
