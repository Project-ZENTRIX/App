function createMockSupabaseAdmin(seed = {}) {
    const clone = (value) => JSON.parse(JSON.stringify(value));
    const now = () => new Date("2026-08-20T00:00:00.000Z").toISOString();

    const state = {
        auditLogs: clone(seed.auditLogs ?? []),
        featureFlags: clone(seed.featureFlags ?? []),
        integrationClients: clone(seed.integrationClients ?? []),
    };

    return {
        state,
        seed: {
            auditLog(data) {
                state.auditLogs.push({
                    id: data.id,
                    tenant_id: data.tenantId ?? null,
                    user_id: data.userId ?? null,
                    action: data.action,
                    entity_type: data.entityType,
                    entity_id: data.entityId ?? null,
                    payload: data.payload ?? null,
                    deleted_at: data.deletedAt ?? null,
                    created_at: data.createdAt ?? now(),
                });
            },
            featureFlag(data) {
                state.featureFlags.push({
                    id: data.id,
                    key: data.key,
                    name: data.name,
                    enabled: data.enabled ?? false,
                    payload: data.payload ?? null,
                    deleted_at: data.deletedAt ?? null,
                    created_at: data.createdAt ?? now(),
                    updated_at: data.updatedAt ?? now(),
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
        },
        async selectRows(schema, table, filters = {}, select = "*", orderBy) {
            if (schema !== "public") {
                return [];
            }

            let rows = [];
            if (table === "audit_logs") {
                rows = state.auditLogs;
            }

            if (table === "feature_flags") {
                rows = state.featureFlags.filter((item) => item.deleted_at === filters.deleted_at);
            }

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
    };
}

module.exports = {
    createMockSupabaseAdmin,
};
