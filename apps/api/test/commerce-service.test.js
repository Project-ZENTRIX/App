const assert = require("node:assert/strict");
const test = require("node:test");

const { CommerceService } = require("../dist/commerce/commerce.service.js");
const { createMockSupabaseCommerce } = require("./helpers/mock-supabase-commerce.js");

function createService() {
    const supabase = createMockSupabaseCommerce();
    return { supabase, service: new CommerceService(supabase) };
}

test("lists products and filters by keyword", async () => {
    const { supabase, service } = createService();
    supabase.seed.product({
        id: "product-1",
        code: "course-fundamentals",
        name: "Course Fundamentals",
        description: "Learn the basics",
        status: "published",
        price: "99.00",
    });
    supabase.seed.product({
        id: "product-2",
        code: "course-advanced",
        name: "Advanced Course",
        description: "Deep dive",
        status: "draft",
        price: "199.00",
    });

    const result = await service.listProducts({ keyword: "fundamentals", status: "published" });

    assert.equal(result.items.length, 1);
    assert.equal(result.items[0].id, "product-1");
});

test("creates an order and returns calculated totals", async () => {
    const { supabase, service } = createService();
    supabase.seed.user({ id: "user-1", email: "learner@example.com", name: "Learner" });
    supabase.seed.session({
        id: "session-1",
        userId: "user-1",
        token: "token-123",
        expiresAt: new Date("2026-08-20T00:00:00.000Z").toISOString(),
    });
    supabase.seed.product({
        id: "product-1",
        code: "course-fundamentals",
        name: "Course Fundamentals",
        status: "published",
        price: "99.00",
    });

    const order = await service.createOrder("Bearer token-user-1", {
        items: [{ productId: "product-1", quantity: 2 }],
    });

    assert.ok(order);
    assert.equal(order.totalAmount, "198.00");
    assert.equal(order.items.length, 1);
    assert.equal(order.items[0].quantity, 2);
    assert.equal(supabase.state.orders.length, 1);
    assert.equal(supabase.state.orderItems.length, 1);
});

test("creates a payment, updates order status and exposes payment status", async () => {
    const { supabase, service } = createService();
    supabase.seed.user({ id: "user-1", email: "learner@example.com", name: "Learner" });
    supabase.seed.session({
        id: "session-1",
        userId: "user-1",
        token: "token-123",
        expiresAt: new Date("2026-08-20T00:00:00.000Z").toISOString(),
    });
    supabase.seed.order({
        id: "order-1",
        userId: "user-1",
        orderNo: "ORD-001",
        status: "pending",
        totalAmount: "99.00",
    });
    supabase.seed.payment({
        id: "payment-1",
        userId: "user-1",
        orderId: "order-1",
        paymentNo: "PAY-001",
        status: "initiated",
        amount: "99.00",
    });

    const payment = await service.payOrder("order-1", "Bearer token-user-1");
    const status = await service.getPaymentStatus("order-1", "Bearer token-user-1");

    assert.equal(payment.status, "succeeded");
    assert.equal(status.paymentStatus, "succeeded");
    assert.equal(status.orderStatus, "paid");
});

test("creates, renews and lists subscriptions", async () => {
    const { supabase, service } = createService();
    supabase.seed.user({ id: "user-1", email: "learner@example.com", name: "Learner" });
    supabase.seed.session({
        id: "session-1",
        userId: "user-1",
        token: "token-123",
        expiresAt: new Date("2026-08-20T00:00:00.000Z").toISOString(),
    });
    supabase.seed.product({
        id: "product-1",
        code: "membership-pro",
        name: "Membership Pro",
        status: "published",
        price: "299.00",
    });

    const created = await service.createSubscription("Bearer token-user-1", { productId: "product-1" });
    const renewed = await service.renewSubscription(created.id, "Bearer token-user-1");
    const current = await service.getCurrentSubscription("Bearer token-user-1");
    const listed = await service.listSubscriptions("Bearer token-user-1");
    const cancelled = await service.cancelAutoRenew(created.id, "Bearer token-user-1");

    assert.equal(created.productId, "product-1");
    assert.equal(renewed.id, created.id);
    assert.equal(current.id, created.id);
    assert.equal(listed.items.length, 1);
    assert.equal(cancelled.success, true);
    assert.equal(cancelled.subscription.id, created.id);
});
