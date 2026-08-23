function createMockSupabaseWebhooks(seed = {}) {
    const clone = (value) => JSON.parse(JSON.stringify(value));
    const now = () => new Date("2026-08-20T00:00:00.000Z").toISOString();

    const state = {
        orders: clone(seed.orders ?? []),
        payments: clone(seed.payments ?? []),
        paymentEvents: clone(seed.paymentEvents ?? []),
        desktopLicenses: clone(seed.desktopLicenses ?? []),
        licenseEvents: clone(seed.licenseEvents ?? []),
        integrationClients: clone(seed.integrationClients ?? []),
        runs: clone(seed.runs ?? []),
    };

    const findOrderById = (id) => state.orders.find((item) => item.id === id) ?? null;
    const findPaymentById = (id) => state.payments.find((item) => item.id === id) ?? null;
    const findLicenseById = (id) => state.desktopLicenses.find((item) => item.id === id) ?? null;
    const findRunById = (id) => state.runs.find((item) => item.id === id) ?? null;

    return {
        state,
        seed: {
            order(data) {
                state.orders.push({
                    id: data.id,
                    user_id: data.userId,
                    order_no: data.orderNo,
                    status: data.status ?? "pending",
                    total_amount: data.totalAmount ?? "0.00",
                    currency: data.currency ?? "CNY",
                    deleted_at: data.deletedAt ?? null,
                    created_at: data.createdAt ?? now(),
                    updated_at: data.updatedAt ?? now(),
                });
            },
            payment(data) {
                state.payments.push({
                    id: data.id,
                    user_id: data.userId,
                    order_id: data.orderId ?? null,
                    payment_no: data.paymentNo,
                    status: data.status ?? "initiated",
                    amount: data.amount ?? "0.00",
                    currency: data.currency ?? "CNY",
                    provider: data.provider ?? null,
                    external_ref: data.externalRef ?? null,
                    gateway_txn_id: data.gatewayTxnId ?? null,
                    deleted_at: data.deletedAt ?? null,
                    created_at: data.createdAt ?? now(),
                    updated_at: data.updatedAt ?? now(),
                });
            },
            paymentEvent(data) {
                state.paymentEvents.push({
                    id: data.id,
                    payment_id: data.paymentId,
                    event_type: data.eventType,
                    payload: data.payload ?? null,
                    created_at: data.createdAt ?? now(),
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
            integrationClient(data) {
                state.integrationClients.push({
                    id: data.id,
                    code: data.code,
                    name: data.name,
                    secret_hash: data.secretHash ?? null,
                    deleted_at: data.deletedAt ?? null,
                    created_at: data.createdAt ?? now(),
                    updated_at: data.updatedAt ?? now(),
                });
            },
            run(data) {
                state.runs.push({
                    id: data.id,
                    user_id: data.userId,
                    task_id: data.taskId,
                    status: data.status ?? "queued",
                    input: data.input ?? null,
                    output: data.output ?? null,
                    error: data.error ?? null,
                    runtime_ms: data.runtimeMs ?? null,
                    memory_kb: data.memoryKb ?? null,
                    started_at: data.startedAt ?? null,
                    finished_at: data.finishedAt ?? null,
                    created_at: data.createdAt ?? now(),
                    submitted_at: data.submittedAt ?? null,
                    deleted_at: data.deletedAt ?? null,
                });
            },
        },
        async selectOne(schema, table, filters = {}) {
            if (schema !== "public") {
                return null;
            }

            if (table === "payments") {
                const row = state.payments.find((item) => {
                    if (filters.id && item.id !== filters.id) {
                        return false;
                    }
                    if (filters.payment_no && item.payment_no !== filters.payment_no) {
                        return false;
                    }
                    if (Object.prototype.hasOwnProperty.call(filters, "deleted_at") && item.deleted_at !== filters.deleted_at) {
                        return false;
                    }
                    return true;
                });
                return row ? clone(row) : null;
            }

            if (table === "orders") {
                const row = state.orders.find((item) => item.id === filters.id && item.deleted_at === filters.deleted_at);
                return row ? clone(row) : null;
            }

            if (table === "desktop_licenses") {
                const row = state.desktopLicenses.find((item) => {
                    if (filters.id && item.id !== filters.id) {
                        return false;
                    }
                    if (filters.license_key && item.license_key !== filters.license_key) {
                        return false;
                    }
                    if (Object.prototype.hasOwnProperty.call(filters, "deleted_at") && item.deleted_at !== filters.deleted_at) {
                        return false;
                    }
                    return true;
                });
                return row ? clone(row) : null;
            }

            if (table === "runs") {
                const row = state.runs.find((item) => item.id === filters.id && item.deleted_at === filters.deleted_at);
                return row ? clone(row) : null;
            }

            return null;
        },
        async selectRows(schema, table, filters = {}, select = "*", orderBy) {
            if (schema !== "public") {
                return [];
            }

            let rows = [];
            if (table === "integration_clients") {
                rows = state.integrationClients.filter((item) => item.deleted_at === filters.deleted_at);
            }

            if (orderBy?.column === "created_at") {
                rows = [...rows].sort((left, right) => {
                    const leftValue = String(left.created_at ?? "");
                    const rightValue = String(right.created_at ?? "");
                    return orderBy.ascending === false ? rightValue.localeCompare(leftValue) : leftValue.localeCompare(rightValue);
                });
            }

            return clone(rows);
        },
        async updateRows(schema, table, filters, patch) {
            if (schema !== "public") {
                return [];
            }

            if (table === "payments") {
                const updated = [];
                state.payments.forEach((item) => {
                    if (item.id === filters.id) {
                        Object.assign(item, patch, { updated_at: now() });
                        updated.push(clone(item));
                    }
                });
                return updated;
            }

            if (table === "orders") {
                const updated = [];
                state.orders.forEach((item) => {
                    if (item.id === filters.id) {
                        Object.assign(item, patch, { updated_at: now() });
                        updated.push(clone(item));
                    }
                });
                return updated;
            }

            if (table === "desktop_licenses") {
                const updated = [];
                state.desktopLicenses.forEach((item) => {
                    if (item.id === filters.id) {
                        Object.assign(item, patch, { updated_at: now() });
                        updated.push(clone(item));
                    }
                });
                return updated;
            }

            if (table === "runs") {
                const updated = [];
                state.runs.forEach((item) => {
                    if (item.id === filters.id) {
                        Object.assign(item, patch, { updated_at: now() });
                        updated.push(clone(item));
                    }
                });
                return updated;
            }

            return [];
        },
        async insertRow(schema, table, row) {
            if (schema !== "public") {
                return clone(row);
            }

            if (table === "payment_events") {
                const created = {
                    id: row.id ?? `payment-event-${state.paymentEvents.length + 1}`,
                    payment_id: row.payment_id,
                    event_type: row.event_type,
                    payload: row.payload ?? null,
                    created_at: row.created_at ?? now(),
                };
                state.paymentEvents.push(created);
                return clone(created);
            }

            if (table === "license_events") {
                const created = {
                    id: row.id ?? `license-event-${state.licenseEvents.length + 1}`,
                    desktop_license_id: row.desktop_license_id,
                    event_type: row.event_type,
                    payload: row.payload ?? null,
                    created_at: row.created_at ?? now(),
                    archived_at: row.archived_at ?? null,
                };
                state.licenseEvents.push(created);
                return clone(created);
            }

            return clone(row);
        },
        async getCurrentUser(authorization) {
            if (!authorization) {
                return null;
            }

            return { id: "user-1", email: "user@example.com", created_at: now(), updated_at: now(), access_token: authorization.split(" ")[1] ?? authorization };
        },
    };
}

module.exports = {
    createMockSupabaseWebhooks,
};
