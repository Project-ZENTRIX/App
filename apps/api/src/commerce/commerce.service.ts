import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { PrismaService } from "../../prisma/prisma.service.js";
import { errorKeys } from "../common/errors/error-keys.js";
import { getSessionFromAuthorizationHeader } from "../auth/auth-session.js";
import { mapOrder, mapPayment, mapProduct, mapSubscription } from "./commerce-mappers.js";

@Injectable()
export class CommerceService {
    constructor(private readonly prisma: PrismaService) {}

    private async requireSession(authorization?: string) {
        const session = await getSessionFromAuthorizationHeader(this.prisma, authorization);
        if (!session) {
            throw new UnauthorizedException(errorKeys.unauthorized);
        }

        return session;
    }

    private async loadProduct(productId: string) {
        return this.prisma.product.findUnique({
            where: {
                id: productId,
            },
            include: {
                course: true,
            },
        });
    }

    async listProducts(query: { keyword?: string; status?: string; courseId?: string } = {}) {
        const products = await this.prisma.product.findMany({
            where: {
                deletedAt: null,
            },
            include: {
                course: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        const keyword = query.keyword?.trim().toLowerCase();
        const filtered = products.filter((product) => {
            if (query.status && product.status !== query.status) {
                return false;
            }

            if (query.courseId && product.courseId !== query.courseId) {
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
            items: filtered.map((product) => mapProduct(product)),
        };
    }

    async getProduct(productId: string) {
        const product = await this.loadProduct(productId);
        return product ? mapProduct(product) : null;
    }

    async listOrders(authorization?: string) {
        const session = await this.requireSession(authorization);
        const orders = await this.prisma.order.findMany({
            where: {
                userId: session.user.id as string,
                deletedAt: null,
            },
            include: {
                items: true,
                payments: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return {
            items: orders.map((order) => mapOrder(order)),
        };
    }

    async getOrder(orderId: string, authorization?: string) {
        const session = await this.requireSession(authorization);
        const order = await this.prisma.order.findFirst({
            where: {
                id: orderId,
                userId: session.user.id as string,
                deletedAt: null,
            },
            include: {
                items: true,
                payments: true,
            },
        });

        return order ? mapOrder(order) : null;
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

        const productIds = body.items.map((item) => item.productId);
        const products = await Promise.all(productIds.map((productId) => this.loadProduct(productId)));
        const productMap = new Map(products.filter(Boolean).map((product) => [product!.id, product!]));

        if (productMap.size !== productIds.length) {
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

            return {
                product,
                quantity,
            };
        });

        const totalAmount = normalizedItems.reduce((total, item) => total + Number(item.product.price) * item.quantity, 0);
        const currency = normalizedItems[0]?.product.currency ?? "CNY";

        const orderId = await this.prisma.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: {
                    userId: session.user.id as string,
                    orderNo: `ORD-${randomUUID()}`,
                    status: "pending",
                    totalAmount: totalAmount.toFixed(2),
                    currency,
                },
            });

            await Promise.all(
                normalizedItems.map((item) =>
                    tx.orderItem.create({
                        data: {
                            orderId: order.id,
                            productId: item.product.id,
                            name: item.product.name,
                            quantity: item.quantity,
                            unitPrice: Number(item.product.price).toFixed(2),
                        },
                    })
                )
            );

            return order.id;
        });

        return this.getOrder(orderId, authorization);
    }

    async cancelOrder(orderId: string, authorization?: string) {
        const session = await this.requireSession(authorization);
        const order = await this.prisma.order.findFirst({
            where: {
                id: orderId,
                userId: session.user.id as string,
                deletedAt: null,
            },
        });

        if (!order) {
            throw new BadRequestException(errorKeys.orderNotFound);
        }

        if (order.status === "paid") {
            throw new BadRequestException(errorKeys.paidOrderCannotBeCancelled);
        }

        await this.prisma.order.update({
            where: {
                id: order.id,
            },
            data: {
                status: "cancelled",
            },
        });

        return {
            success: true as const,
        };
    }

    async createPayment(orderId: string, authorization?: string) {
        const session = await this.requireSession(authorization);
        const order = await this.prisma.order.findFirst({
            where: {
                id: orderId,
                userId: session.user.id as string,
                deletedAt: null,
            },
            include: {
                items: true,
                payments: true,
            },
        });

        if (!order) {
            throw new BadRequestException(errorKeys.orderNotFound);
        }

        if (order.status === "paid") {
            const latestPayment = order.payments[0];
            return latestPayment ? mapPayment(latestPayment) : null;
        }

        const payment = await this.prisma.$transaction(async (tx) => {
            const createdPayment = await tx.payment.create({
                data: {
                    userId: session.user.id as string,
                    orderId: order.id,
                    paymentNo: `PAY-${randomUUID()}`,
                    status: "succeeded",
                    amount: order.totalAmount.toString(),
                    currency: order.currency,
                    provider: "manual",
                    externalRef: order.orderNo,
                    gatewayTxnId: `GW-${randomUUID()}`,
                },
            });

            await tx.paymentEvent.create({
                data: {
                    paymentId: createdPayment.id,
                    eventType: "payment_succeeded",
                    payload: {
                        orderId: order.id,
                        paymentNo: createdPayment.paymentNo,
                    },
                },
            });

            await tx.order.update({
                where: {
                    id: order.id,
                },
                data: {
                    status: "paid",
                },
            });

            return createdPayment;
        });

        return mapPayment(payment);
    }

    async payOrder(orderId: string, authorization?: string) {
        return this.createPayment(orderId, authorization);
    }

    async getPayment(paymentId: string, authorization?: string) {
        const session = await this.requireSession(authorization);
        const payment = await this.prisma.payment.findFirst({
            where: {
                id: paymentId,
                userId: session.user.id as string,
                deletedAt: null,
            },
        });

        return payment ? mapPayment(payment) : null;
    }

    async getPaymentStatus(orderId: string, authorization?: string) {
        const session = await this.requireSession(authorization);
        const order = await this.prisma.order.findFirst({
            where: {
                id: orderId,
                userId: session.user.id as string,
                deletedAt: null,
            },
            include: {
                payments: true,
            },
        });

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
        const subscriptions = await this.prisma.subscription.findMany({
            where: {
                userId: session.user.id as string,
                deletedAt: null,
            },
            include: {
                product: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return {
            items: subscriptions.map((subscription) => mapSubscription(subscription)),
        };
    }

    async getCurrentSubscription(authorization?: string) {
        const session = await this.requireSession(authorization);
        const subscription = await this.prisma.subscription.findFirst({
            where: {
                userId: session.user.id as string,
                status: "active",
                deletedAt: null,
            },
            include: {
                product: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return subscription ? mapSubscription(subscription) : null;
    }

    async getSubscription(subscriptionId: string, authorization?: string) {
        const session = await this.requireSession(authorization);
        const subscription = await this.prisma.subscription.findFirst({
            where: {
                id: subscriptionId,
                userId: session.user.id as string,
                deletedAt: null,
            },
            include: {
                product: true,
            },
        });

        return subscription ? mapSubscription(subscription) : null;
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
        const product = await this.loadProduct(body.productId);
        if (!product) {
            throw new BadRequestException(errorKeys.productNotFound);
        }

        const subscription = await this.prisma.subscription.create({
            data: {
                userId: session.user.id as string,
                productId: product.id,
                orderId: body.orderId ?? null,
                status: "active",
                startedAt: new Date(),
                endsAt: body.endsAt ? new Date(body.endsAt) : new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
            },
            include: {
                product: true,
            },
        });

        return mapSubscription(subscription);
    }

    async renewSubscription(subscriptionId: string, authorization?: string) {
        const session = await this.requireSession(authorization);
        const subscription = await this.prisma.subscription.findFirst({
            where: {
                id: subscriptionId,
                userId: session.user.id as string,
                deletedAt: null,
            },
            include: {
                product: true,
            },
        });

        if (!subscription) {
            throw new BadRequestException(errorKeys.subscriptionNotFound);
        }

        const base = subscription.endsAt && subscription.endsAt > new Date() ? subscription.endsAt : new Date();
        const renewed = await this.prisma.subscription.update({
            where: {
                id: subscription.id,
            },
            data: {
                endsAt: new Date(base.getTime() + 1000 * 60 * 60 * 24 * 30),
            },
            include: {
                product: true,
            },
        });

        return mapSubscription(renewed);
    }

    async cancelAutoRenew(subscriptionId: string, authorization?: string) {
        const session = await this.requireSession(authorization);
        const subscription = await this.prisma.subscription.findFirst({
            where: {
                id: subscriptionId,
                userId: session.user.id as string,
                deletedAt: null,
            },
            include: {
                product: true,
            },
        });

        if (!subscription) {
            throw new BadRequestException(errorKeys.subscriptionNotFound);
        }

        return {
            success: true as const,
            subscription: mapSubscription(subscription),
        };
    }
}
