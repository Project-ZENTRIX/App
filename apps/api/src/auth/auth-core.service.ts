import { BadRequestException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { errorKeys } from "../common/errors/error-keys.js";
import { SUPABASE_CLIENT } from "../common/supabase/supabase.module.js";
import {
    SupabaseClient,
    SupabaseClientError,
    type CurrentSupabaseUser,
    type SupabaseAuthUser,
} from "../common/supabase/supabase.client.js";
import { getTokenFromAuthorizationHeader } from "./auth-crypto.js";
import { SignInDto } from "./dto/signin.dto.js";
import { SignUpDto } from "./dto/signup.dto.js";

type NotificationPreferencesPayload = {
    email: boolean;
    sms: boolean;
    inApp: boolean;
};

type NotificationPreferencesRow = {
    email: boolean;
    sms: boolean;
    in_app: boolean;
    user_id: string;
    created_at: string;
    updated_at: string;
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

type SupabaseProfileRow = {
    id: string;
    display_name: string;
    avatar_url: string | null;
    bio: string | null;
    status: string;
    created_at: string;
    updated_at: string;
};

type CurrentSessionPayload = {
    id: string;
    token: string | null;
    expiresAt: Date | null;
    createdAt: Date;
    revokedAt: Date | null;
    ipAddress: string | null;
    userAgent: string | null;
};

type UserSessionRow = {
    id: string;
    user_id: string;
    created_at: string;
    updated_at: string;
    expires_at: string | null;
    revoked_at: string | null;
    ip_address: string | null;
    user_agent: string | null;
};

type AppUserRecord = {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    status: "active";
    createdAt: Date;
    updatedAt: Date;
    userProfile: {
        id: string;
        userId: string;
        avatarUrl: string | null;
        bio: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null;
};

function mapProfile(profile: SupabaseProfileRow | null, userId: string) {
    if (!profile) {
        return null;
    }

    return {
        id: profile.id,
        userId,
        avatarUrl: profile.avatar_url,
        bio: profile.bio,
        createdAt: new Date(profile.created_at),
        updatedAt: new Date(profile.updated_at),
    };
}

function mapUser(user: SupabaseAuthUser | CurrentSupabaseUser, profile: SupabaseProfileRow | null): AppUserRecord {
    const displayName =
        profile?.display_name ?? String(user.user_metadata?.name ?? user.raw_user_meta_data?.name ?? user.email);
    const image = profile?.avatar_url ?? (user.user_metadata?.image as string | null | undefined) ?? null;

    return {
        id: user.id,
        name: displayName,
        email: user.email,
        emailVerified: Boolean(user.email_confirmed_at),
        image,
        status: "active",
        createdAt: new Date(user.created_at),
        updatedAt: new Date(user.updated_at),
        userProfile: mapProfile(profile, user.id),
    };
}

@Injectable()
export class AuthCoreService {
    constructor(@Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient) {}

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

    private async loadUserProfile(userId: string) {
        return this.supabase.selectOne<SupabaseProfileRow>("public", "profiles", { id: userId });
    }

    private async loadCurrentUser(authorization?: string) {
        const user = await this.supabase.getCurrentUser(authorization);
        if (!user) {
            throw new UnauthorizedException(errorKeys.unauthorized);
        }

        return user;
    }

    private async recordSession(userId: string, accessToken: string) {
        await this.supabase.insertRow("public", "user_sessions", {
            id: `session-${randomUUID()}`,
            user_id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            expires_at: null,
            revoked_at: null,
            ip_address: null,
            user_agent: null,
        });
    }

    async getSessionFromAuthorization(authorization?: string) {
        const token = getTokenFromAuthorizationHeader(authorization);
        if (!token) {
            return null;
        }

        const user = await this.supabase.getCurrentUser(authorization);
        if (!user) {
            return null;
        }

        return {
            token,
            user: mapUser(user, await this.loadUserProfile(user.id)),
        };
    }

    async signIn(body: SignInDto) {
        this.assertAuthPayload(body);

        try {
            const session = await this.supabase.signInWithPassword(body.email, body.password);
            await this.recordSession(session.user.id, session.access_token);
            return {
                token: session.access_token,
                user: mapUser(session.user, await this.loadUserProfile(session.user.id)),
            };
        } catch (error) {
            if (error instanceof SupabaseClientError) {
                throw new UnauthorizedException(errorKeys.invalidEmailOrPassword);
            }

            throw error;
        }
    }

    async signUp(body: SignUpDto) {
        this.assertAuthPayload(body);

        if (body.password !== body.confirmPassword) {
            throw new BadRequestException(errorKeys.passwordMismatch);
        }

        try {
            const result = await this.supabase.signUpWithPassword(body.email, body.password, {
                name: body.email,
            });

            if (!result.session) {
                throw new BadRequestException(errorKeys.internalServerError);
            }

            await this.recordSession(result.user.id, result.session.access_token);

            return {
                token: result.session.access_token,
                user: mapUser(result.user, await this.loadUserProfile(result.user.id)),
            };
        } catch (error) {
            if (error instanceof SupabaseClientError) {
                if (error.status === 400 || error.status === 422) {
                    throw new BadRequestException(errorKeys.emailAlreadyExists);
                }

                throw new BadRequestException(errorKeys.internalServerError);
            }

            throw error;
        }
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
        const token = getTokenFromAuthorizationHeader(authorization);
        if (!token) {
            throw new UnauthorizedException(errorKeys.unauthorized);
        }

        const currentUser = await this.loadCurrentUser(authorization);
        const updatedMetadata = {
            name: typeof body.name === "string" ? body.name : (currentUser.user_metadata?.name ?? currentUser.email),
            image: body.image !== undefined ? body.image : (currentUser.user_metadata?.image ?? null),
        };

        await this.supabase.updateCurrentUser(authorization!, {
            data: updatedMetadata,
        });

        await this.supabase.upsertRow<SupabaseProfileRow>(
            "public",
            "profiles",
            {
                id: currentUser.id,
                display_name:
                    typeof body.name === "string" ? body.name : String(currentUser.user_metadata?.name ?? currentUser.email),
                avatar_url: body.image !== undefined ? body.image : (currentUser.user_metadata?.image ?? null),
                bio: body.bio ?? null,
            },
            "id"
        );

        return this.getCurrentAccount(authorization);
    }

    async updatePassword(body: UpdatePasswordDto, authorization?: string) {
        const token = getTokenFromAuthorizationHeader(authorization);
        if (!token) {
            throw new UnauthorizedException(errorKeys.unauthorized);
        }

        if (typeof body.currentPassword !== "string" || typeof body.newPassword !== "string") {
            throw new BadRequestException(errorKeys.invalidRequestPayload);
        }

        if (body.newPassword.length < 8) {
            throw new BadRequestException(errorKeys.passwordTooShort);
        }

        const currentUser = await this.loadCurrentUser(authorization);

        try {
            await this.supabase.signInWithPassword(currentUser.email, body.currentPassword);
        } catch (error) {
            if (error instanceof SupabaseClientError) {
                throw new UnauthorizedException(errorKeys.invalidCurrentPassword);
            }

            throw error;
        }

        await this.supabase.updateCurrentUser(authorization!, {
            password: body.newPassword,
        });

        return {
            success: true as const,
        };
    }

    async listSessions(authorization?: string) {
        const currentUser = await this.loadCurrentUser(authorization);
        const sessions = await this.supabase.listSessions(currentUser.id);

        return {
            sessions: sessions.map((session) => ({
                id: String(session.id),
                token: null,
                expiresAt: session.expires_at
                    ? new Date(String(session.expires_at))
                    : session.not_after
                      ? new Date(String(session.not_after))
                      : null,
                createdAt: new Date(String(session.created_at)),
                revokedAt: session.revoked_at ? new Date(String(session.revoked_at)) : null,
                ipAddress: session.ip_address ? String(session.ip_address) : session.ip ? String(session.ip) : null,
                userAgent: session.user_agent ? String(session.user_agent) : null,
            })) as CurrentSessionPayload[],
        };
    }

    async revokeSession(sessionId: string, authorization?: string) {
        const currentUser = await this.loadCurrentUser(authorization);
        await this.supabase.revokeSession(currentUser.id, sessionId);

        return {
            success: true as const,
        };
    }

    async getNotificationPreferences(authorization?: string) {
        const currentUser = await this.loadCurrentUser(authorization);
        const preference = await this.supabase.selectOne<NotificationPreferencesRow>("public", "notification_preferences", {
            user_id: currentUser.id,
        });

        if (!preference) {
            return { email: true, sms: false, inApp: true };
        }

        return {
            email: preference.email,
            sms: preference.sms,
            inApp: preference.in_app,
        };
    }

    async updateNotificationPreferences(body: UpdateNotificationPreferencesDto, authorization?: string) {
        const currentUser = await this.loadCurrentUser(authorization);
        const preference = {
            user_id: currentUser.id,
            email: body.email ?? true,
            sms: body.sms ?? false,
            in_app: body.inApp ?? true,
        };

        await this.supabase.upsertRow("public", "notification_preferences", preference, "user_id");

        return {
            email: preference.email,
            sms: preference.sms,
            inApp: preference.in_app,
        };
    }

    async getAuditRecords(authorization?: string) {
        const currentUser = await this.loadCurrentUser(authorization);
        const records = await this.supabase.selectRows("public", "audit_logs", { user_id: currentUser.id }, "*", {
            column: "created_at",
            ascending: false,
        });

        return {
            records,
        };
    }

    async getProfile(authorization?: string) {
        const currentUser = await this.loadCurrentUser(authorization);
        return {
            user: mapUser(currentUser, await this.loadUserProfile(currentUser.id)),
        };
    }

    async oauth() {
        return {
            supported: true as const,
        };
    }
}
