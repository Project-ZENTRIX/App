import { apiRequest } from "../client";
import { getAuthorizedHeaders } from "../auth";
import {
    getCurrentSubscription as loadCurrentSubscription,
    getOrder as loadOrder,
    getPaymentStatus as loadPaymentStatus,
    listOrders as loadOrders,
    listProducts as loadProducts,
    getSubscription as loadSubscription,
    listSubscriptions as loadSubscriptions,
    type OrderDetail,
    type OrderItem,
    type PaymentStatus,
    type ProductItem,
    type SubscriptionItem,
} from "@/lib/supabase/commerce-queries";

export type { OrderDetail, OrderItem, PaymentStatus, ProductItem, SubscriptionItem };

export function listProducts(params: { keyword?: string; status?: string; courseId?: string } = {}) {
    return loadProducts(params);
}

export function listOrders() {
    return loadOrders();
}

export function getOrder(orderId: string) {
    return loadOrder(orderId);
}

export function getPaymentStatus(orderId: string) {
    return loadPaymentStatus(orderId);
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

export function getCurrentSubscription() {
    return loadCurrentSubscription();
}

export function listSubscriptions() {
    return loadSubscriptions();
}

export function getSubscription(subscriptionId: string) {
    return loadSubscription(subscriptionId);
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
