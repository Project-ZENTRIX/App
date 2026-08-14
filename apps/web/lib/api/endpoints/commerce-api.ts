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
