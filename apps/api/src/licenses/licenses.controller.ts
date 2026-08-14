import { Controller, Get, Headers } from "@nestjs/common";
import { AuthLicenseService } from "../auth/auth-license.service.js";

@Controller()
export class LicensesController {
    constructor(private readonly authLicenseService: AuthLicenseService) {}

    @Get("licenses/current")
    getCurrentLicense(@Headers("authorization") authorization?: string) {
        return this.authLicenseService.getLicenseOverview(authorization);
    }

    @Get("licenses/history")
    getLicenseHistory(@Headers("authorization") authorization?: string) {
        return this.authLicenseService.getLicenseHistory(authorization);
    }

    @Get("licenses/events")
    listLicenseEvents(@Headers("authorization") authorization?: string) {
        return this.authLicenseService.listLicenseEvents(authorization);
    }
}
