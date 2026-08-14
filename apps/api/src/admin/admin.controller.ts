import { Controller, Get } from "@nestjs/common";
import { AdminService } from "./admin.service.js";

@Controller("admin")
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    @Get("audit-logs")
    getAuditLogs() {
        return this.adminService.listAuditLogs();
    }

    @Get("feature-flags")
    getFeatureFlags() {
        return this.adminService.listFeatureFlags();
    }

    @Get("integration-clients")
    getIntegrationClients() {
        return this.adminService.listIntegrationClients();
    }
}
