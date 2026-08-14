function createMockPrismaCommerce(state, clone, now) {
    const findProductById = (id) => state.products.find((product) => product.id === id) ?? null;
    const findOrderById = (id) => state.orders.find((order) => order.id === id) ?? null;
    const findPaymentById = (id) => state.payments.find((payment) => payment.id === id) ?? null;
    const findSubscriptionById = (id) => state.subscriptions.find((subscription) => subscription.id === id) ?? null;
    let tick = 0;
    const nextTimestamp = () => new Date(Date.parse(now().toISOString()) + tick++ * 1000).toISOString();

    return {
        product: {
            findUnique: async ({ where, include } = {}) => {
                const product = findProductById(where?.id) ?? state.products.find((item) => item.code === where?.code) ?? null;
                if (!product) {
                    return null;
                }

                return {
                    ...clone(product),
                    course: include?.course ? state.courses.find((course) => course.id === product.courseId) ?? null : undefined,
                };
            },
            findMany: async ({ where, include } = {}) => {
                const products = state.products.filter((product) => product.deletedAt === where?.deletedAt);
                return products.map((product) => ({
                    ...clone(product),
                    course: include?.course ? state.courses.find((course) => course.id === product.courseId) ?? null : undefined,
                }));
            },
        },
        order: {
            findMany: async ({ where, include } = {}) => {
                const orders = state.orders.filter(
                    (order) => order.userId === where?.userId && order.deletedAt === where?.deletedAt
                );
                return orders.map((order) => ({
                    ...clone(order),
                    items: include?.items ? state.orderItems.filter((item) => item.orderId === order.id) : [],
                    payments: include?.payments
                        ? state.payments
                              .filter((payment) => payment.orderId === order.id && payment.deletedAt === null)
                              .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
                        : [],
                }));
            },
            findFirst: async ({ where, include } = {}) => {
                const order = state.orders.find((item) => {
                    if (where?.id && item.id !== where.id) {
                        return false;
                    }

                    if (where?.userId && item.userId !== where.userId) {
                        return false;
                    }

                    if (Object.prototype.hasOwnProperty.call(where ?? {}, "deletedAt") && item.deletedAt !== where.deletedAt) {
                        return false;
                    }

                    return true;
                });
                if (!order) {
                    return null;
                }

                return {
                    ...clone(order),
                    items: include?.items ? state.orderItems.filter((item) => item.orderId === order.id) : [],
                    payments: include?.payments
                        ? state.payments
                              .filter((payment) => payment.orderId === order.id && payment.deletedAt === null)
                              .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
                        : [],
                };
            },
            create: async ({ data }) => {
                const order = {
                    id: `order-${state.orders.length + 1}`,
                    userId: data.userId,
                    orderNo: data.orderNo,
                    status: data.status ?? "pending",
                    totalAmount: data.totalAmount ?? "0.00",
                    currency: data.currency ?? "CNY",
                    deletedAt: data.deletedAt ?? null,
                    createdAt: nextTimestamp(),
                    updatedAt: nextTimestamp(),
                };
                state.orders.push(order);
                return clone(order);
            },
            update: async ({ where, data }) => {
                const order = findOrderById(where.id);
                if (!order) {
                    throw new Error("order not found");
                }

                Object.assign(order, data, { updatedAt: nextTimestamp() });
                return clone(order);
            },
        },
        orderItem: {
            create: async ({ data }) => {
                const orderItem = {
                    id: `order-item-${state.orderItems.length + 1}`,
                    orderId: data.orderId,
                    productId: data.productId ?? null,
                    name: data.name,
                    quantity: data.quantity ?? 1,
                    unitPrice: data.unitPrice ?? "0.00",
                    deletedAt: data.deletedAt ?? null,
                    createdAt: now().toISOString(),
                };
                state.orderItems.push(orderItem);
                return clone(orderItem);
            },
        },
        payment: {
            findFirst: async ({ where } = {}) => {
                const payment = state.payments.find((item) => {
                    if (where?.id && item.id !== where.id) {
                        return false;
                    }

                    if (where?.paymentNo && item.paymentNo !== where.paymentNo) {
                        return false;
                    }

                    if (where?.userId && item.userId !== where.userId) {
                        return false;
                    }

                    if (Object.prototype.hasOwnProperty.call(where ?? {}, "deletedAt") && item.deletedAt !== where.deletedAt) {
                        return false;
                    }

                    return true;
                });

                return payment ? clone(payment) : null;
            },
            create: async ({ data }) => {
                const payment = {
                    id: `payment-${state.payments.length + 1}`,
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
                    createdAt: nextTimestamp(),
                    updatedAt: nextTimestamp(),
                };
                state.payments.push(payment);
                return clone(payment);
            },
            update: async ({ where, data }) => {
                const payment = findPaymentById(where.id);
                if (!payment) {
                    throw new Error("payment not found");
                }

                Object.assign(payment, data, { updatedAt: nextTimestamp() });
                return clone(payment);
            },
        },
        paymentEvent: {
            create: async ({ data }) => {
                const paymentEvent = {
                    id: `payment-event-${state.paymentEvents.length + 1}`,
                    paymentId: data.paymentId,
                    eventType: data.eventType,
                    payload: data.payload ?? null,
                    archivedAt: data.archivedAt ?? null,
                    createdAt: nextTimestamp(),
                };
                state.paymentEvents.push(paymentEvent);
                return clone(paymentEvent);
            },
        },
        subscription: {
            findMany: async ({ where, include } = {}) => {
                const subscriptions = state.subscriptions.filter(
                    (subscription) => subscription.userId === where?.userId && subscription.deletedAt === where?.deletedAt
                );
                return subscriptions.map((subscription) => ({
                    ...clone(subscription),
                    product: include?.product ? state.products.find((product) => product.id === subscription.productId) ?? null : undefined,
                }));
            },
            findFirst: async ({ where, include } = {}) => {
                const subscription = state.subscriptions.find((item) => {
                    if (where?.id && item.id !== where.id) {
                        return false;
                    }

                    if (where?.userId && item.userId !== where.userId) {
                        return false;
                    }

                    if (where?.status && item.status !== where.status) {
                        return false;
                    }

                    if (Object.prototype.hasOwnProperty.call(where ?? {}, "deletedAt") && item.deletedAt !== where.deletedAt) {
                        return false;
                    }

                    return true;
                });
                if (!subscription) {
                    return null;
                }

                return {
                    ...clone(subscription),
                    product: include?.product ? state.products.find((product) => product.id === subscription.productId) ?? null : undefined,
                };
            },
            create: async ({ data, include } = {}) => {
                const subscription = {
                    id: `subscription-${state.subscriptions.length + 1}`,
                    userId: data.userId,
                    productId: data.productId ?? null,
                    orderId: data.orderId ?? null,
                    status: data.status ?? "active",
                    startedAt: data.startedAt ?? nextTimestamp(),
                    endsAt: data.endsAt ?? null,
                    deletedAt: data.deletedAt ?? null,
                    createdAt: nextTimestamp(),
                    updatedAt: nextTimestamp(),
                };
                state.subscriptions.push(subscription);
                return {
                    ...clone(subscription),
                    product: include?.product ? state.products.find((product) => product.id === subscription.productId) ?? null : undefined,
                };
            },
            update: async ({ where, data, include } = {}) => {
                const subscription = findSubscriptionById(where.id);
                if (!subscription) {
                    throw new Error("subscription not found");
                }

                Object.assign(subscription, data, { updatedAt: now().toISOString() });
                return {
                    ...clone(subscription),
                    product: include?.product ? state.products.find((product) => product.id === subscription.productId) ?? null : undefined,
                };
            },
        },
        seed: {
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
                    createdAt: nextTimestamp(),
                    updatedAt: nextTimestamp(),
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
                    createdAt: nextTimestamp(),
                    updatedAt: nextTimestamp(),
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
                    createdAt: nextTimestamp(),
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
                    createdAt: nextTimestamp(),
                    updatedAt: nextTimestamp(),
                });
            },
            paymentEvent(data) {
                state.paymentEvents.push({
                    id: data.id,
                    paymentId: data.paymentId,
                    eventType: data.eventType,
                    payload: data.payload ?? null,
                    archivedAt: data.archivedAt ?? null,
                    createdAt: nextTimestamp(),
                });
            },
            subscription(data) {
                state.subscriptions.push({
                    id: data.id,
                    userId: data.userId,
                    productId: data.productId ?? null,
                    orderId: data.orderId ?? null,
                    status: data.status ?? "active",
                    startedAt: data.startedAt ?? nextTimestamp(),
                    endsAt: data.endsAt ?? null,
                    deletedAt: data.deletedAt ?? null,
                    createdAt: nextTimestamp(),
                    updatedAt: nextTimestamp(),
                });
            },
        },
    };
}

module.exports = {
    createMockPrismaCommerce,
};
