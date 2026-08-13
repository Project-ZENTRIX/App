import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Headers,
    Inject,
    Param,
    Patch,
    Post,
    UnauthorizedException,
} from "@nestjs/common";
import { pbkdf2Sync, randomUUID, timingSafeEqual } from "node:crypto";

import { PrismaService } from "../../prisma/prisma.service.js";
import { SignInDto } from "./dto/signin.dto.js";
import { SignUpDto } from "./dto/signup.dto.js";

type AuthSessionPayload = {
    token: string;
    user: unknown;
};

type CurrentAccountPayload = {
    token: string;
    user: unknown;
};

type CurrentSessionPayload = {
    id: string;
    token: string;
    expiresAt: Date;
    createdAt: Date;
    revokedAt: Date | null;
    ipAddress: string | null;
    userAgent: string | null;
};

type NotificationPreferencesPayload = {
    email: boolean;
    sms: boolean;
    inApp: boolean;
};

type UpdateProfileDto = {
    name?: string;
    image?: string | null;
    bio?: string | null;
};

type UpdatePasswordDto = {
    currentPassword: string;
    newPassword: string;
};

type UpdateNotificationPreferencesDto = {
    email?: boolean;
    sms?: boolean;
    inApp?: boolean;
};

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

@Controller("auth")
export class AuthController {
    constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

    private hashPassword(password: string, salt = randomUUID()) {
        const hash = pbkdf2Sync(password, salt, 120000, 64, "sha512").toString("hex");
        return `${salt}:${hash}`;
    }

