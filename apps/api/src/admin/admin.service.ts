import { Inject, Injectable } from "@nestjs/common";
import { SUPABASE_CLIENT } from "../common/supabase/supabase.module.js";
import { SupabaseClient } from "../common/supabase/supabase.client.js";

type AuditLogRow = {
    id: string;
    tenant_id: string | null;
    user_id: string | null;
    action: string;
    entity_type: string;
    entity_id: string | null;
    payload: unknown;
    deleted_at: string | null;
    created_at: string;
};

type FeatureFlagRow = {
    id: string;
    key: string;
    name: string;
    enabled: boolean;
    payload: unknown;
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

function toDate(value: string | null) {
    return value ? new Date(value) : null;
}

@Injectable()
export class AdminService {
    constructor(@Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient) {}

    async listAuditLogs() {
        const items = await this.supabase.selectRows<AuditLogRow>("public", "audit_logs", {}, "*", {
            column: "created_at",
            ascending: false,
        });

        return {
            items: items.map((item) => ({
                id: item.id,
                tenantId: item.tenant_id,
                userId: item.user_id,
                action: item.action,
                entityType: item.entity_type,
                entityId: item.entity_id,
                payload: item.payload,
                deletedAt: toDate(item.deleted_at),
                createdAt: new Date(item.created_at),
            })),
        };
    }

    async listFeatureFlags() {
        const items = await this.supabase.selectRows<FeatureFlagRow>(
            "public",
            "feature_flags",
            {
                deleted_at: null,
            },
            "*",
            {
                column: "created_at",
                ascending: false,
            }
        );

        return {
            items: items.map((item) => ({
                id: item.id,
                key: item.key,
                name: item.name,
                enabled: item.enabled,
                payload: item.payload,
                deletedAt: toDate(item.deleted_at),
                createdAt: new Date(item.created_at),
                updatedAt: new Date(item.updated_at),
            })),
        };
    }

    async listIntegrationClients() {
        const items = await this.supabase.selectRows<IntegrationClientRow>(
            "public",
            "integration_clients",
            {
                deleted_at: null,
            },
            "*",
            {
                column: "created_at",
                ascending: false,
            }
        );

        return {
            items: items.map((item) => ({
                id: item.id,
                code: item.code,
                name: item.name,
                secretHash: item.secret_hash,
                deletedAt: toDate(item.deleted_at),
                createdAt: new Date(item.created_at),
                updatedAt: new Date(item.updated_at),
            })),
        };
    }
}
