import { apiRequest } from "../client";
import { getAuthorizedHeaders } from "../auth";

export type ProductItem = {
    id: string;
    name: string;
    code: string;
    description: string | null;
    price: string;
    currency: string;
    status: string;
    courseId: string | null;
    course: {
        id: string;
        title: string;
        summary: string;
    } | null;
};

export type OrderItem = {
    id: string;
    orderNo: string;
    status: string;
    totalAmount: string;
    currency: string;
    createdAt: string;
    updatedAt: string;
    canPay: boolean;
    canCancel: boolean;
    items: Array<{
        id: string;
        productId: string;
        name: string;
        quantity: number;
        unitPrice: string;
        subtotal: string;
    }>;
    payments: Array<{
        id: string;
        paymentNo: string;
        status: string;
        amount: string;
        currency: string;
        createdAt: string;
    }>;
};

export type OrderDetail = OrderItem;

export type SubscriptionItem = {
    id: string;
    status: string;
    startedAt: string;
    endsAt: string;
    autoRenew: boolean;
    product: ProductItem | null;
    orderId: string | null;
};

export function listProducts(params: { keyword?: string; status?: string; courseId?: string } = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value) {
            query.set(key, value);
        }
    });

    return apiRequest<{ items: ProductItem[] }>(`/products${query.toString() ? `?${query.toString()}` : ""}`, {
        method: "GET",
    });
}

export function listOrders() {
    return apiRequest<{ items: OrderItem[] }>("/orders", {
        method: "GET",
        headers: getAuthorizedHeaders(),
    });
}

export function getOrder(orderId: string) {
    return apiRequest<OrderDetail | null>(`/orders/${orderId}`, {
        method: "GET",
        headers: getAuthorizedHeaders(),
    });
}

export function createOrder(input: { items: Array<{ productId: string; quantity?: number }> }) {
    return apiRequest<OrderDetail>("/orders", {
        method: "POST",
        headers: getAuthorizedHeaders(),
        body: input,
    });
}

export function cancelOrder(orderId: string) {
    return apiRequest<{ success: true }>(`/orders/${orderId}/cancel`, {
        method: "POST",
        headers: getAuthorizedHeaders(),
    });
}

export function payOrder(orderId: string) {
    return apiRequest<{ id: string; paymentNo: string; status: string; amount: string; currency: string }>(
        `/orders/${orderId}/pay`,
        {
            method: "POST",
            headers: getAuthorizedHeaders(),
        }
    );
}

export function getPaymentStatus(orderId: string) {
    return apiRequest<{
        orderId: string;
        orderStatus: string;
        paymentStatus: string;
        paymentId: string | null;
    }>(`/orders/${orderId}/payment-status`, {
        method: "GET",
        headers: getAuthorizedHeaders(),
    });
}

export function getCurrentSubscription() {
    return apiRequest<SubscriptionItem | null>("/subscriptions/current", {
        method: "GET",
        headers: getAuthorizedHeaders(),
    });
}

export function listSubscriptions() {
    return apiRequest<{ items: SubscriptionItem[] }>("/subscriptions", {
        method: "GET",
        headers: getAuthorizedHeaders(),
    });
}

export function getSubscription(subscriptionId: string) {
    return apiRequest<SubscriptionItem | null>(`/subscriptions/${subscriptionId}`, {
        method: "GET",
        headers: getAuthorizedHeaders(),
    });
}

export function renewSubscription(subscriptionId: string) {
    return apiRequest<SubscriptionItem>(`/subscriptions/${subscriptionId}/renew`, {
        method: "PATCH",
        headers: getAuthorizedHeaders(),
    });
}

export function cancelAutoRenew(subscriptionId: string) {
    return apiRequest<{ success: true; subscription: SubscriptionItem }>(`/subscriptions/${subscriptionId}/cancel-autorenew`, {
        method: "POST",
        headers: getAuthorizedHeaders(),
    });
}