    private verifyPassword(password: string, stored: string) {
        const [salt, hash] = stored.split(":");
        if (!salt || !hash) {
            return false;
        }

        const candidate = pbkdf2Sync(password, salt, 120000, 64, "sha512").toString("hex");
        return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(candidate, "hex"));
    }

    private async getAuthSessionToken(authorization?: string) {
        const token = this.getTokenFromHeader(authorization);
        if (!token) {
            return null;
        }

        const session = await this.prisma.session.findUnique({
            where: {
                token,
            },
            include: {
                user: true,
            },
        });

        if (session) {
            return session;
        }
        return null;
    }

    private getTokenFromHeader(authorization?: string) {
        if (!authorization) {
            return null;
        }

        const [scheme, token] = authorization.split(" ");
        if (scheme !== "Bearer" || !token) {
            return null;
        }

        return token;
    }

    private assertAuthPayload(body: SignInDto | SignUpDto) {
        if (!body || typeof body.email !== "string" || typeof body.password !== "string") {
            throw new BadRequestException("Invalid request payload");
        }

        if (!body.email.includes("@")) {
            throw new BadRequestException("Invalid email format");
        }

        if (body.password.length < 8) {
            throw new BadRequestException("Password must be at least 8 characters long");
        }
    }

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

    private summarizeLicense(license: {
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

    @Post("signin")
    async signIn(@Body() body: SignInDto): Promise<AuthSessionPayload> {
        this.assertAuthPayload(body);

        const account = await this.prisma.account.findFirst({
            where: {
                passwordHash: {
                    not: null,
                },
                user: {
                    email: body.email,
                },
            },
            include: {
                user: true,
            },
        });

        if (!account?.passwordHash || !this.verifyPassword(body.password, account.passwordHash)) {
            throw new UnauthorizedException("Invalid email or password");
        }

        const token = randomUUID();

        await this.prisma.session.create({
            data: {
                token,
                userId: account.userId,
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
            },
        });

        return {
            token,
            user: account.user,
        };
    }

    @Post("signup")
    async signUp(@Body() body: SignUpDto): Promise<AuthSessionPayload> {
        this.assertAuthPayload(body);

        if (body.password !== body.confirmPassword) {
            throw new BadRequestException('"Password" and "Confirm Password" do not match');
        }

        const existingUser = await this.prisma.user.findUnique({
            where: {
                email: body.email,
            },
        });

        if (existingUser) {
            throw new BadRequestException("Email already exists");
        }

        const user = await this.prisma.user.create({
            data: {
                email: body.email,
                name: body.email,
                emailVerified: true,
            },
        });

        await this.prisma.account.create({
            data: {
                userId: user.id,
                provider: "credentials",
                identifier: body.email,
                passwordHash: this.hashPassword(body.password),
            },
        });

        const token = randomUUID();

        await this.prisma.session.create({
            data: {
                token,
                userId: user.id,
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
            },
        });

        return {
            token,
            user,
        };
    }

    @Get("me")
    async me(@Headers("authorization") authorization?: string): Promise<CurrentAccountPayload> {
        const session = await this.getAuthSessionToken(authorization);

        if (!session) {
            throw new UnauthorizedException("Unauthorized");
        }

        return {
            token: session.token,
            user: session.user,
        };
    }

    @Patch("me/profile")
    async updateProfile(
        @Body() body: UpdateProfileDto,
        @Headers("authorization") authorization?: string
    ): Promise<{ user: unknown }> {
        const session = await this.getAuthSessionToken(authorization);

        if (!session) {
            throw new UnauthorizedException("Unauthorized");
        }

        const user = await this.prisma.user.update({
            where: {
                id: session.user.id as string,
            },
            data: {
                ...(typeof body.name === "string" ? { name: body.name } : {}),
                ...(body.image !== undefined ? { image: body.image } : {}),
            },
        });

        if (body.bio !== undefined || body.image !== undefined) {
            await this.prisma.userProfile.upsert({
                where: {
                    userId: session.user.id as string,
                },
                create: {
                    userId: session.user.id as string,
                    bio: body.bio ?? null,
                    avatarUrl: body.image ?? null,
                },
                update: {
                    ...(body.bio !== undefined ? { bio: body.bio } : {}),
                    ...(body.image !== undefined ? { avatarUrl: body.image } : {}),
                },
            });
        }

        return {
            user: await this.prisma.user.findUnique({
                where: {
                    id: user.id,
                },
                include: {
                    userProfile: true,
                },
            }),
        };
    }

    @Patch("me/password")
    async updatePassword(
        @Body() body: UpdatePasswordDto,
        @Headers("authorization") authorization?: string
    ): Promise<{ success: true }> {
        const session = await this.getAuthSessionToken(authorization);

        if (!session) {
            throw new UnauthorizedException("Unauthorized");
        }

        if (typeof body.currentPassword !== "string" || typeof body.newPassword !== "string") {
            throw new BadRequestException("Invalid request payload");
        }

        if (body.newPassword.length < 8) {
            throw new BadRequestException("Password must be at least 8 characters long");
        }

        const account = await this.prisma.account.findFirst({
            where: {
                userId: session.user.id as string,
                provider: "credentials",
            },
        });

        if (!account?.passwordHash || !this.verifyPassword(body.currentPassword, account.passwordHash)) {
            throw new UnauthorizedException("Invalid current password");
        }

        await this.prisma.account.update({
            where: {
                id: account.id,
            },
            data: {
                passwordHash: this.hashPassword(body.newPassword),
            },
        });

        return {
            success: true,
        };
    }

    @Get("me/sessions")
    async listSessions(@Headers("authorization") authorization?: string): Promise<{ sessions: CurrentSessionPayload[] }> {
        const session = await this.getAuthSessionToken(authorization);

        if (!session) {
            throw new UnauthorizedException("Unauthorized");
        }

        const sessions = await this.prisma.session.findMany({
            where: {
                userId: session.user.id as string,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return {
            sessions,
        };
    }

    @Delete("me/sessions/:id")
    async revokeSession(@Param("id") id: string, @Headers("authorization") authorization?: string): Promise<{ success: true }> {
        const session = await this.getAuthSessionToken(authorization);

        if (!session) {
            throw new UnauthorizedException("Unauthorized");
        }

        await this.prisma.session.updateMany({
            where: {
                id,
                userId: session.user.id as string,
            },
            data: {
                revokedAt: new Date(),
            },
        });

        return {
            success: true,
        };
    }

    @Get("me/notification-preferences")
    async getNotificationPreferences(
        @Headers("authorization") authorization?: string
    ): Promise<NotificationPreferencesPayload> {
        const session = await this.getAuthSessionToken(authorization);

        if (!session) {
            throw new UnauthorizedException("Unauthorized");
        }

        const preference = await this.prisma.notificationPreference.findUnique({
            where: {
                userId: session.user.id as string,
            },
        });

        return preference ?? { email: true, sms: false, inApp: true };
    }

    @Patch("me/notification-preferences")
    async updateNotificationPreferences(
        @Body() body: UpdateNotificationPreferencesDto,
        @Headers("authorization") authorization?: string
    ): Promise<NotificationPreferencesPayload> {
        const session = await this.getAuthSessionToken(authorization);

        if (!session) {
            throw new UnauthorizedException("Unauthorized");
        }

        const preference = {
            email: body.email ?? true,
            sms: body.sms ?? false,
            inApp: body.inApp ?? true,
        };

        await this.prisma.notificationPreference.upsert({
            where: {
                userId: session.user.id as string,
            },
            create: {
                userId: session.user.id as string,
                ...preference,
            },
            update: preference,
        });

        return preference;
    }

    @Get("me/audit-records")
    async getAuditRecords(@Headers("authorization") authorization?: string): Promise<{ records: unknown[] }> {
        const session = await this.getAuthSessionToken(authorization);

        if (!session) {
            throw new UnauthorizedException("Unauthorized");
        }

        const records = await this.prisma.auditLog.findMany({
            where: {
                userId: session.user.id as string,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return {
            records,
        };
    }

    @Get("me/profile")
    async getProfile(@Headers("authorization") authorization?: string): Promise<{ user: unknown }> {
        const session = await this.getAuthSessionToken(authorization);

        if (!session) {
            throw new UnauthorizedException("Unauthorized");
        }

        const user = await this.prisma.user.findUnique({
            where: {
                id: session.user.id as string,
            },
            include: {
                userProfile: true,
            },
        });

        return {
            user,
        };
    }

    @Get("me/security")
    async getSecurity(@Headers("authorization") authorization?: string): Promise<{ sessions: CurrentSessionPayload[] }> {
        return this.listSessions(authorization);
    }

    @Get("me/license")
    async getLicenseOverview(
        @Headers("authorization") authorization?: string
    ): Promise<{ license: DesktopLicensePayload | null }> {
        const session = await this.getAuthSessionToken(authorization);

        if (!session) {
            throw new UnauthorizedException("Unauthorized");
        }

        const license = await this.getLicenseWithDetails(session.user.id as string);
        return {
            license: license ? this.summarizeLicense(license) : null,
        };
    }

    @Get("me/license/history")
    async getLicenseHistory(@Headers("authorization") authorization?: string): Promise<{ licenses: DesktopLicensePayload[] }> {
        const session = await this.getAuthSessionToken(authorization);

        if (!session) {
            throw new UnauthorizedException("Unauthorized");
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
            licenses: licenses.map((license) => this.summarizeLicense(license)),
        };
    }

    @Get("me/license/devices")
    async listDevices(@Headers("authorization") authorization?: string): Promise<{ devices: DevicePayload[] }> {
        const session = await this.getAuthSessionToken(authorization);

        if (!session) {
            throw new UnauthorizedException("Unauthorized");
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
            devices: devices.map((device) => ({
                id: device.id,
                deviceKey: device.deviceKey,
                name: device.name,
                platform: device.platform,
                createdAt: device.createdAt,
                updatedAt: device.updatedAt,
                bindingCount: device.deviceBindings.filter((binding) => binding.revokedAt === null).length,
                bindings: device.deviceBindings.map((binding) => ({
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
                })),
            })),
        };
    }

    @Get("me/license/devices/:deviceId")
    async getDevice(
        @Param("deviceId") deviceId: string,
        @Headers("authorization") authorization?: string
    ): Promise<{ device: DevicePayload | null }> {
        const session = await this.getAuthSessionToken(authorization);

        if (!session) {
            throw new UnauthorizedException("Unauthorized");
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

        if (!device) {
            return { device: null };
        }

        return {
            device: {
                id: device.id,
                deviceKey: device.deviceKey,
                name: device.name,
                platform: device.platform,
                createdAt: device.createdAt,
                updatedAt: device.updatedAt,
                bindingCount: device.deviceBindings.filter((binding) => binding.revokedAt === null).length,
                bindings: device.deviceBindings.map((binding) => ({
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
                })),
            },
        };
    }

    @Post("me/license/devices/:deviceId/binding-code")
    async generateBindingCode(
        @Param("deviceId") deviceId: string,
        @Headers("authorization") authorization?: string
    ): Promise<{ bindingCode: string; deviceId: string }> {
        const session = await this.getAuthSessionToken(authorization);

        if (!session) {
            throw new UnauthorizedException("Unauthorized");
        }

        const device = await this.prisma.device.findFirst({
            where: {
                id: deviceId,
                userId: session.user.id as string,
            },
        });

        if (!device) {
            throw new BadRequestException("Device not found");
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

    @Post("me/license/bindings")
    async bindDevice(
        @Body()
        body: {
            deviceId: string;
            bindingCode: string;
            deviceFingerprint?: string | null;
            deviceSlot?: number;
            isPrimary?: boolean;
        },
        @Headers("authorization") authorization?: string
    ): Promise<{ binding: DeviceBindingPayload }> {
        const session = await this.getAuthSessionToken(authorization);

        if (!session) {
            throw new UnauthorizedException("Unauthorized");
        }

        if (!body || typeof body.deviceId !== "string" || typeof body.bindingCode !== "string") {
            throw new BadRequestException("Invalid request payload");
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
            throw new BadRequestException("Invalid binding code");
        }

        if (codePayload.expiresAt && Date.now() > Date.parse(codePayload.expiresAt)) {
            throw new BadRequestException("Binding code expired");
        }

        const device = await this.prisma.device.findFirst({
            where: {
                id: body.deviceId,
                userId: session.user.id as string,
            },
        });

        if (!device) {
            throw new BadRequestException("Device not found");
        }

        const existingBindingCount = await this.prisma.deviceBinding.count({
            where: {
                desktopLicenseId: license.id,
                deletedAt: null,
                revokedAt: null,
            },
        });

        if (existingBindingCount >= license.maxDevices) {
            throw new BadRequestException("Device limit reached");
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
            binding: {
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
            },
        };
    }

    @Delete("me/license/bindings/:bindingId")
    async unbindDevice(
        @Param("bindingId") bindingId: string,
        @Headers("authorization") authorization?: string
    ): Promise<{ success: true }> {
        const session = await this.getAuthSessionToken(authorization);

        if (!session) {
            throw new UnauthorizedException("Unauthorized");
        }

        const binding = await this.prisma.deviceBinding.findFirst({
            where: {
                id: bindingId,
                userId: session.user.id as string,
                deletedAt: null,
            },
        });

        if (!binding) {
            throw new BadRequestException("Binding not found");
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
            success: true,
        };
    }

    @Get("me/license/events")
    async listLicenseEvents(@Headers("authorization") authorization?: string): Promise<{ events: LicenseEventPayload[] }> {
        const session = await this.getAuthSessionToken(authorization);

        if (!session) {
            throw new UnauthorizedException("Unauthorized");
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
            events: events.map((event) => ({
                id: event.id,
                eventType: event.eventType,
                payload: event.payload,
                createdAt: event.createdAt,
            })),
        };
    }

    @Post("oauth")
    async oauth(): Promise<{ supported: true }> {
        return {
            supported: true,
        };
    }
}
