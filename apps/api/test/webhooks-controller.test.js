const assert = require("node:assert/strict");
const test = require("node:test");

const { WebhooksController } = require("../dist/webhooks/webhooks.controller.js");

test("webhooks controller proxies webhook routes to the webhook service", () => {
    const calls = [];
    const controller = new WebhooksController({
        handlePaymentWebhook: (body) => {
            calls.push(["payments", body]);
            return { success: true };
        },
        handleLicenseWebhook: (body) => {
            calls.push(["licenses", body]);
            return { success: true };
        },
        handleIntegrationWebhook: (clientKey, body) => {
            calls.push(["integrations", clientKey, body]);
            return { success: true };
        },
        handleSandboxWebhook: (body) => {
            calls.push(["sandbox", body]);
            return { success: true };
        },
    });

    assert.deepEqual(controller.handlePaymentsWebhook({ eventId: "evt-1" }), { success: true });
    assert.deepEqual(controller.handleLicensesWebhook({ eventId: "evt-2" }), { success: true });
    assert.deepEqual(controller.handleIntegrationWebhook("client-1", { eventId: "evt-3" }), { success: true });
    assert.deepEqual(controller.handleSandboxWebhook({ eventId: "evt-4" }), { success: true });
    assert.deepEqual(calls, [
        ["payments", { eventId: "evt-1" }],
        ["licenses", { eventId: "evt-2" }],
        ["integrations", "client-1", { eventId: "evt-3" }],
        ["sandbox", { eventId: "evt-4" }],
    ]);
});
