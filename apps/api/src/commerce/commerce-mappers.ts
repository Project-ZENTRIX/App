type MoneyLike = string | number | { toString(): string };

type ProductPayload = {
    id: string;
    courseId: string | null;
    code: string;
    name: string;
    description: string | null;
    status: string;
    price: string;
    currency: string;
    course: { id: string; slug: string; title: string } | null;
};

type OrderItemPayload = {
    id: string;
    productId: string | null;
    name: string;
    quantity: number;
    unitPrice: string;
    subtotal: string;
};

type PaymentPayload = {
    id: string;
    paymentNo: string;
    status: string;
    amount: string;
    currency: string;
    provider: string | null;
    externalRef: string | null;
    gatewayTxnId: string | null;
    createdAt: Date;
    updatedAt: Date;
};

type SubscriptionPayload = {
    id: string;
    userId: string;
    productId: string | null;
    orderId: string | null;
    status: string;
    startedAt: Date;
    endsAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    product: { id: string; code: string; name: string } | null;
};

type OrderPayload = {
    id: string;
    orderNo: string;
    status: string;
    totalAmount: string;
    currency: string;
    createdAt: Date;
    updatedAt: Date;
    items: OrderItemPayload[];
    payments: PaymentPayload[];
};

export function formatMoney(value: MoneyLike) {
    return typeof value === "object" ? value.toString() : Number(value).toFixed(2);
}

export function mapProduct(product: {
    id: string;
    courseId: string | null;
    code: string;
    name: string;
    description: string | null;
    status: string;
    price: MoneyLike;
    currency: string;
    course: { id: string; slug: string; title: string } | null;
}): ProductPayload {
    return {
        id: product.id,
        courseId: product.courseId,
        code: product.code,
        name: product.name,
        description: product.description,
        status: product.status,
        price: formatMoney(product.price),
        currency: product.currency,
        course: product.course,
    };
}

export function mapOrderItem(item: {
    id: string;
    productId: string | null;
    name: string;
    quantity: number;
    unitPrice: MoneyLike;
}): OrderItemPayload {
    const unitPrice = formatMoney(item.unitPrice);
    return {
        id: item.id,
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        unitPrice,
        subtotal: formatMoney(Number(unitPrice) * item.quantity),
    };
}

export function mapPayment(payment: {
    id: string;
    paymentNo: string;
    status: string;
    amount: MoneyLike;
    currency: string;
    provider: string | null;
    externalRef: string | null;
    gatewayTxnId: string | null;
    createdAt: Date;
    updatedAt: Date;
}): PaymentPayload {
    return {
        id: payment.id,
        paymentNo: payment.paymentNo,
        status: payment.status,
        amount: formatMoney(payment.amount),
        currency: payment.currency,
        provider: payment.provider,
        externalRef: payment.externalRef,
        gatewayTxnId: payment.gatewayTxnId,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
    };
}

export function mapSubscription(subscription: {
    id: string;
    userId: string;
    productId: string | null;
    orderId: string | null;
    status: string;
    startedAt: Date;
    endsAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    product?: { id: string; code: string; name: string } | null;
}): SubscriptionPayload {
    return {
        id: subscription.id,
        userId: subscription.userId,
        productId: subscription.productId,
        orderId: subscription.orderId,
        status: subscription.status,
        startedAt: subscription.startedAt,
        endsAt: subscription.endsAt,
        createdAt: subscription.createdAt,
        updatedAt: subscription.updatedAt,
        product: subscription.product ?? null,
    };
}

export function mapOrder(order: {
    id: string;
    orderNo: string;
    status: string;
    totalAmount: MoneyLike;
    currency: string;
    createdAt: Date;
    updatedAt: Date;
    items: Array<{
        id: string;
        productId: string | null;
        name: string;
        quantity: number;
        unitPrice: MoneyLike;
    }>;
    payments: Array<{
        id: string;
        paymentNo: string;
        status: string;
        amount: MoneyLike;
        currency: string;
        provider: string | null;
        externalRef: string | null;
        gatewayTxnId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}): OrderPayload {
    return {
        id: order.id,
        orderNo: order.orderNo,
        status: order.status,
        totalAmount: formatMoney(order.totalAmount),
        currency: order.currency,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.items.map((item) => mapOrderItem(item)),
        payments: order.payments.map((payment) => mapPayment(payment)),
    };
}
