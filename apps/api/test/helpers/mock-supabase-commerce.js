function createMockSupabaseCommerce(seed = {}) {
    const clone = (value) => JSON.parse(JSON.stringify(value));
    const now = () => new Date("2026-08-20T00:00:00.000Z").toISOString();
    let tick = 0;
    const nextTimestamp = () => new Date(Date.parse(now()) + tick++ * 1000).toISOString();

    const state = {
        users: clone(seed.users ?? []),
        sessions: clone(seed.sessions ?? []),
        courses: clone(seed.courses ?? []),
        products: clone(seed.products ?? []),
        orders: clone(seed.orders ?? []),
        orderItems: clone(seed.orderItems ?? []),
        payments: clone(seed.payments ?? []),
        paymentEvents: clone(seed.paymentEvents ?? []),
        subscriptions: clone(seed.subscriptions ?? []),
    };

    const findCourseById = (id) => state.courses.find((item) => item.id === id) ?? null;
    const findProductById = (id) => state.products.find((item) => item.id === id) ?? null;
    const findOrderById = (id) => state.orders.find((item) => item.id === id) ?? null;
    const findPaymentById = (id) => state.payments.find((item) => item.id === id) ?? null;
    const findSubscriptionById = (id) => state.subscriptions.find((item) => item.id === id) ?? null;

    return {
        state,
        seed: {
            user(data) {
                state.users.push({
                    id: data.id,
                    email: data.email,
                    created_at: now(),
                    updated_at: now(),
                    user_metadata: { name: data.name ?? data.email },
                });
            },
            session(data) {
                state.sessions.push({
                    id: data.id,
                    user_id: data.userId,
                    token: data.token,
                    created_at: data.createdAt ?? now(),
                    updated_at: data.updatedAt ?? now(),
                    not_after: data.expiresAt ?? null,
                });
            },
            course(data) {
                state.courses.push({
                    id: data.id,
                    slug: data.slug ?? data.id,
                    title: data.title,
                    created_at: now(),
                    updated_at: now(),
                });
            },
            product(data) {
                state.products.push({
                    id: data.id,
                    course_id: data.courseId ?? null,
                    code: data.code,
                    name: data.name,
                    description: data.description ?? null,
                    status: data.status ?? "draft",
                    price: data.price ?? "0.00",
                    currency: data.currency ?? "CNY",
                    deleted_at: data.deletedAt ?? null,
                    created_at: data.createdAt ?? now(),
                    updated_at: data.updatedAt ?? now(),
                });
            },
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
            orderItem(data) {
                state.orderItems.push({
                    id: data.id,
                    order_id: data.orderId,
                    product_id: data.productId ?? null,
                    name: data.name,
                    quantity: data.quantity ?? 1,
                    unit_price: data.unitPrice ?? "0.00",
                    created_at: data.createdAt ?? now(),
                    deleted_at: data.deletedAt ?? null,
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
                    created_at: data.createdAt ?? nextTimestamp(),
                    updated_at: data.updatedAt ?? nextTimestamp(),
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
            subscription(data) {
                state.subscriptions.push({
                    id: data.id,
                    user_id: data.userId,
                    product_id: data.productId ?? null,
                    order_id: data.orderId ?? null,
                    status: data.status ?? "active",
                    started_at: data.startedAt ?? now(),
                    ends_at: data.endsAt ?? null,
                    deleted_at: data.deletedAt ?? null,
                    created_at: data.createdAt ?? now(),
                    updated_at: data.updatedAt ?? now(),
                });
            },
        },
        async getCurrentUser(authorization) {
            if (!authorization) {
                return null;
            }

            const token = authorization.split(" ")[1] ?? authorization;
            const userId = token.replace("token-", "");
            const user = state.users.find((item) => item.id === userId);
            return user ? { ...clone(user), access_token: token } : null;
        },
        async selectOne(schema, table, filters = {}) {
            if (schema !== "public") {
                return null;
            }

            if (table === "courses") {
                const row = findCourseById(filters.id);
                return row ? clone(row) : null;
            }

            if (table === "products") {
                const row = findProductById(filters.id) ?? state.products.find((item) => item.code === filters.code) ?? null;
                if (!row) {
                    return null;
                }

                if (Object.prototype.hasOwnProperty.call(filters, "deleted_at") && row.deleted_at !== filters.deleted_at) {
                    return null;
                }

                return clone(row);
            }

            if (table === "orders") {
                const row = state.orders.find((item) => {
                    if (filters.id && item.id !== filters.id) {
                        return false;
                    }
                    if (filters.user_id && item.user_id !== filters.user_id) {
                        return false;
                    }
                    if (Object.prototype.hasOwnProperty.call(filters, "deleted_at") && item.deleted_at !== filters.deleted_at) {
                        return false;
                    }
                    return true;
                });
                return row ? clone(row) : null;
            }

            if (table === "payments") {
                const row = state.payments.find((item) => {
                    if (filters.id && item.id !== filters.id) {
                        return false;
                    }
                    if (filters.payment_no && item.payment_no !== filters.payment_no) {
                        return false;
                    }
                    if (filters.user_id && item.user_id !== filters.user_id) {
                        return false;
                    }
                    if (Object.prototype.hasOwnProperty.call(filters, "deleted_at") && item.deleted_at !== filters.deleted_at) {
                        return false;
                    }
                    return true;
                });
                return row ? clone(row) : null;
            }

            if (table === "subscriptions") {
                const row = state.subscriptions.find((item) => {
                    if (filters.id && item.id !== filters.id) {
                        return false;
                    }
                    if (filters.user_id && item.user_id !== filters.user_id) {
                        return false;
                    }
                    if (filters.status && item.status !== filters.status) {
                        return false;
                    }
                    if (Object.prototype.hasOwnProperty.call(filters, "deleted_at") && item.deleted_at !== filters.deleted_at) {
                        return false;
                    }
                    return true;
                });
                return row ? clone(row) : null;
            }

            return null;
        },
        async selectRows(schema, table, filters = {}, select = "*", orderBy) {
            if (schema !== "public") {
                return [];
            }

            let rows = [];
            if (table === "products") {
                rows = state.products.filter((item) => item.deleted_at === filters.deleted_at);
            }

            if (table === "orders") {
                rows = state.orders.filter((item) => item.user_id === filters.user_id && item.deleted_at === filters.deleted_at);
            }

            if (table === "order_items") {
                rows = state.orderItems.filter((item) => item.order_id === filters.order_id && item.deleted_at === filters.deleted_at);
            }

            if (table === "payments") {
                rows = state.payments.filter((item) => item.order_id === filters.order_id && item.deleted_at === filters.deleted_at);
            }

            if (table === "subscriptions") {
                rows = state.subscriptions.filter((item) => item.user_id === filters.user_id && item.deleted_at === filters.deleted_at);
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
        async insertRow(schema, table, row) {
            if (schema !== "public") {
                return clone(row);
            }

            if (table === "orders") {
                const created = {
                    id: row.id ?? `order-${state.orders.length + 1}`,
                    user_id: row.user_id,
                    order_no: row.order_no,
                    status: row.status ?? "pending",
                    total_amount: row.total_amount ?? "0.00",
                    currency: row.currency ?? "CNY",
                    deleted_at: row.deleted_at ?? null,
                    created_at: row.created_at ?? now(),
                    updated_at: row.updated_at ?? now(),
                };
                state.orders.push(created);
                return clone(created);
            }

            if (table === "order_items") {
                const created = {
                    id: row.id ?? `order-item-${state.orderItems.length + 1}`,
                    order_id: row.order_id,
                    product_id: row.product_id ?? null,
                    name: row.name,
                    quantity: row.quantity ?? 1,
                    unit_price: row.unit_price ?? "0.00",
                    created_at: row.created_at ?? now(),
                    deleted_at: row.deleted_at ?? null,
                };
                state.orderItems.push(created);
                return clone(created);
            }

            if (table === "payments") {
                const created = {
                    id: row.id ?? `payment-${state.payments.length + 1}`,
                    user_id: row.user_id,
                    order_id: row.order_id ?? null,
                    payment_no: row.payment_no,
                    status: row.status ?? "initiated",
                    amount: row.amount ?? "0.00",
                    currency: row.currency ?? "CNY",
                    provider: row.provider ?? null,
                    external_ref: row.external_ref ?? null,
                    gateway_txn_id: row.gateway_txn_id ?? null,
                    deleted_at: row.deleted_at ?? null,
                    created_at: row.created_at ?? nextTimestamp(),
                    updated_at: row.updated_at ?? nextTimestamp(),
                };
                state.payments.push(created);
                return clone(created);
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

            if (table === "subscriptions") {
                const created = {
                    id: row.id ?? `subscription-${state.subscriptions.length + 1}`,
                    user_id: row.user_id,
                    product_id: row.product_id ?? null,
                    order_id: row.order_id ?? null,
                    status: row.status ?? "active",
                    started_at: row.started_at ?? now(),
                    ends_at: row.ends_at ?? null,
                    deleted_at: row.deleted_at ?? null,
                    created_at: row.created_at ?? now(),
                    updated_at: row.updated_at ?? now(),
                };
                state.subscriptions.push(created);
                return clone(created);
            }

            return clone(row);
        },
        async updateRows(schema, table, filters, patch) {
            if (schema !== "public") {
                return [];
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

            if (table === "subscriptions") {
                const updated = [];
                state.subscriptions.forEach((item) => {
                    if (item.id === filters.id) {
                        Object.assign(item, patch, { updated_at: now() });
                        updated.push(clone(item));
                    }
                });
                return updated;
            }

            return [];
        },
    };
}

module.exports = {
    createMockSupabaseCommerce,
};
