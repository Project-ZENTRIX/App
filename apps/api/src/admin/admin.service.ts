import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";

@Injectable()
export class AdminService {
    constructor(private readonly prisma: PrismaService) {}

    async listAuditLogs() {
        const items = await this.prisma.auditLog.findMany({
            where: {},
            orderBy: {
                createdAt: "desc",
            },
        });

        return { items };
    }

    async listFeatureFlags() {
        const items = await this.prisma.featureFlag.findMany({
            where: {
                deletedAt: null,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return { items };
    }

    async listIntegrationClients() {
        const items = await this.prisma.integrationClient.findMany({
            where: {
                deletedAt: null,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return { items };
    }
}
