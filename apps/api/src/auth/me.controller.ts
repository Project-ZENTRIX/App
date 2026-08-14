import { Body, Controller, Delete, Get, Headers, Param, Patch, Post } from "@nestjs/common";
import { AuthCoreService } from "./auth-core.service.js";
import { AuthLicenseService } from "./auth-license.service.js";

@Controller("auth/me")
export class MeController {
    constructor(
        private readonly authCoreService: AuthCoreService,
        private readonly authLicenseService: AuthLicenseService
    ) {}

    @Get()
    me(@Headers("authorization") authorization?: string) {
        return this.authCoreService.getCurrentAccount(authorization);
    }

    @Patch("profile")
    updateProfile(
        @Body()
        body: {
            name?: string;
            image?: string | null;
            bio?: string | null;
        },
        @Headers("authorization") authorization?: string
    ) {
        return this.authCoreService.updateProfile(body, authorization);
    }

    @Patch("password")
    updatePassword(
        @Body()
        body: {
            currentPassword: string;
            newPassword: string;
        },
        @Headers("authorization") authorization?: string
    ) {
        return this.authCoreService.updatePassword(body, authorization);
    }

    @Get("sessions")
    listSessions(@Headers("authorization") authorization?: string) {
        return this.authCoreService.listSessions(authorization);
    }

    @Delete("sessions/:id")
    revokeSession(@Param("id") id: string, @Headers("authorization") authorization?: string) {
        return this.authCoreService.revokeSession(id, authorization);
    }

    @Get("notification-preferences")
    getNotificationPreferences(@Headers("authorization") authorization?: string) {
        return this.authCoreService.getNotificationPreferences(authorization);
    }

    @Patch("notification-preferences")
    updateNotificationPreferences(
        @Body()
        body: {
            email?: boolean;
            sms?: boolean;
            inApp?: boolean;
        },
        @Headers("authorization") authorization?: string
    ) {
        return this.authCoreService.updateNotificationPreferences(body, authorization);
    }

    @Get("audit-records")
    getAuditRecords(@Headers("authorization") authorization?: string) {
        return this.authCoreService.getAuditRecords(authorization);
    }

    @Get("profile")
    getProfile(@Headers("authorization") authorization?: string) {
        return this.authCoreService.getProfile(authorization);
    }

    @Get("security")
    getSecurity(@Headers("authorization") authorization?: string) {
        return this.authCoreService.listSessions(authorization);
    }

    @Get("license")
    getLicenseOverview(@Headers("authorization") authorization?: string) {
        return this.authLicenseService.getLicenseOverview(authorization);
    }

    @Get("license/history")
    getLicenseHistory(@Headers("authorization") authorization?: string) {
        return this.authLicenseService.getLicenseHistory(authorization);
    }

    @Get("license/devices")
    listDevices(@Headers("authorization") authorization?: string) {
        return this.authLicenseService.listDevices(authorization);
    }

    @Get("license/devices/:deviceId")
    getDevice(@Param("deviceId") deviceId: string, @Headers("authorization") authorization?: string) {
        return this.authLicenseService.getDevice(deviceId, authorization);
    }

    @Post("license/devices/:deviceId/binding-code")
    generateBindingCode(@Param("deviceId") deviceId: string, @Headers("authorization") authorization?: string) {
        return this.authLicenseService.generateBindingCode(deviceId, authorization);
    }

    @Post("license/bindings")
    bindDevice(
        @Body()
        body: {
            deviceId: string;
            bindingCode: string;
            deviceFingerprint?: string | null;
            deviceSlot?: number;
            isPrimary?: boolean;
        },
        @Headers("authorization") authorization?: string
    ) {
        return this.authLicenseService.bindDevice(body, authorization);
    }

    @Delete("license/bindings/:bindingId")
    unbindDevice(@Param("bindingId") bindingId: string, @Headers("authorization") authorization?: string) {
        return this.authLicenseService.unbindDevice(bindingId, authorization);
    }

    @Get("license/events")
    listLicenseEvents(@Headers("authorization") authorization?: string) {
        return this.authLicenseService.listLicenseEvents(authorization);
    }
}
