function createMockPrisma() {
    const state = {
        users: [],
        accounts: [],
        sessions: [],
        profiles: [],
        notificationPreferences: [],
        auditLogs: [],
        desktopLicenses: [],
        devices: [],
        deviceBindings: [],
        licenseEvents: [],
        products: [],
        orders: [],
        orderItems: [],
        payments: [],
        paymentEvents: [],
        subscriptions: [],
        courses: [],
        lessons: [],
        tasks: [],
        enrollments: [],
        lessonProgresses: [],
        progressEvents: [],
        runs: [],
        runLogs: [],
        judgements: [],
        sandboxJobs: [],
        submissions: [],
        achievements: [],
        userAchievements: [],
        levels: [],
        userLevelProgresses: [],
        featureFlags: [],
        integrationClients: [],
    };

    const clone = (value) => JSON.parse(JSON.stringify(value));
    const now = () => new Date("2026-08-13T00:00:00.000Z");

    const findUserByEmail = (email) => state.users.find((user) => user.email === email) ?? null;
    const findUserById = (id) => state.users.find((user) => user.id === id) ?? null;
    const findSessionByToken = (token) => state.sessions.find((session) => session.token === token) ?? null;
    const findAccountByUserId = (userId) => state.accounts.find((account) => account.userId === userId) ?? null;
    const findAccountById = (id) => state.accounts.find((account) => account.id === id) ?? null;
    const findProfileByUserId = (userId) => state.profiles.find((profile) => profile.userId === userId) ?? null;
    const findPreferenceByUserId = (userId) => state.notificationPreferences.find((item) => item.userId === userId) ?? null;
    const findLicenseByUserId = (userId) =>
        state.desktopLicenses.filter((license) => license.userId === userId && license.deletedAt === null).at(-1) ?? null;
    const findDeviceById = (id) => state.devices.find((device) => device.id === id) ?? null;
    const commerce = require("./mock-prisma-commerce.js").createMockPrismaCommerce(state, clone, now);
    const progress = require("./mock-prisma-progress.js").createMockPrismaProgress(state, clone, now);
    const runs = require("./mock-prisma-runs.js").createMockPrismaRuns(state, clone, now);
    const submissions = require("./mock-prisma-submissions.js").createMockPrismaSubmissions(state, clone, now);
    const achievements = require("./mock-prisma-achievements.js").createMockPrismaAchievements(state, clone, now);
    const admin = require("./mock-prisma-admin.js").createMockPrismaAdmin(state, clone, now);

    const prisma = {
        state,
        user: {
            findUnique: async ({ where, include } = {}) => {
                const user = where?.email ? findUserByEmail(where.email) : findUserById(where?.id);
                if (!user) {
                    return null;
                }

                if (include?.userProfile) {
                    return { ...clone(user), userProfile: findProfileByUserId(user.id) };
                }

                return clone(user);
            },
            create: async ({ data }) => {
                const user = {
                    id: `user-${state.users.length + 1}`,
                    name: data.name,
                    email: data.email,
                    emailVerified: data.emailVerified ?? false,
                    image: data.image ?? null,
                    status: data.status ?? "active",
                    createdAt: now().toISOString(),
                    updatedAt: now().toISOString(),
                };
                state.users.push(user);
                return clone(user);
            },
            update: async ({ where, data }) => {
                const user = findUserById(where.id);
                if (!user) {
                    throw new Error("user not found");
                }

                Object.assign(user, data, { updatedAt: now().toISOString() });
                return clone(user);
            },
        },
        account: {
            findFirst: async ({ where, include } = {}) => {
                let account = null;
                if (where?.user?.email) {
                    const user = findUserByEmail(where.user.email);
                    account = user ? state.accounts.find((item) => item.userId === user.id) ?? null : null;
                } else if (where?.userId) {
                    account = findAccountByUserId(where.userId);
                }

                if (!account) {
                    return null;
                }

                if (include?.user) {
                    return { ...clone(account), user: findUserById(account.userId) };
                }

                return clone(account);
            },
            create: async ({ data }) => {
                const account = {
                    id: `account-${state.accounts.length + 1}`,
                    userId: data.userId,
                    provider: data.provider ?? "credentials",
                    identifier: data.identifier,
                    passwordHash: data.passwordHash ?? null,
                    accessToken: data.accessToken ?? null,
                    refreshToken: data.refreshToken ?? null,
                    idToken: data.idToken ?? null,
                    accessTokenExpiresAt: data.accessTokenExpiresAt ?? null,
                    refreshTokenExpiresAt: data.refreshTokenExpiresAt ?? null,
                    scope: data.scope ?? null,
                    createdAt: now().toISOString(),
                    updatedAt: now().toISOString(),
                };
                state.accounts.push(account);
                return clone(account);
            },
            update: async ({ where, data }) => {
                const account = findAccountById(where.id);
                if (!account) {
                    throw new Error("account not found");
                }

                Object.assign(account, data, { updatedAt: now().toISOString() });
                return clone(account);
            },
        },
        session: {
            create: async ({ data }) => {
                const session = {
                    id: `session-${state.sessions.length + 1}`,
                    token: data.token,
                    userId: data.userId,
                    expiresAt: data.expiresAt,
                    createdAt: now().toISOString(),
                    updatedAt: now().toISOString(),
                    ipAddress: data.ipAddress ?? null,
                    userAgent: data.userAgent ?? null,
                    revokedAt: data.revokedAt ?? null,
                };
                state.sessions.push(session);
                return clone(session);
            },
            findUnique: async ({ where, include } = {}) => {
                const session = findSessionByToken(where?.token);
                if (!session) {
                    return null;
                }

                if (include?.user) {
                    const user = findUserById(session.userId);
                    const userProfile = findProfileByUserId(session.userId);
                    return {
                        ...clone(session),
                        user: user ? { ...clone(user), userProfile } : null,
                    };
                }

                return clone(session);
            },
            findMany: async ({ where } = {}) =>
                state.sessions
                    .filter((session) => session.userId === where?.userId)
                    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
                    .map((session) => clone(session)),
            updateMany: async ({ where, data }) => {
                state.sessions.forEach((session) => {
                    if (session.id === where?.id && session.userId === where?.userId) {
                        Object.assign(session, data);
                    }
                });
                return { count: 1 };
            },
        },
        userProfile: {
            upsert: async ({ where, create, update }) => {
                const profile = findProfileByUserId(where.userId);
                if (!profile) {
                    const created = {
                        id: `profile-${state.profiles.length + 1}`,
                        userId: create.userId,
                        avatarUrl: create.avatarUrl ?? null,
                        bio: create.bio ?? null,
                        createdAt: now().toISOString(),
                        updatedAt: now().toISOString(),
                    };
                    state.profiles.push(created);
                    return clone(created);
                }

                Object.assign(profile, update, { updatedAt: now().toISOString() });
                return clone(profile);
            },
        },
        notificationPreference: {
            findUnique: async ({ where } = {}) => {
                const preference = findPreferenceByUserId(where?.userId);
                return preference ? clone(preference) : null;
            },
            upsert: async ({ where, create, update }) => {
                const preference = findPreferenceByUserId(where.userId);
                if (!preference) {
                    const created = {
                        id: `pref-${state.notificationPreferences.length + 1}`,
                        userId: create.userId,
                        email: create.email,
                        sms: create.sms,
                        inApp: create.inApp,
                        createdAt: now().toISOString(),
                        updatedAt: now().toISOString(),
                    };
                    state.notificationPreferences.push(created);
                    return clone(created);
                }

                Object.assign(preference, update, { updatedAt: now().toISOString() });
                return clone(preference);
            },
        },
        auditLog: {
            findMany: async ({ where, orderBy } = {}) => {
                const logs = where?.userId
                    ? state.auditLogs.filter((item) => item.userId === where.userId)
                    : state.auditLogs.slice();

                if (orderBy?.createdAt === "desc") {
                    logs.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
                }

                return logs.map((item) => clone(item));
            },
        },
        ...admin,
        task: {
            findUnique: async ({ where } = {}) => {
                const task = state.tasks.find((item) => item.id === where?.id) ?? null;
                return task ? clone(task) : null;
            },
        },
        desktopLicense: {
            findFirst: async ({ where, orderBy } = {}) => {
                const matches = state.desktopLicenses.filter((license) => {
                    if (where?.id && license.id !== where.id) {
                        return false;
                    }

                    if (where?.userId && license.userId !== where.userId) {
                        return false;
                    }

                    if (where?.licenseKey && license.licenseKey !== where.licenseKey) {
                        return false;
                    }

                    if (Object.prototype.hasOwnProperty.call(where ?? {}, "deletedAt") && license.deletedAt !== where.deletedAt) {
                        return false;
                    }

                    return true;
                });
                if (!matches.length) {
                    return null;
                }

                if (orderBy?.issuedAt === "desc") {
                    matches.sort((left, right) => right.issuedAt.localeCompare(left.issuedAt));
                }

                return clone(matches[0]);
            },
            create: async ({ data }) => {
                const license = {
                    id: `license-${state.desktopLicenses.length + 1}`,
                    userId: data.userId,
                    licenseKey: data.licenseKey,
                    status: data.status ?? "active",
                    maxDevices: data.maxDevices ?? 1,
                    maxPrimaryDevices: data.maxPrimaryDevices ?? 1,
                    issuedAt: now().toISOString(),
                    expiresAt: data.expiresAt ?? null,
                    deletedAt: data.deletedAt ?? null,
                    createdAt: now().toISOString(),
                    updatedAt: now().toISOString(),
                };
                state.desktopLicenses.push(license);
                return clone(license);
            },
            findUnique: async ({ where, include } = {}) => {
                const license = state.desktopLicenses.find((item) => item.id === where?.id) ?? null;
                if (!license) {
                    return null;
                }

                if (!include) {
                    return clone(license);
                }

                const devices = state.deviceBindings
                    .filter((binding) => binding.desktopLicenseId === license.id && binding.deletedAt === null)
                    .map((binding) => ({
                        ...clone(binding),
                        device: findDeviceById(binding.deviceId),
                        desktopLicense: clone(license),
                    }));
                const events = state.licenseEvents
                    .filter((event) => event.desktopLicenseId === license.id && event.archivedAt === null)
                    .map((event) => clone(event));

                return {
                    ...clone(license),
                    devices,
                    events,
                };
            },
            findMany: async ({ where } = {}) => {
                const licenses = state.desktopLicenses.filter(
                    (license) => license.userId === where?.userId && license.deletedAt === where?.deletedAt
                );
                return licenses.map((license) => ({
                    ...clone(license),
                    devices: state.deviceBindings.filter(
                        (binding) => binding.desktopLicenseId === license.id && binding.deletedAt === null
                    ),
                }));
            },
            update: async ({ where, data }) => {
                const license = state.desktopLicenses.find((item) => item.id === where.id);
                if (!license) {
                    throw new Error("license not found");
                }

                Object.assign(license, data, { updatedAt: now().toISOString() });
                return clone(license);
            },
        },
        device: {
            findMany: async ({ where, include } = {}) => {
                const devices = state.devices.filter((device) => device.userId === where?.userId);
                return devices.map((device) => {
                    if (!include?.deviceBindings) {
                        return clone(device);
                    }

                    return {
                        ...clone(device),
                        deviceBindings: state.deviceBindings
                            .filter((binding) => binding.deviceId === device.id && binding.deletedAt === null)
                            .map((binding) => ({
                                ...clone(binding),
                                desktopLicense: state.desktopLicenses.find(
                                    (license) => license.id === binding.desktopLicenseId
                                ),
                            })),
                    };
                });
            },
            findFirst: async ({ where, include } = {}) => {
                const device = state.devices.find((item) => item.id === where?.id && item.userId === where?.userId) ?? null;
                if (!device) {
                    return null;
                }

                if (!include?.deviceBindings) {
                    return clone(device);
                }

                return {
                    ...clone(device),
                    deviceBindings: state.deviceBindings
                        .filter((binding) => binding.deviceId === device.id && binding.deletedAt === null)
                        .map((binding) => ({
                            ...clone(binding),
                            desktopLicense: state.desktopLicenses.find((license) => license.id === binding.desktopLicenseId),
                        })),
                };
            },
        },
        deviceBinding: {
            count: async ({ where } = {}) =>
                state.deviceBindings.filter(
                    (binding) =>
                        binding.desktopLicenseId === where?.desktopLicenseId &&
                        binding.deletedAt === where?.deletedAt &&
                        binding.revokedAt === where?.revokedAt
                ).length,
            create: async ({ data, include } = {}) => {
                const binding = {
                    id: `binding-${state.deviceBindings.length + 1}`,
                    userId: data.userId,
                    desktopLicenseId: data.desktopLicenseId,
                    deviceId: data.deviceId,
                    bindingKey: data.bindingKey,
                    deviceFingerprint: data.deviceFingerprint ?? null,
                    deviceSlot: data.deviceSlot ?? 1,
                    isPrimary: data.isPrimary ?? false,
                    boundAt: now().toISOString(),
                    revokedAt: data.revokedAt ?? null,
                    deletedAt: data.deletedAt ?? null,
                };
                state.deviceBindings.push(binding);

                if (!include?.desktopLicense) {
                    return clone(binding);
                }

                return {
                    ...clone(binding),
                    desktopLicense: state.desktopLicenses.find((license) => license.id === binding.desktopLicenseId),
                };
            },
            findFirst: async ({ where } = {}) => {
                const binding = state.deviceBindings.find(
                    (item) =>
                        item.id === where?.id &&
                        item.userId === where?.userId &&
                        item.deletedAt === where?.deletedAt
                );
                return binding ? clone(binding) : null;
            },
            update: async ({ where, data }) => {
                const binding = state.deviceBindings.find((item) => item.id === where.id);
                if (!binding) {
                    throw new Error("binding not found");
                }

                Object.assign(binding, data);
                return clone(binding);
            },
        },
        licenseEvent: {
            create: async ({ data }) => {
                const event = {
                    id: `event-${state.licenseEvents.length + 1}`,
                    desktopLicenseId: data.desktopLicenseId,
                    eventType: data.eventType,
                    payload: data.payload ?? null,
                    createdAt: now().toISOString(),
                    archivedAt: data.archivedAt ?? null,
                };
                state.licenseEvents.push(event);
                return clone(event);
            },
            update: async ({ where, data }) => {
                const event = state.licenseEvents.find((item) => item.id === where.id);
                if (!event) {
                    throw new Error("event not found");
                }

                Object.assign(event, data);
                return clone(event);
            },
            findFirst: async ({ where, orderBy } = {}) => {
                const events = state.licenseEvents.filter(
                    (event) =>
                        event.desktopLicenseId === where?.desktopLicenseId &&
                        event.eventType === where?.eventType &&
                        event.archivedAt === where?.archivedAt
                );
                if (!events.length) {
                    return null;
                }

                if (orderBy?.createdAt === "desc") {
                    events.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
                }

                return clone(events[0]);
            },
            findMany: async ({ where, orderBy } = {}) => {
                const events = state.licenseEvents.filter(
                    (event) => event.desktopLicenseId === where?.desktopLicenseId && event.archivedAt === where?.archivedAt
                );
                if (orderBy?.createdAt === "desc") {
                    events.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
                }
                return events.map((event) => clone(event));
            },
        },
        ...commerce,
        ...progress,
        ...runs,
        ...submissions,
        ...achievements,
        seed: {
            ...require("./mock-prisma-seed.js").createMockPrismaSeed(state, now),
            ...commerce.seed,
            ...progress.seed,
            ...runs.seed,
            ...submissions.seed,
            ...achievements.seed,
            ...admin.seed,
        },
    };

    prisma.$transaction = async (callback) => callback(prisma);

    return prisma;
}

module.exports = {
    createMockPrisma,
};
