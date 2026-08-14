function createMockPrismaSeed(state, now) {
    return {
        user(data) {
            state.users.push({
                id: data.id,
                name: data.name ?? data.email,
                email: data.email,
                emailVerified: data.emailVerified ?? true,
                image: data.image ?? null,
                status: data.status ?? "active",
                createdAt: data.createdAt ?? now().toISOString(),
                updatedAt: data.updatedAt ?? now().toISOString(),
            });
        },
        account(data) {
            state.accounts.push({
                id: data.id,
                userId: data.userId,
                provider: data.provider ?? "credentials",
                identifier: data.identifier ?? data.userId,
                passwordHash: data.passwordHash ?? null,
                accessToken: null,
                refreshToken: null,
                idToken: null,
                accessTokenExpiresAt: null,
                refreshTokenExpiresAt: null,
                scope: null,
                createdAt: now().toISOString(),
                updatedAt: now().toISOString(),
            });
        },
        session(data) {
            state.sessions.push({
                id: data.id,
                token: data.token,
                userId: data.userId,
                expiresAt: data.expiresAt,
                createdAt: data.createdAt ?? now().toISOString(),
                updatedAt: data.updatedAt ?? now().toISOString(),
                ipAddress: null,
                userAgent: null,
                revokedAt: data.revokedAt ?? null,
            });
        },
        profile(data) {
            state.profiles.push({
                id: data.id,
                userId: data.userId,
                avatarUrl: data.avatarUrl ?? null,
                bio: data.bio ?? null,
                createdAt: now().toISOString(),
                updatedAt: now().toISOString(),
            });
        },
        device(data) {
            state.devices.push({
                id: data.id,
                userId: data.userId,
                deviceKey: data.deviceKey,
                name: data.name ?? null,
                platform: data.platform ?? null,
                createdAt: now().toISOString(),
                updatedAt: now().toISOString(),
            });
        },
        auditLog(data) {
            state.auditLogs.push({
                id: data.id,
                userId: data.userId ?? null,
                action: data.action,
                entityType: data.entityType,
                entityId: data.entityId ?? null,
                payload: data.payload ?? null,
                deletedAt: data.deletedAt ?? null,
                createdAt: data.createdAt ?? now().toISOString(),
            });
        },
        submission(data) {
            state.submissions.push({
                id: data.id,
                userId: data.userId,
                taskId: data.taskId,
                status: data.status ?? "queued",
                code: data.code ?? null,
                language: data.language ?? null,
                runId: data.runId ?? null,
                submittedAt: data.submittedAt ?? now().toISOString(),
                evaluatedAt: data.evaluatedAt ?? null,
                createdAt: data.createdAt ?? now().toISOString(),
                updatedAt: data.updatedAt ?? now().toISOString(),
            });
        },
        featureFlag(data) {
            state.featureFlags.push({
                id: data.id,
                key: data.key,
                name: data.name,
                enabled: data.enabled ?? false,
                payload: data.payload ?? null,
                deletedAt: data.deletedAt ?? null,
                createdAt: data.createdAt ?? now().toISOString(),
                updatedAt: data.updatedAt ?? now().toISOString(),
            });
        },
        integrationClient(data) {
            state.integrationClients.push({
                id: data.id,
                code: data.code,
                name: data.name,
                secretHash: data.secretHash ?? null,
                deletedAt: data.deletedAt ?? null,
                createdAt: data.createdAt ?? now().toISOString(),
                updatedAt: data.updatedAt ?? now().toISOString(),
            });
        },
        deviceBinding(data) {
            state.deviceBindings.push({
                id: data.id,
                userId: data.userId,
                desktopLicenseId: data.desktopLicenseId,
                deviceId: data.deviceId,
                bindingKey: data.bindingKey,
                deviceFingerprint: data.deviceFingerprint ?? null,
                deviceSlot: data.deviceSlot ?? 1,
                isPrimary: data.isPrimary ?? false,
                boundAt: data.boundAt ?? now().toISOString(),
                revokedAt: data.revokedAt ?? null,
                deletedAt: data.deletedAt ?? null,
            });
        },
        license(data) {
            state.desktopLicenses.push({
                id: data.id,
                userId: data.userId,
                licenseKey: data.licenseKey,
                status: data.status ?? "active",
                maxDevices: data.maxDevices ?? 1,
                maxPrimaryDevices: data.maxPrimaryDevices ?? 1,
                issuedAt: data.issuedAt ?? now().toISOString(),
                expiresAt: data.expiresAt ?? null,
                deletedAt: data.deletedAt ?? null,
                createdAt: now().toISOString(),
                updatedAt: now().toISOString(),
            });
        },
        product(data) {
            state.products.push({
                id: data.id,
                courseId: data.courseId ?? null,
                code: data.code,
                name: data.name,
                description: data.description ?? null,
                status: data.status ?? "draft",
                price: data.price ?? "0.00",
                currency: data.currency ?? "CNY",
                deletedAt: data.deletedAt ?? null,
                createdAt: now().toISOString(),
                updatedAt: now().toISOString(),
            });
        },
        order(data) {
            state.orders.push({
                id: data.id,
                userId: data.userId,
                orderNo: data.orderNo,
                status: data.status ?? "pending",
                totalAmount: data.totalAmount ?? "0.00",
                currency: data.currency ?? "CNY",
                deletedAt: data.deletedAt ?? null,
                createdAt: now().toISOString(),
                updatedAt: now().toISOString(),
            });
        },
        orderItem(data) {
            state.orderItems.push({
                id: data.id,
                orderId: data.orderId,
                productId: data.productId ?? null,
                name: data.name,
                quantity: data.quantity ?? 1,
                unitPrice: data.unitPrice ?? "0.00",
                deletedAt: data.deletedAt ?? null,
                createdAt: now().toISOString(),
            });
        },
        payment(data) {
            state.payments.push({
                id: data.id,
                userId: data.userId,
                orderId: data.orderId ?? null,
                paymentNo: data.paymentNo,
                status: data.status ?? "initiated",
                amount: data.amount ?? "0.00",
                currency: data.currency ?? "CNY",
                provider: data.provider ?? null,
                externalRef: data.externalRef ?? null,
                gatewayTxnId: data.gatewayTxnId ?? null,
                deletedAt: data.deletedAt ?? null,
                createdAt: now().toISOString(),
                updatedAt: now().toISOString(),
            });
        },
        paymentEvent(data) {
            state.paymentEvents.push({
                id: data.id,
                paymentId: data.paymentId,
                eventType: data.eventType,
                payload: data.payload ?? null,
                archivedAt: data.archivedAt ?? null,
                createdAt: now().toISOString(),
            });
        },
        licenseEvent(data) {
            state.licenseEvents.push({
                id: data.id,
                desktopLicenseId: data.desktopLicenseId,
                eventType: data.eventType,
                payload: data.payload ?? null,
                createdAt: data.createdAt ?? now().toISOString(),
                archivedAt: data.archivedAt ?? null,
            });
        },
        subscription(data) {
            state.subscriptions.push({
                id: data.id,
                userId: data.userId,
                productId: data.productId ?? null,
                orderId: data.orderId ?? null,
                status: data.status ?? "active",
                startedAt: data.startedAt ?? now().toISOString(),
                endsAt: data.endsAt ?? null,
                deletedAt: data.deletedAt ?? null,
                createdAt: now().toISOString(),
                updatedAt: now().toISOString(),
            });
        },
    };
}

module.exports = {
    createMockPrismaSeed,
};
