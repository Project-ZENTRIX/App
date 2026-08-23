const assert = require("node:assert/strict");
const test = require("node:test");

const { AdminService } = require("../dist/admin/admin.service.js");
const { createMockSupabaseAdmin } = require("./helpers/mock-supabase-admin.js");

function createService() {
    const supabase = createMockSupabaseAdmin();
    return { supabase, service: new AdminService(supabase) };
}

test("lists audit logs, feature flags and integration clients for admin views", async () => {
    const { supabase, service } = createService();
    supabase.seed.auditLog({
        id: "audit-1",
        userId: "user-1",
        action: "user.updated",
        entityType: "user",
        entityId: "user-1",
    });
    supabase.seed.featureFlag({
        id: "flag-1",
        key: "new-dashboard",
        name: "New Dashboard",
        enabled: true,
    });
    supabase.seed.integrationClient({
        id: "client-1",
        code: "payments",
        name: "Payments",
    });

    const auditLogs = await service.listAuditLogs();
    const featureFlags = await service.listFeatureFlags();
    const integrationClients = await service.listIntegrationClients();

    assert.equal(auditLogs.items.length, 1);
    assert.equal(auditLogs.items[0].action, "user.updated");
    assert.equal(featureFlags.items.length, 1);
    assert.equal(featureFlags.items[0].enabled, true);
    assert.equal(integrationClients.items.length, 1);
    assert.equal(integrationClients.items[0].code, "payments");
});
