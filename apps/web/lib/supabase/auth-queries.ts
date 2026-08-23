import {
    getCurrentUser,
    selectOne,
    signInWithPassword,
    signUpWithPassword,
    updateCurrentUser,
    upsertRow,
} from "./browser-client";
import { getAuthToken as readAuthToken, setAuthToken as writeAuthToken } from "@/lib/auth/auth-token";

export type SignInInput = {
    email: string;
    password: string;
};

export type SignUpInput = {
    email: string;
    password: string;
    confirmPassword: string;
};

export type AuthSession = {
    token: string | null;
    user: unknown;
};

export type CurrentAccount = {
    user: UserProfile;
    token: string | null;
};

export type UserProfile = {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
    notificationPreferences?: NotificationPreferences | null;
    userProfile?: {
        bio: string | null;
        avatarUrl: string | null;
    } | null;
};

export type UpdateProfileInput = {
    name?: string;
    image?: string | null;
    bio?: string | null;
};

export type UpdatePasswordInput = {
    currentPassword: string;
    newPassword: string;
};

export type NotificationPreferences = {
    email: boolean;
    sms: boolean;
    inApp: boolean;
};

export type UpdateNotificationPreferencesInput = Partial<NotificationPreferences>;

export type AuditRecord = {
    id: string;
    action: string;
    createdAt: string;
    metadata?: Record<string, unknown> | null;
};

export function getAuthToken() {
    return readAuthToken();
}

export function setAuthToken(token: string | null) {
    writeAuthToken(token);
}

function mapMetadataProfile(authUser: Awaited<ReturnType<typeof getCurrentUser>>): UserProfile {
    const metadata = authUser.user_metadata ?? authUser.raw_user_meta_data ?? {};
    const fallbackName = typeof metadata.name === "string" ? metadata.name : authUser.email;
    const fallbackImage =
        typeof metadata.avatar_url === "string"
            ? metadata.avatar_url
            : typeof metadata.picture === "string"
              ? metadata.picture
              : null;
    const bio = typeof metadata.bio === "string" ? metadata.bio : null;
    const notificationPreferencesValue =
        metadata.notification_preferences && typeof metadata.notification_preferences === "object"
            ? (metadata.notification_preferences as Partial<NotificationPreferences>)
            : null;

    return {
        id: authUser.id,
        email: authUser.email,
        name: fallbackName,
        image: fallbackImage,
        emailVerified: Boolean(authUser.email_confirmed_at),
        createdAt: authUser.created_at,
        updatedAt: authUser.updated_at,
        notificationPreferences: notificationPreferencesValue
            ? {
                  email: Boolean(notificationPreferencesValue.email),
                  sms: Boolean(notificationPreferencesValue.sms),
                  inApp: Boolean(notificationPreferencesValue.inApp),
              }
            : null,
        userProfile: {
            bio,
            avatarUrl: fallbackImage,
        },
    };
}

async function getAccountSnapshot(token?: string | null) {
    const authToken = token ?? getAuthToken();
    if (!authToken) {
        throw new Error("Unauthorized");
    }

    const authUser = await getCurrentUser(authToken);
    return {
        token: authToken,
        user: mapMetadataProfile(authUser),
    };
}

export async function signIn(input: SignInInput) {
    const session = await signInWithPassword(input.email, input.password);
    setAuthToken(session.access_token);
    const account = await getAccountSnapshot(session.access_token);

    return {
        token: session.access_token,
        user: account.user,
    } satisfies AuthSession;
}

export async function signUp(input: SignUpInput) {
    if (input.password !== input.confirmPassword) {
        throw new Error("Passwords do not match");
    }

    const result = await signUpWithPassword(input.email, input.password, {
        name: input.email.split("@")[0],
    });
    return {
        token: result.session?.access_token ?? null,
        user: result.user,
    } satisfies AuthSession;
}

export async function getCurrentAccount() {
    return getAccountSnapshot();
}

export async function updateProfile(input: UpdateProfileInput) {
    const current = await getAccountSnapshot();
    const nextName = input.name?.trim() || current.user.name || current.user.email;
    const nextImage = input.image === undefined ? current.user.image : input.image;
    const nextBio = input.bio === undefined ? (current.user.userProfile?.bio ?? null) : input.bio;

    await updateCurrentUser(current.token ?? "", {
        data: {
            name: nextName,
            avatar_url: nextImage,
            bio: nextBio,
        },
    });

    return {
        user: (await getAccountSnapshot(current.token)).user,
    };
}

export async function updatePassword(input: UpdatePasswordInput) {
    const currentAccount = await getCurrentAccount();
    const session = await signInWithPassword(currentAccount.user.email, input.currentPassword);
    setAuthToken(session.access_token);

    await updateCurrentUser(session.access_token, {
        password: input.newPassword,
    });

    return {
        success: true as const,
    };
}

export async function getNotificationPreferences() {
    const account = await getAccountSnapshot();
    const preference = await selectOne<{
        email: boolean;
        sms: boolean;
        in_app: boolean;
    }>(
        "public",
        "notification_preferences",
        {
            user_id: account.user.id,
        },
        "email,sms,in_app",
        undefined,
        account.token
    );

    if (preference) {
        return {
            email: preference.email,
            sms: preference.sms,
            inApp: preference.in_app,
        };
    }

    return {
        email: account.user.notificationPreferences?.email ?? true,
        sms: account.user.notificationPreferences?.sms ?? false,
        inApp: account.user.notificationPreferences?.inApp ?? true,
    };
}

export async function updateNotificationPreferences(input: UpdateNotificationPreferencesInput) {
    const account = await getAccountSnapshot();
    const current = await getNotificationPreferences();
    const nextPreferences = {
        email: input.email ?? current.email,
        sms: input.sms ?? current.sms,
        inApp: input.inApp ?? current.inApp,
    };

    await upsertRow(
        "public",
        "notification_preferences",
        {
            user_id: account.user.id,
            email: nextPreferences.email,
            sms: nextPreferences.sms,
            in_app: nextPreferences.inApp,
        },
        "user_id",
        account.token
    );

    await updateCurrentUser(account.token ?? "", {
        data: {
            notification_preferences: nextPreferences,
        },
    });

    return nextPreferences;
}

export async function getAuditRecords() {
    return {
        records: [],
    };
}
