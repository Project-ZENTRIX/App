import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { PrismaService } from "../../prisma/prisma.service.js";
import { errorKeys } from "../common/errors/error-keys.js";
import { getTokenFromAuthorizationHeader, hashPassword, verifyPassword } from "./auth-crypto.js";
import { getSessionFromAuthorizationHeader } from "./auth-session.js";
import { SignInDto } from "./dto/signin.dto.js";
import { SignUpDto } from "./dto/signup.dto.js";

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

@Injectable()
export class AuthCoreService {
    constructor(private readonly prisma: PrismaService) {}

    private assertAuthPayload(body: SignInDto | SignUpDto) {
        if (!body || typeof body.email !== "string" || typeof body.password !== "string") {
            throw new BadRequestException(errorKeys.invalidRequestPayload);
        }

        if (!body.email.includes("@")) {
            throw new BadRequestException(errorKeys.invalidEmailFormat);
        }

        if (body.password.length < 8) {
            throw new BadRequestException(errorKeys.passwordTooShort);
        }
    }

    async getSessionFromAuthorization(authorization?: string) {
        return getSessionFromAuthorizationHeader(this.prisma, authorization);
    }

    async signIn(body: SignInDto) {
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

        if (!account?.passwordHash || !verifyPassword(body.password, account.passwordHash)) {
            throw new UnauthorizedException(errorKeys.invalidEmailOrPassword);
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

    async signUp(body: SignUpDto) {
        this.assertAuthPayload(body);

        if (body.password !== body.confirmPassword) {
            throw new BadRequestException(errorKeys.passwordMismatch);
        }

        const existingUser = await this.prisma.user.findUnique({
            where: {
                email: body.email,
            },
        });

        if (existingUser) {
            throw new BadRequestException(errorKeys.emailAlreadyExists);
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
                passwordHash: hashPassword(body.password),
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

    async getCurrentAccount(authorization?: string) {
        const session = await this.getSessionFromAuthorization(authorization);
        if (!session) {
            throw new UnauthorizedException(errorKeys.unauthorized);
        }

        return {
            token: session.token,
            user: session.user,
        };
    }

    async updateProfile(body: UpdateProfileDto, authorization?: string) {
        const session = await this.getSessionFromAuthorization(authorization);
        if (!session) {
            throw new UnauthorizedException(errorKeys.unauthorized);
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

    async updatePassword(body: UpdatePasswordDto, authorization?: string) {
        const session = await this.getSessionFromAuthorization(authorization);
        if (!session) {
            throw new UnauthorizedException(errorKeys.unauthorized);
        }

        if (typeof body.currentPassword !== "string" || typeof body.newPassword !== "string") {
            throw new BadRequestException(errorKeys.invalidRequestPayload);
        }

        if (body.newPassword.length < 8) {
            throw new BadRequestException(errorKeys.passwordTooShort);
        }

        const account = await this.prisma.account.findFirst({
            where: {
                userId: session.user.id as string,
                provider: "credentials",
            },
        });

        if (!account?.passwordHash || !verifyPassword(body.currentPassword, account.passwordHash)) {
            throw new UnauthorizedException(errorKeys.invalidCurrentPassword);
        }

        await this.prisma.account.update({
            where: {
                id: account.id,
            },
            data: {
                passwordHash: hashPassword(body.newPassword),
            },
        });

        return {
            success: true as const,
        };
    }

    async listSessions(authorization?: string) {
        const session = await this.getSessionFromAuthorization(authorization);
        if (!session) {
            throw new UnauthorizedException(errorKeys.unauthorized);
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
            sessions: sessions as CurrentSessionPayload[],
        };
    }

    async revokeSession(sessionId: string, authorization?: string) {
        const session = await this.getSessionFromAuthorization(authorization);
        if (!session) {
            throw new UnauthorizedException(errorKeys.unauthorized);
        }

        await this.prisma.session.updateMany({
            where: {
                id: sessionId,
                userId: session.user.id as string,
            },
            data: {
                revokedAt: new Date(),
            },
        });

        return {
            success: true as const,
        };
    }

    async getNotificationPreferences(authorization?: string) {
        const session = await this.getSessionFromAuthorization(authorization);
        if (!session) {
            throw new UnauthorizedException(errorKeys.unauthorized);
        }

        const preference = await this.prisma.notificationPreference.findUnique({
            where: {
                userId: session.user.id as string,
            },
        });

        return preference ?? { email: true, sms: false, inApp: true };
    }

    async updateNotificationPreferences(body: UpdateNotificationPreferencesDto, authorization?: string) {
        const session = await this.getSessionFromAuthorization(authorization);
        if (!session) {
            throw new UnauthorizedException(errorKeys.unauthorized);
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

    async getAuditRecords(authorization?: string) {
        const session = await this.getSessionFromAuthorization(authorization);
        if (!session) {
            throw new UnauthorizedException(errorKeys.unauthorized);
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

    async getProfile(authorization?: string) {
        const session = await this.getSessionFromAuthorization(authorization);
        if (!session) {
            throw new UnauthorizedException(errorKeys.unauthorized);
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

    async oauth() {
        return {
            supported: true as const,
        };
    }
}
