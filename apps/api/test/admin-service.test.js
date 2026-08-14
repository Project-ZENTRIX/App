const assert = require("node:assert/strict");
const test = require("node:test");

const { AdminService } = require("../dist/src/admin/admin.service.js");
const { createMockPrisma } = require("./helpers/mock-prisma.js");

function createService() {
    const prisma = createMockPrisma();
    return { prisma, service: new AdminService(prisma) };
}

test("lists audit logs, feature flags and integration clients for admin views", async () => {
    const { prisma, service } = createService();
    prisma.seed.auditLog({
        id: "audit-1",
        userId: "user-1",
        action: "user.updated",
        entityType: "user",
        entityId: "user-1",
    });
    prisma.seed.featureFlag({
        id: "flag-1",
        key: "new-dashboard",
        name: "New Dashboard",
        enabled: true,
    });
    prisma.seed.integrationClient({
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

