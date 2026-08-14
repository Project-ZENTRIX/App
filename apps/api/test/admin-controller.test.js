const assert = require("node:assert/strict");
const test = require("node:test");

const { AdminController } = require("../dist/src/admin/admin.controller.js");

test("admin controller proxies audit logs, feature flags and integration client routes", () => {
    const calls = [];
    const controller = new AdminController({
        listAuditLogs: () => {
            calls.push(["audit-logs"]);
            return { items: [] };
        },
        listFeatureFlags: () => {
            calls.push(["feature-flags"]);
            return { items: [] };
        },
        listIntegrationClients: () => {
            calls.push(["integration-clients"]);
            return { items: [] };
        },
    });

    assert.deepEqual(controller.getAuditLogs(), { items: [] });
    assert.deepEqual(controller.getFeatureFlags(), { items: [] });
    assert.deepEqual(controller.getIntegrationClients(), { items: [] });
    assert.deepEqual(calls, [["audit-logs"], ["feature-flags"], ["integration-clients"]]);
});

