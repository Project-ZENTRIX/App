import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import { errorKeys } from "../common/errors/error-keys.js";

const paymentStatuses = new Set(["initiated", "processing", "succeeded", "failed", "reversed"] as const);
const licenseStatuses = new Set(["active", "suspended", "revoked", "expired"] as const);
const runStatuses = new Set(["queued", "running", "succeeded", "failed", "timeout", "cancelled"] as const);

type PaymentWebhookStatus = typeof paymentStatuses extends Set<infer T> ? T : never;
type LicenseWebhookStatus = typeof licenseStatuses extends Set<infer T> ? T : never;
type RunWebhookStatus = typeof runStatuses extends Set<infer T> ? T : never;

function requireStatus<T extends string>(allowed: Set<T>, value: string, label: string): T {
    if (!allowed.has(value as T)) {
        if (label === "payment") {
            throw new BadRequestException(errorKeys.invalidPaymentWebhookStatus);
        }
        if (label === "license") {
            throw new BadRequestException(errorKeys.invalidLicenseWebhookStatus);
        }
        throw new BadRequestException(errorKeys.invalidSandboxStatus);
    }

    return value as T;
}

@Injectable()
export class WebhooksService {
    constructor(private readonly prisma: PrismaService) {}

    async handlePaymentWebhook(body: { eventId: string; paymentNo: string; status: string }) {
        if (!body?.eventId || !body.paymentNo || !body.status) {
            throw new BadRequestException(errorKeys.invalidRequestPayload);
        }
        const status = requireStatus(paymentStatuses, body.status, "payment");

        const payment = await this.prisma.payment.findFirst({
            where: {
                paymentNo: body.paymentNo,
                deletedAt: null,
            },
        });

        if (!payment) {
            throw new BadRequestException(errorKeys.paymentNotFound);
        }

        const order = payment.orderId
            ? await this.prisma.order.findFirst({
                  where: {
                      id: payment.orderId,
                      deletedAt: null,
                  },
              })
            : null;

        await this.prisma.$transaction(async (tx) => {
            await tx.payment.update({
                where: {
                    id: payment.id,
                },
                data: {
                    status,
                },
            });

            await tx.paymentEvent.create({
                data: {
                    paymentId: payment.id,
                    eventType: `webhook_payment_${status}`,
                    payload: {
                        eventId: body.eventId,
                        paymentNo: body.paymentNo,
                    },
                },
            });

            if (order && status === "succeeded") {
                await tx.order.update({
                    where: {
                        id: order.id,
                    },
                    data: {
                        status: "paid",
                    },
                });
            }
        });

        return { success: true as const };
    }

    async handleLicenseWebhook(body: { eventId: string; licenseKey: string; status: string }) {
        if (!body?.eventId || !body.licenseKey || !body.status) {
            throw new BadRequestException(errorKeys.invalidRequestPayload);
        }
        const status = requireStatus(licenseStatuses, body.status, "license");

        const license = await this.prisma.desktopLicense.findFirst({
            where: {
                licenseKey: body.licenseKey,
                deletedAt: null,
            },
        });

        if (!license) {
            throw new BadRequestException(errorKeys.licenseNotFound);
        }

        await this.prisma.$transaction(async (tx) => {
            await tx.desktopLicense.update({
                where: {
                    id: license.id,
                },
                data: {
                    status,
                },
            });

            await tx.licenseEvent.create({
                data: {
                    desktopLicenseId: license.id,
                    eventType: `webhook_license_${status}`,
                    payload: {
                        eventId: body.eventId,
                        licenseKey: body.licenseKey,
                    },
                },
            });
        });

        return { success: true as const };
    }

    async handleIntegrationWebhook(clientKey: string, body: { eventId: string }) {
        if (!clientKey || !body?.eventId) {
            throw new BadRequestException(errorKeys.invalidRequestPayload);
        }

        const clients = await this.prisma.integrationClient.findMany({
            where: {
                deletedAt: null,
            },
        });

        if (!clients.some((client) => client.code === clientKey)) {
            throw new BadRequestException(errorKeys.integrationClientNotFound);
        }

        return { success: true as const };
    }

    async handleSandboxWebhook(body: {
        eventId: string;
        runId: string;
        status: string;
        stdout?: string | null;
        stderr?: string | null;
    }) {
        if (!body?.eventId || !body.runId || !body.status) {
            throw new BadRequestException(errorKeys.invalidRequestPayload);
        }
        const status = requireStatus(runStatuses, body.status, "run");

        const run = await this.prisma.run.findFirst({
            where: {
                id: body.runId,
                deletedAt: null,
            },
        });

        if (!run) {
            throw new BadRequestException(errorKeys.runNotFound);
        }

        await this.prisma.$transaction(async (tx) => {
            await tx.run.update({
                where: {
                    id: run.id,
                },
                data: {
                    status,
                    output: body.stdout ?? run.output,
                    error: body.stderr ?? run.error,
                    finishedAt: new Date(),
                },
            });
        });

        return { success: true as const };
    }
}
