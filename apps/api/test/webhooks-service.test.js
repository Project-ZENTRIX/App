const assert = require("node:assert/strict");
const test = require("node:test");

const { WebhooksService } = require("../dist/src/webhooks/webhooks.service.js");
const { createMockPrisma } = require("./helpers/mock-prisma.js");

function createService() {
    const prisma = createMockPrisma();
    return { prisma, service: new WebhooksService(prisma) };
}

test("processes payment webhooks and updates the matching payment and order", async () => {
    const { prisma, service } = createService();
    prisma.seed.payment({
        id: "payment-1",
        userId: "user-1",
        orderId: "order-1",
        paymentNo: "PAY-001",
        status: "initiated",
        amount: "99.00",
        externalRef: "order-1",
    });
    prisma.seed.order({
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
    assert.equal(prisma.state.payments[0].status, "succeeded");
    assert.equal(prisma.state.orders[0].status, "paid");
    assert.equal(prisma.state.paymentEvents.at(-1).eventType, "webhook_payment_succeeded");
});

test("processes license webhooks and archives a license event", async () => {
    const { prisma, service } = createService();
    prisma.seed.license({
        id: "license-1",
        userId: "user-1",
        licenseKey: "license-1",
    });
    prisma.seed.licenseEvent({
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
    assert.equal(prisma.state.desktopLicenses[0].status, "revoked");
    assert.equal(prisma.state.licenseEvents.at(-1).eventType, "webhook_license_revoked");
});

