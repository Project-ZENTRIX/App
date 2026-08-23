const assert = require("node:assert/strict");
const test = require("node:test");

const { WebhooksService } = require("../dist/webhooks/webhooks.service.js");
const { createMockSupabaseWebhooks } = require("./helpers/mock-supabase-webhooks.js");

function createService() {
    const supabase = createMockSupabaseWebhooks();
    return { supabase, service: new WebhooksService(supabase) };
}

test("processes payment webhooks and updates the matching payment and order", async () => {
    const { supabase, service } = createService();
    supabase.seed.payment({
        id: "payment-1",
        userId: "user-1",
        orderId: "order-1",
        paymentNo: "PAY-001",
        status: "initiated",
        amount: "99.00",
        externalRef: "order-1",
    });
    supabase.seed.order({
        id: "order-1",
        userId: "user-1",
        orderNo: "order-1",
        status: "pending",
        totalAmount: "99.00",
    });

    const result = await service.handlePaymentWebhook({
        eventId: "evt-1",
        paymentNo: "PAY-001",
        status: "succeeded",
    });

    assert.equal(result.success, true);
    assert.equal(supabase.state.payments[0].status, "succeeded");
    assert.equal(supabase.state.orders[0].status, "paid");
    assert.equal(supabase.state.paymentEvents.at(-1).event_type, "webhook_payment_succeeded");
});

test("processes license webhooks and archives a license event", async () => {
    const { supabase, service } = createService();
    supabase.seed.license({
        id: "license-1",
        userId: "user-1",
        licenseKey: "license-1",
    });
    supabase.seed.licenseEvent({
        id: "event-1",
        desktopLicenseId: "license-1",
        eventType: "license_issued",
    });

    const result = await service.handleLicenseWebhook({
        eventId: "evt-2",
        licenseKey: "license-1",
        status: "revoked",
    });

    assert.equal(result.success, true);
    assert.equal(supabase.state.desktopLicenses[0].status, "revoked");
    assert.equal(supabase.state.licenseEvents.at(-1).event_type, "webhook_license_revoked");
});

test("processes integration and sandbox webhooks", async () => {
    const { supabase, service } = createService();
    supabase.seed.integrationClient({
        id: "client-1",
        code: "client-1",
        name: "Client 1",
    });
    supabase.seed.run({
        id: "run-1",
        userId: "user-1",
        taskId: "task-1",
        status: "queued",
    });

    const integration = await service.handleIntegrationWebhook("client-1", { eventId: "evt-3" });
    const sandbox = await service.handleSandboxWebhook({
        eventId: "evt-4",
        runId: "run-1",
        status: "succeeded",
        stdout: "ok",
        stderr: null,
    });

    assert.equal(integration.success, true);
    assert.equal(sandbox.success, true);
    assert.equal(supabase.state.runs[0].status, "succeeded");
    assert.equal(supabase.state.runs[0].output, "ok");
});
