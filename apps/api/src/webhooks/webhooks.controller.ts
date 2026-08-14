import { Body, Controller, Param, Post } from "@nestjs/common";
import { WebhooksService } from "./webhooks.service.js";

@Controller("webhooks")
export class WebhooksController {
    constructor(private readonly webhooksService: WebhooksService) {}

    @Post("payments")
    handlePaymentsWebhook(
        @Body()
        body: {
            eventId: string;
            paymentNo: string;
            status: string;
        }
    ) {
        return this.webhooksService.handlePaymentWebhook(body);
    }

    @Post("licenses")
    handleLicensesWebhook(
        @Body()
        body: {
            eventId: string;
            licenseKey: string;
            status: string;
        }
    ) {
        return this.webhooksService.handleLicenseWebhook(body);
    }

    @Post("integrations/:clientKey")
    handleIntegrationWebhook(
        @Param("clientKey") clientKey: string,
        @Body()
        body: {
            eventId: string;
        }
    ) {
        return this.webhooksService.handleIntegrationWebhook(clientKey, body);
    }

    @Post("sandbox")
    handleSandboxWebhook(
        @Body()
        body: {
            eventId: string;
            runId: string;
            status: string;
            stdout?: string | null;
            stderr?: string | null;
        }
    ) {
        return this.webhooksService.handleSandboxWebhook(body);
    }
}
