import { Body, Controller, Get, Headers, Param, Post } from "@nestjs/common";
import { AuthLicenseService } from "../auth/auth-license.service.js";

@Controller()
export class DevicesController {
    constructor(private readonly authLicenseService: AuthLicenseService) {}

    @Get("devices")
    listDevices(@Headers("authorization") authorization?: string) {
        return this.authLicenseService.listDevices(authorization);
    }

    @Get("devices/:deviceId")
    getDevice(@Param("deviceId") deviceId: string, @Headers("authorization") authorization?: string) {
        return this.authLicenseService.getDevice(deviceId, authorization);
    }

    @Post("devices/:deviceId/binding-code")
    generateBindingCode(@Param("deviceId") deviceId: string, @Headers("authorization") authorization?: string) {
        return this.authLicenseService.generateBindingCode(deviceId, authorization);
    }

    @Post("devices/bind")
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

    @Post("devices/:deviceId/unbind")
    unbindDevice(@Param("deviceId") deviceId: string, @Headers("authorization") authorization?: string) {
        return this.authLicenseService.unbindDeviceByDeviceId(deviceId, authorization);
    }

    @Get("device-bindings")
    listDeviceBindings(@Headers("authorization") authorization?: string) {
        return this.authLicenseService.listDeviceBindings(authorization);
    }
}
