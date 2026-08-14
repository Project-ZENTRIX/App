import { Body, Controller, Get, Headers, Param, Patch, Post, Query } from "@nestjs/common";
import { CommerceService } from "./commerce.service.js";

@Controller()
export class CommerceController {
    constructor(private readonly commerceService: CommerceService) {}

    @Get("products")
    listProducts(@Query() query: { keyword?: string; status?: string; courseId?: string }) {
        return this.commerceService.listProducts(query);
    }

    @Get("products/:productId")
    getProduct(@Param("productId") productId: string) {
        return this.commerceService.getProduct(productId);
    }

    @Post("orders")
    createOrder(
        @Headers("authorization") authorization: string | undefined,
        @Body() body: { items: Array<{ productId: string; quantity?: number }> }
    ) {
        return this.commerceService.createOrder(authorization, body);
    }

    @Get("orders")
    listOrders(@Headers("authorization") authorization: string | undefined) {
        return this.commerceService.listOrders(authorization);
    }

    @Get("orders/:orderId")
    getOrder(@Param("orderId") orderId: string, @Headers("authorization") authorization: string | undefined) {
        return this.commerceService.getOrder(orderId, authorization);
    }

    @Post("orders/:orderId/cancel")
    cancelOrder(@Param("orderId") orderId: string, @Headers("authorization") authorization: string | undefined) {
        return this.commerceService.cancelOrder(orderId, authorization);
    }

    @Post("orders/:orderId/pay")
    payOrder(@Param("orderId") orderId: string, @Headers("authorization") authorization: string | undefined) {
        return this.commerceService.payOrder(orderId, authorization);
    }

    @Get("orders/:orderId/payment-status")
    getPaymentStatus(@Param("orderId") orderId: string, @Headers("authorization") authorization: string | undefined) {
        return this.commerceService.getPaymentStatus(orderId, authorization);
    }

    @Post("payments")
    createPayment(@Headers("authorization") authorization: string | undefined, @Body() body: { orderId: string }) {
        return this.commerceService.createPayment(body.orderId, authorization);
    }

    @Get("payments/:paymentId")
    getPayment(@Param("paymentId") paymentId: string, @Headers("authorization") authorization: string | undefined) {
        return this.commerceService.getPayment(paymentId, authorization);
    }

    @Get("subscriptions/current")
    getCurrentSubscription(@Headers("authorization") authorization: string | undefined) {
        return this.commerceService.getCurrentSubscription(authorization);
    }

    @Get("subscriptions")
    listSubscriptions(@Headers("authorization") authorization: string | undefined) {
        return this.commerceService.listSubscriptions(authorization);
    }

    @Get("subscriptions/:subscriptionId")
    getSubscription(
        @Param("subscriptionId") subscriptionId: string,
        @Headers("authorization") authorization: string | undefined
    ) {
        return this.commerceService.getSubscription(subscriptionId, authorization);
    }

    @Post("subscriptions")
    createSubscription(
        @Headers("authorization") authorization: string | undefined,
        @Body()
        body: {
            productId: string;
            orderId?: string | null;
            endsAt?: string | null;
        }
    ) {
        return this.commerceService.createSubscription(authorization, body);
    }

    @Patch("subscriptions/:subscriptionId/renew")
    renewSubscription(
        @Param("subscriptionId") subscriptionId: string,
        @Headers("authorization") authorization: string | undefined
    ) {
        return this.commerceService.renewSubscription(subscriptionId, authorization);
    }

    @Post("subscriptions/:subscriptionId/cancel-autorenew")
    cancelAutoRenew(
        @Param("subscriptionId") subscriptionId: string,
        @Headers("authorization") authorization: string | undefined
    ) {
        return this.commerceService.cancelAutoRenew(subscriptionId, authorization);
    }
}
