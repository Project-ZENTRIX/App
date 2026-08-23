function createMockSupabase() {
    const clone = (value) => JSON.parse(JSON.stringify(value));
    const now = () => new Date("2026-08-20T00:00:00.000Z").toISOString();

    const state = {
        users: [],
        sessions: [],
        userSessions: [],
        profiles: [],
        notificationPreferences: [],
        auditLogs: [],
        credentials: [],
        desktopLicenses: [],
        devices: [],
        deviceBindings: [],
        licenseEvents: [],
    };

    const findUserByEmail = (email) => state.users.find((user) => user.email === email) ?? null;
    const findUserById = (id) => state.users.find((user) => user.id === id) ?? null;
    const findProfileById = (id) => state.profiles.find((profile) => profile.id === id) ?? null;
    const findPreferenceByUserId = (userId) => state.notificationPreferences.find((item) => item.user_id === userId) ?? null;
    const findLicenseById = (id) => state.desktopLicenses.find((license) => license.id === id) ?? null;
    const findDeviceById = (id) => state.devices.find((device) => device.id === id) ?? null;

    const makeUser = (email, password, data = {}) => {
        const user = {
            id: `user-${state.users.length + 1}`,
            email,
            created_at: now(),
            updated_at: now(),
            email_confirmed_at: data.email_confirmed_at ?? now(),
            raw_user_meta_data: { name: data.name ?? email, image: data.image ?? null },
            user_metadata: { name: data.name ?? email, image: data.image ?? null },
        };
        state.users.push(user);
        state.credentials.push({ email, password, userId: user.id });
        state.profiles.push({
            id: user.id,
            display_name: data.name ?? email,
            avatar_url: data.image ?? null,
            bio: data.bio ?? null,
            status: "active",
            created_at: now(),
            updated_at: now(),
        });
        return user;
    };

    return {
        state,
        seed: {
            user(data) {
                const user = {
                    id: data.id,
                    email: data.email,
                    created_at: data.created_at ?? now(),
                    updated_at: data.updated_at ?? now(),
                    email_confirmed_at: data.emailConfirmedAt ?? data.email_confirmed_at ?? now(),
                    raw_user_meta_data: { name: data.name ?? data.email, image: data.image ?? null },
                    user_metadata: { name: data.name ?? data.email, image: data.image ?? null },
                };
                state.users.push(user);
                if (data.password) {
                    state.credentials.push({ email: data.email, password: data.password, userId: data.id });
                }
            },
            session(data) {
                state.userSessions.push({
                    id: data.id,
                    user_id: data.userId,
                    created_at: data.createdAt ?? now(),
                    updated_at: data.updatedAt ?? now(),
                    expires_at: data.expiresAt ?? null,
                    revoked_at: data.revokedAt ?? null,
                    ip_address: data.ipAddress ?? null,
                    user_agent: data.userAgent ?? null,
                });
            },
            profile(data) {
                state.profiles.push({
                    id: data.id,
                    display_name: data.display_name ?? data.name ?? "User",
                    avatar_url: data.avatar_url ?? null,
                    bio: data.bio ?? null,
                    status: data.status ?? "active",
                    created_at: data.created_at ?? now(),
                    updated_at: data.updated_at ?? now(),
                });
            },
            notificationPreference(data) {
                state.notificationPreferences.push({
                    user_id: data.user_id,
                    email: data.email ?? true,
                    sms: data.sms ?? false,
                    inApp: data.inApp ?? true,
                });
            },
            auditLog(data) {
                state.auditLogs.push({
                    ...data,
                    createdAt: data.createdAt ?? now(),
                });
            },
            license(data) {
                state.desktopLicenses.push({
                    id: data.id,
                    user_id: data.userId,
                    license_key: data.licenseKey,
                    status: data.status ?? "active",
                    max_devices: data.maxDevices ?? 1,
                    max_primary_devices: data.maxPrimaryDevices ?? 1,
                    issued_at: data.issuedAt ?? now(),
                    expires_at: data.expiresAt ?? null,
                    deleted_at: data.deletedAt ?? null,
                    created_at: data.createdAt ?? now(),
                    updated_at: data.updatedAt ?? now(),
                });
            },
            device(data) {
                state.devices.push({
                    id: data.id,
                    user_id: data.userId,
                    device_key: data.deviceKey,
                    name: data.name ?? null,
                    platform: data.platform ?? null,
                    created_at: data.createdAt ?? now(),
                    updated_at: data.updatedAt ?? now(),
                });
            },
            deviceBinding(data) {
                state.deviceBindings.push({
                    id: data.id,
                    user_id: data.userId,
                    desktop_license_id: data.desktopLicenseId,
                    device_id: data.deviceId,
                    binding_key: data.bindingKey,
                    device_fingerprint: data.deviceFingerprint ?? null,
                    device_slot: data.deviceSlot ?? 1,
                    is_primary: data.isPrimary ?? false,
                    bound_at: data.boundAt ?? now(),
                    revoked_at: data.revokedAt ?? null,
                    deleted_at: data.deletedAt ?? null,
                });
            },
            licenseEvent(data) {
                state.licenseEvents.push({
                    id: data.id,
                    desktop_license_id: data.desktopLicenseId,
                    event_type: data.eventType,
                    payload: data.payload ?? null,
                    created_at: data.createdAt ?? now(),
                    archived_at: data.archivedAt ?? null,
                });
            },
            credential(data) {
                state.credentials.push({
                    email: data.email,
                    password: data.password,
                    userId: data.userId,
                });
            },
        },
        async signInWithPassword(email, password) {
            const credential = state.credentials.find((item) => item.email === email && item.password === password);
            if (!credential) {
                const error = new Error("Invalid email or password");
                error.status = 401;
                throw error;
            }

            const user = findUserById(credential.userId) ?? makeUser(email, password, { name: email });
            const session = {
                access_token: `token-${user.id}`,
                refresh_token: `refresh-${user.id}`,
                user: clone(user),
            };
            state.sessions.push({
                id: `session-${state.sessions.length + 1}`,
                user_id: user.id,
                created_at: now(),
                updated_at: now(),
                factor_id: null,
                aal: "aal1",
                not_after: null,
                refreshed_at: null,
                user_agent: null,
                ip: null,
                tag: null,
                oauth_client_id: null,
                refresh_token_hmac_key: null,
                refresh_token_counter: 0,
                scopes: null,
            });

            return session;
        },
        async signUpWithPassword(email, password, data = {}) {
            if (findUserByEmail(email)) {
                const error = new Error("User already registered");
                error.status = 400;
                throw error;
            }

            const user = makeUser(email, password, data);
            state.sessions.push({
                id: `session-${state.sessions.length + 1}`,
                user_id: user.id,
                created_at: now(),
                updated_at: now(),
                factor_id: null,
                aal: "aal1",
                not_after: null,
                refreshed_at: null,
                user_agent: null,
                ip: null,
                tag: null,
                oauth_client_id: null,
                refresh_token_hmac_key: null,
                refresh_token_counter: 0,
                scopes: null,
            });

            return {
                user: clone(user),
                session: {
                    access_token: `token-${user.id}`,
                    refresh_token: `refresh-${user.id}`,
                    user: clone(user),
                },
            };
        },
        async getCurrentUser(authorization) {
            if (!authorization) {
                return null;
            }

            const token = authorization.split(" ")[1] ?? authorization;
            const userId = token.replace("token-", "");
            const user = findUserById(userId);
            return user ? { ...clone(user), access_token: token } : null;
        },
        async updateCurrentUser(authorization, payload) {
            const user = await this.getCurrentUser(authorization);
            if (!user) {
                const error = new Error("Unauthorized");
                error.status = 401;
                throw error;
            }

            const stored = findUserById(user.id);
            if (!stored) {
                const error = new Error("Unauthorized");
                error.status = 401;
                throw error;
            }

            if (payload.password) {
                const credential = state.credentials.find((item) => item.userId === stored.id);
                if (credential) {
                    credential.password = payload.password;
                }
            }

            if (payload.data) {
                stored.raw_user_meta_data = {
                    ...(stored.raw_user_meta_data ?? {}),
                    ...payload.data,
                };
                stored.user_metadata = {
                    ...(stored.user_metadata ?? {}),
                    ...payload.data,
                };
            }

            stored.updated_at = now();
            return clone(stored);
        },
        async selectOne(schema, table, filters) {
            if (schema === "public" && table === "profiles") {
                const profile = findProfileById(filters.id ?? null);
                return profile ? clone(profile) : null;
            }

            if (schema === "public" && table === "notification_preferences") {
                const preference = findPreferenceByUserId(filters.user_id ?? null);
                return preference ? clone(preference) : null;
            }

            if (schema === "public" && table === "desktop_licenses") {
                if (filters.id) {
                    const license = findLicenseById(filters.id);
                    return license ? clone(license) : null;
                }

                const license = state.desktopLicenses
                    .filter(
                        (item) =>
                            item.user_id === filters.user_id &&
                            (filters.deleted_at === undefined || item.deleted_at === filters.deleted_at)
                    )
                    .sort((left, right) => String(right.issued_at).localeCompare(String(left.issued_at)))[0];
                return license ? clone(license) : null;
            }

            if (schema === "public" && table === "devices") {
                const device = state.devices.find(
                    (item) => item.id === filters.id && item.user_id === filters.user_id
                );
                return device ? clone(device) : null;
            }

            return null;
        },
        async selectRows(schema, table, filters) {
            if (schema === "public" && table === "audit_logs") {
                return clone(state.auditLogs.filter((item) => item.userId === filters.user_id));
            }

            if (schema === "public" && table === "user_sessions") {
                return clone(state.userSessions.filter((item) => item.user_id === filters.user_id));
            }

            if (schema === "public" && table === "desktop_licenses") {
                return clone(
                    state.desktopLicenses.filter(
                        (item) =>
                            item.user_id === filters.user_id &&
                            item.deleted_at === filters.deleted_at
                    )
                );
            }

            if (schema === "public" && table === "devices") {
                return clone(state.devices.filter((item) => item.user_id === filters.user_id));
            }

            if (schema === "public" && table === "device_bindings") {
                return clone(
                    state.deviceBindings.filter(
                        (item) =>
                            item.user_id === filters.user_id &&
                            item.deleted_at === filters.deleted_at &&
                            (filters.desktop_license_id ? item.desktop_license_id === filters.desktop_license_id : true) &&
                            (filters.device_id ? item.device_id === filters.device_id : true)
                    )
                );
            }

            if (schema === "public" && table === "license_events") {
                return clone(
                    state.licenseEvents.filter(
                        (item) =>
                            item.desktop_license_id === filters.desktop_license_id &&
                            item.archived_at === filters.archived_at
                    )
                );
            }

            return [];
        },
        async upsertRow(schema, table, row) {
            if (schema === "public" && table === "profiles") {
                const profile = findProfileById(row.id);
                if (!profile) {
                    const created = {
                        id: row.id,
                        display_name: row.display_name,
                        avatar_url: row.avatar_url ?? null,
                        bio: row.bio ?? null,
                        status: "active",
                        created_at: now(),
                        updated_at: now(),
                    };
                    state.profiles.push(created);
                    return clone(created);
                }

                Object.assign(profile, {
                    display_name: row.display_name,
                    avatar_url: row.avatar_url ?? null,
                    bio: row.bio ?? null,
                    updated_at: now(),
                });
                return clone(profile);
            }

            if (schema === "public" && table === "notification_preferences") {
                const preference = findPreferenceByUserId(row.user_id);
                if (!preference) {
                    const created = {
                        user_id: row.user_id,
                        email: row.email,
                        sms: row.sms,
                        inApp: row.inApp,
                    };
                    state.notificationPreferences.push(created);
                    return clone(created);
                }

                Object.assign(preference, row);
                return clone(preference);
            }

            return clone(row);
        },
        async insertRow(schema, table, row) {
            if (schema === "public" && table === "user_sessions") {
                const created = {
                    id: row.id,
                    user_id: row.user_id,
                    created_at: row.created_at ?? now(),
                    updated_at: row.updated_at ?? now(),
                    expires_at: row.expires_at ?? null,
                    revoked_at: row.revoked_at ?? null,
                    ip_address: row.ip_address ?? null,
                    user_agent: row.user_agent ?? null,
                };
                state.userSessions.push(created);
                return clone(created);
            }

            if (schema === "public" && table === "desktop_licenses") {
                const created = {
                    id: row.id,
                    user_id: row.user_id,
                    license_key: row.license_key,
                    status: row.status ?? "active",
                    max_devices: row.max_devices ?? 1,
                    max_primary_devices: row.max_primary_devices ?? 1,
                    issued_at: row.issued_at ?? now(),
                    expires_at: row.expires_at ?? null,
                    deleted_at: row.deleted_at ?? null,
                    created_at: now(),
                    updated_at: now(),
                };
                state.desktopLicenses.push(created);
                return clone(created);
            }

            if (schema === "public" && table === "license_events") {
                const created = {
                    id: row.id,
                    desktop_license_id: row.desktop_license_id,
                    event_type: row.event_type,
                    payload: row.payload ?? null,
                    created_at: now(),
                    archived_at: row.archived_at ?? null,
                };
                state.licenseEvents.push(created);
                return clone(created);
            }

            if (schema === "public" && table === "device_bindings") {
                const created = {
                    id: row.id,
                    user_id: row.user_id,
                    desktop_license_id: row.desktop_license_id,
                    device_id: row.device_id,
                    binding_key: row.binding_key,
                    device_fingerprint: row.device_fingerprint ?? null,
                    device_slot: row.device_slot ?? 1,
                    is_primary: row.is_primary ?? false,
                    bound_at: now(),
                    revoked_at: row.revoked_at ?? null,
                    deleted_at: row.deleted_at ?? null,
                };
                state.deviceBindings.push(created);
                return clone(created);
            }

            return clone(row);
        },
        async updateRows(schema, table, filters, patch) {
            if (schema === "public" && table === "license_events") {
                state.licenseEvents.forEach((event) => {
                    if (event.id === filters.id) {
                        Object.assign(event, patch);
                    }
                });
                return clone(state.licenseEvents.filter((event) => event.id === filters.id));
            }

            if (schema === "public" && table === "device_bindings") {
                state.deviceBindings.forEach((binding) => {
                    if (binding.id === filters.id) {
                        Object.assign(binding, patch);
                    }
                });
                return clone(state.deviceBindings.filter((binding) => binding.id === filters.id));
            }

            return [];
        },
        async deleteRows(schema, table, filters) {
            if (schema === "public" && table === "user_sessions") {
                state.userSessions = state.userSessions.filter(
                    (item) => !(item.id === filters.id && item.user_id === filters.user_id)
                );
                return [];
            }

            if (schema === "public" && table === "device_bindings") {
                state.deviceBindings = state.deviceBindings.filter(
                    (binding) => !(binding.id === filters.id && binding.user_id === filters.user_id)
                );
                return [];
            }

            return [];
        },
        async listSessions(userId) {
            return clone(state.userSessions.filter((item) => item.user_id === userId));
        },
        async revokeSession(userId, sessionId) {
            state.userSessions = state.userSessions.filter((item) => !(item.id === sessionId && item.user_id === userId));
        },
    };
}

module.exports = {
    createMockSupabase,
};
