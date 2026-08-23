import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { errorKeys } from "../common/errors/error-keys.js";
import { SUPABASE_CLIENT } from "../common/supabase/supabase.module.js";
import { SupabaseClient } from "../common/supabase/supabase.client.js";

const paymentStatuses = new Set(["initiated", "processing", "succeeded", "failed", "reversed"] as const);
const licenseStatuses = new Set(["active", "suspended", "revoked", "expired"] as const);
const runStatuses = new Set(["queued", "running", "succeeded", "failed", "timeout", "cancelled"] as const);

type PaymentWebhookStatus = typeof paymentStatuses extends Set<infer T> ? T : never;
type LicenseWebhookStatus = typeof licenseStatuses extends Set<infer T> ? T : never;
type RunWebhookStatus = typeof runStatuses extends Set<infer T> ? T : never;

type PaymentRow = {
    id: string;
    user_id: string;
    order_id: string | null;
    payment_no: string;
    status: string;
    amount: string;
    currency: string;
    provider: string | null;
    external_ref: string | null;
    gateway_txn_id: string | null;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
};

type OrderRow = {
    id: string;
    user_id: string;
    order_no: string;
    status: string;
    total_amount: string;
    currency: string;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
};

type DesktopLicenseRow = {
    id: string;
    user_id: string;
    license_key: string;
    status: string;
    max_devices: number;
    max_primary_devices: number;
    issued_at: string;
    expires_at: string | null;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
};

type IntegrationClientRow = {
    id: string;
    code: string;
    name: string;
    secret_hash: string | null;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
};

type RunRow = {
    id: string;
    user_id: string;
    task_id: string;
    status: string;
    input: string | null;
    output: string | null;
    error: string | null;
    runtime_ms: number | null;
    memory_kb: number | null;
    started_at: string | null;
    finished_at: string | null;
    created_at: string;
    submitted_at: string | null;
    deleted_at: string | null;
};

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
    constructor(@Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient) {}

    async handlePaymentWebhook(body: { eventId: string; paymentNo: string; status: string }) {
        if (!body?.eventId || !body.paymentNo || !body.status) {
            throw new BadRequestException(errorKeys.invalidRequestPayload);
        }
        const status = requireStatus(paymentStatuses, body.status, "payment");

        const payment = await this.supabase.selectOne<PaymentRow>("public", "payments", {
            payment_no: body.paymentNo,
            deleted_at: null,
        });

        if (!payment) {
            throw new BadRequestException(errorKeys.paymentNotFound);
        }

        const order = payment.order_id
            ? await this.supabase.selectOne<OrderRow>("public", "orders", {
                  id: payment.order_id,
                  deleted_at: null,
              })
            : null;

        await this.supabase.updateRows<PaymentRow>(
            "public",
            "payments",
            {
                id: payment.id,
            },
            {
                status,
            }
        );

        await this.supabase.insertRow("public", "payment_events", {
            payment_id: payment.id,
            event_type: `webhook_payment_${status}`,
            payload: {
                eventId: body.eventId,
                paymentNo: body.paymentNo,
            },
        });

        if (order && status === "succeeded") {
            await this.supabase.updateRows<OrderRow>(
                "public",
                "orders",
                {
                    id: order.id,
                },
                {
                    status: "paid",
                }
            );
        }

        return { success: true as const };
    }

    async handleLicenseWebhook(body: { eventId: string; licenseKey: string; status: string }) {
        if (!body?.eventId || !body.licenseKey || !body.status) {
            throw new BadRequestException(errorKeys.invalidRequestPayload);
        }
        const status = requireStatus(licenseStatuses, body.status, "license");

        const license = await this.supabase.selectOne<DesktopLicenseRow>("public", "desktop_licenses", {
            license_key: body.licenseKey,
            deleted_at: null,
        });

        if (!license) {
            throw new BadRequestException(errorKeys.licenseNotFound);
        }

        await this.supabase.updateRows<DesktopLicenseRow>(
            "public",
            "desktop_licenses",
            {
                id: license.id,
            },
            {
                status,
            }
        );

        await this.supabase.insertRow("public", "license_events", {
            desktop_license_id: license.id,
            event_type: `webhook_license_${status}`,
            payload: {
                eventId: body.eventId,
                licenseKey: body.licenseKey,
            },
        });

        return { success: true as const };
    }

    async handleIntegrationWebhook(clientKey: string, body: { eventId: string }) {
        if (!clientKey || !body?.eventId) {
            throw new BadRequestException(errorKeys.invalidRequestPayload);
        }

        const clients = await this.supabase.selectRows<IntegrationClientRow>("public", "integration_clients", {
            deleted_at: null,
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

        const run = await this.supabase.selectOne<RunRow>("public", "runs", {
            id: body.runId,
            deleted_at: null,
        });

        if (!run) {
            throw new BadRequestException(errorKeys.runNotFound);
        }

        await this.supabase.updateRows<RunRow>(
            "public",
            "runs",
            {
                id: run.id,
            },
            {
                status,
                output: body.stdout ?? run.output,
                error: body.stderr ?? run.error,
                finished_at: new Date().toISOString(),
            }
        );

        return { success: true as const };
    }
}
