import { BadRequestException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { errorKeys } from "../common/errors/error-keys.js";
import { SUPABASE_CLIENT } from "../common/supabase/supabase.module.js";
import { SupabaseClient } from "../common/supabase/supabase.client.js";
import { getTokenFromAuthorizationHeader } from "../auth/auth-crypto.js";
import { mapOrder, mapPayment, mapProduct, mapSubscription } from "./commerce-mappers.js";
import {
    loadOrder,
    loadProduct,
    loadProducts,
    loadSubscription,
    toDate,
    toDateRequired,
    type PaymentRow,
    type OrderRecord,
    type ProductRecord,
    type SubscriptionRecord,
} from "./commerce.supabase.js";

@Injectable()
export class CommerceService {
    constructor(@Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient) {}

    private async requireSession(authorization?: string) {
        const token = getTokenFromAuthorizationHeader(authorization);
        if (!token) {
            throw new UnauthorizedException(errorKeys.unauthorized);
        }

        const session = await this.supabase.getCurrentUser(authorization);
        if (!session) {
            throw new UnauthorizedException(errorKeys.unauthorized);
        }

        return session;
    }

    private toProductPayload(product: ProductRecord) {
        return {
            id: product.id,
            courseId: product.course_id,
            code: product.code,
            name: product.name,
            description: product.description,
            status: product.status,
            price: product.price,
            currency: product.currency,
            course: product.course,
        };
    }

    private toOrderPayload(order: OrderRecord) {
        return {
            id: order.id,
            orderNo: order.order_no,
            status: order.status,
            totalAmount: order.total_amount,
            currency: order.currency,
            createdAt: toDateRequired(order.created_at),
            updatedAt: toDateRequired(order.updated_at),
            items: order.items.map((item) => ({
                id: item.id,
                productId: item.product_id,
                name: item.name,
                quantity: item.quantity,
                unitPrice: item.unit_price,
            })),
            payments: order.payments.map((payment) => ({
                id: payment.id,
                paymentNo: payment.payment_no,
                status: payment.status,
                amount: payment.amount,
                currency: payment.currency,
                provider: payment.provider,
                externalRef: payment.external_ref,
                gatewayTxnId: payment.gateway_txn_id,
                createdAt: toDateRequired(payment.created_at),
                updatedAt: toDateRequired(payment.updated_at),
            })),
        };
    }

    private toSubscriptionPayload(subscription: SubscriptionRecord) {
        return {
            id: subscription.id,
            userId: subscription.user_id,
            productId: subscription.product_id,
            orderId: subscription.order_id,
            status: subscription.status,
            startedAt: toDateRequired(subscription.started_at),
            endsAt: toDate(subscription.ends_at),
            createdAt: toDateRequired(subscription.created_at),
            updatedAt: toDateRequired(subscription.updated_at),
            product: subscription.product,
        };
    }

    async listProducts(query: { keyword?: string; status?: string; courseId?: string } = {}) {
        const products = await loadProducts(this.supabase);
        const keyword = query.keyword?.trim().toLowerCase();
        const filtered = products.filter((product) => {
            if (query.status && product.status !== query.status) {
                return false;
            }

            if (query.courseId && product.course_id !== query.courseId) {
                return false;
            }

            if (!keyword) {
                return true;
            }

            return [product.name, product.code, product.description ?? "", product.course?.title ?? ""]
                .join(" ")
                .toLowerCase()
                .includes(keyword);
        });

        return {
            items: filtered.map((product) => mapProduct(this.toProductPayload(product))),
        };
    }

    async getProduct(productId: string) {
        const product = await loadProduct(this.supabase, productId);
        return product ? mapProduct(this.toProductPayload(product)) : null;
    }

    async listOrders(authorization?: string) {
        const session = await this.requireSession(authorization);
        const orders = await this.supabase.selectRows<OrderRecord>(
            "public",
            "orders",
            {
                user_id: session.id,
                deleted_at: null,
            },
            "*",
            {
                column: "created_at",
                ascending: false,
            }
        );

        const loaded = await Promise.all(orders.map((order) => loadOrder(this.supabase, order.id, session.id)));
        return {
            items: loaded.filter(Boolean).map((order) => mapOrder(this.toOrderPayload(order!))),
        };
    }

    async getOrder(orderId: string, authorization?: string) {
        const session = await this.requireSession(authorization);
        const order = await loadOrder(this.supabase, orderId, session.id);
        return order ? mapOrder(this.toOrderPayload(order)) : null;
    }

    async createOrder(
        authorization: string | undefined,
        body: {
            items: Array<{ productId: string; quantity?: number }>;
        }
    ) {
        const session = await this.requireSession(authorization);
        if (!body?.items?.length) {
            throw new BadRequestException(errorKeys.atLeastOneOrderItemRequired);
        }

        const products = await Promise.all(body.items.map((item) => loadProduct(this.supabase, item.productId)));
        const productMap = new Map(products.filter(Boolean).map((product) => [product!.id, product!]));

        if (productMap.size !== body.items.length) {
            throw new BadRequestException(errorKeys.oneOrMoreProductsMissing);
        }

        const normalizedItems = body.items.map((item) => {
            const quantity = item.quantity ?? 1;
            if (!Number.isInteger(quantity) || quantity < 1) {
                throw new BadRequestException(errorKeys.quantityMustBePositive);
            }

            const product = productMap.get(item.productId);
            if (!product) {
                throw new BadRequestException(errorKeys.productNotFound);
            }

            return { product, quantity };
        });

        const totalAmount = normalizedItems.reduce((total, item) => total + Number(item.product.price) * item.quantity, 0);
        const currency = normalizedItems[0]?.product.currency ?? "CNY";

        const order = await this.supabase.insertRow<OrderRecord>("public", "orders", {
            user_id: session.id,
            order_no: `ORD-${randomUUID()}`,
            status: "pending",
            total_amount: totalAmount.toFixed(2),
            currency,
            deleted_at: null,
        });

        await Promise.all(
            normalizedItems.map((item) =>
                this.supabase.insertRow("public", "order_items", {
                    order_id: order.id,
                    product_id: item.product.id,
                    name: item.product.name,
                    quantity: item.quantity,
                    unit_price: Number(item.product.price).toFixed(2),
                    deleted_at: null,
                })
            )
        );

        return this.getOrder(order.id, authorization);
    }

    async cancelOrder(orderId: string, authorization?: string) {
        const session = await this.requireSession(authorization);
        const order = await this.supabase.selectOne<OrderRecord>("public", "orders", {
            id: orderId,
            user_id: session.id,
            deleted_at: null,
        });

        if (!order) {
            throw new BadRequestException(errorKeys.orderNotFound);
        }

        if (order.status === "paid") {
            throw new BadRequestException(errorKeys.paidOrderCannotBeCancelled);
        }

        await this.supabase.updateRows("public", "orders", { id: order.id }, { status: "cancelled" });
        return { success: true as const };
    }

    async createPayment(orderId: string, authorization?: string) {
        const session = await this.requireSession(authorization);
        const order = await loadOrder(this.supabase, orderId, session.id);

        if (!order) {
            throw new BadRequestException(errorKeys.orderNotFound);
        }

        if (order.status === "paid") {
            const latestPayment = order.payments[0];
            return latestPayment
                ? mapPayment({
                      id: latestPayment.id,
                      paymentNo: latestPayment.payment_no,
                      status: latestPayment.status,
                      amount: latestPayment.amount,
                      currency: latestPayment.currency,
                      provider: latestPayment.provider,
                      externalRef: latestPayment.external_ref,
                      gatewayTxnId: latestPayment.gateway_txn_id,
                      createdAt: toDateRequired(latestPayment.created_at),
                      updatedAt: toDateRequired(latestPayment.updated_at),
                  })
                : null;
        }

        const createdPayment = await this.supabase.insertRow<PaymentRow>("public", "payments", {
            user_id: session.id,
            order_id: order.id,
            payment_no: `PAY-${randomUUID()}`,
            status: "succeeded",
            amount: order.total_amount,
            currency: order.currency,
            provider: "manual",
            external_ref: order.order_no,
            gateway_txn_id: `GW-${randomUUID()}`,
            deleted_at: null,
        });

        await this.supabase.insertRow("public", "payment_events", {
            payment_id: createdPayment.id,
            event_type: "payment_succeeded",
            payload: {
                orderId: order.id,
                paymentNo: createdPayment.payment_no,
            },
        });

        await this.supabase.updateRows("public", "orders", { id: order.id }, { status: "paid" });

        return mapPayment({
            id: createdPayment.id,
            paymentNo: createdPayment.payment_no,
            status: createdPayment.status,
            amount: createdPayment.amount,
            currency: createdPayment.currency,
            provider: createdPayment.provider,
            externalRef: createdPayment.external_ref,
            gatewayTxnId: createdPayment.gateway_txn_id,
            createdAt: toDateRequired(createdPayment.created_at),
            updatedAt: toDateRequired(createdPayment.updated_at),
        });
    }

    async payOrder(orderId: string, authorization?: string) {
        return this.createPayment(orderId, authorization);
    }

    async getPayment(paymentId: string, authorization?: string) {
        const session = await this.requireSession(authorization);
        const payment = await this.supabase.selectOne<PaymentRow>("public", "payments", {
            id: paymentId,
            user_id: session.id,
            deleted_at: null,
        });

        return payment
            ? mapPayment({
                  id: payment.id,
                  paymentNo: payment.payment_no,
                  status: payment.status,
                  amount: payment.amount,
                  currency: payment.currency,
                  provider: payment.provider,
                  externalRef: payment.external_ref,
                  gatewayTxnId: payment.gateway_txn_id,
                  createdAt: toDateRequired(payment.created_at),
                  updatedAt: toDateRequired(payment.updated_at),
              })
            : null;
    }

    async getPaymentStatus(orderId: string, authorization?: string) {
        const session = await this.requireSession(authorization);
        const order = await loadOrder(this.supabase, orderId, session.id);

        if (!order) {
            throw new BadRequestException(errorKeys.orderNotFound);
        }

        const latestPayment = order.payments[0] ?? null;
        return {
            orderId: order.id,
            orderStatus: order.status,
            paymentStatus: latestPayment?.status ?? "initiated",
            paymentId: latestPayment?.id ?? null,
        };
    }

    async listSubscriptions(authorization?: string) {
        const session = await this.requireSession(authorization);
        const subscriptions = await this.supabase.selectRows<SubscriptionRecord>(
            "public",
            "subscriptions",
            {
                user_id: session.id,
                deleted_at: null,
            },
            "*",
            {
                column: "created_at",
                ascending: false,
            }
        );

        const loaded = await Promise.all(
            subscriptions.map((subscription) => loadSubscription(this.supabase, subscription.id, session.id))
        );
        return {
            items: loaded.filter(Boolean).map((subscription) => mapSubscription(this.toSubscriptionPayload(subscription!))),
        };
    }

    async getCurrentSubscription(authorization?: string) {
        const session = await this.requireSession(authorization);
        const subscription = await this.supabase.selectOne<SubscriptionRecord>("public", "subscriptions", {
            user_id: session.id,
            status: "active",
            deleted_at: null,
        });

        if (!subscription) {
            return null;
        }

        const loaded = await loadSubscription(this.supabase, subscription.id, session.id);
        return loaded ? mapSubscription(this.toSubscriptionPayload(loaded)) : null;
    }

    async getSubscription(subscriptionId: string, authorization?: string) {
        const session = await this.requireSession(authorization);
        const loaded = await loadSubscription(this.supabase, subscriptionId, session.id);
        return loaded ? mapSubscription(this.toSubscriptionPayload(loaded)) : null;
    }

    async createSubscription(
        authorization: string | undefined,
        body: {
            productId: string;
            orderId?: string | null;
            endsAt?: string | null;
        }
    ) {
        const session = await this.requireSession(authorization);
        const product = await loadProduct(this.supabase, body.productId);
        if (!product) {
            throw new BadRequestException(errorKeys.productNotFound);
        }

        const created = await this.supabase.insertRow<SubscriptionRecord>("public", "subscriptions", {
            user_id: session.id,
            product_id: product.id,
            order_id: body.orderId ?? null,
            status: "active",
            started_at: new Date().toISOString(),
            ends_at: body.endsAt
                ? new Date(body.endsAt).toISOString()
                : new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
            deleted_at: null,
        });

        return mapSubscription(
            this.toSubscriptionPayload({
                ...created,
                product: { id: product.id, code: product.code, name: product.name },
            })
        );
    }

    async renewSubscription(subscriptionId: string, authorization?: string) {
        const session = await this.requireSession(authorization);
        const subscription = await loadSubscription(this.supabase, subscriptionId, session.id);

        if (!subscription) {
            throw new BadRequestException(errorKeys.subscriptionNotFound);
        }

        const base =
            subscription.ends_at && new Date(subscription.ends_at) > new Date() ? new Date(subscription.ends_at) : new Date();
        const renewed = await this.supabase.updateRows<SubscriptionRecord>(
            "public",
            "subscriptions",
            {
                id: subscription.id,
            },
            {
                ends_at: new Date(base.getTime() + 1000 * 60 * 60 * 24 * 30).toISOString(),
            }
        );

        const updated = renewed[0] ?? subscription;
        const product = subscription.product_id ? await loadProduct(this.supabase, subscription.product_id) : null;
        return mapSubscription(
            this.toSubscriptionPayload({
                ...updated,
                product: product ? { id: product.id, code: product.code, name: product.name } : subscription.product,
            })
        );
    }

    async cancelAutoRenew(subscriptionId: string, authorization?: string) {
        const session = await this.requireSession(authorization);
        const loaded = await loadSubscription(this.supabase, subscriptionId, session.id);

        if (!loaded) {
            throw new BadRequestException(errorKeys.subscriptionNotFound);
        }

        return {
            success: true as const,
            subscription: mapSubscription(this.toSubscriptionPayload(loaded)),
        };
    }
}
