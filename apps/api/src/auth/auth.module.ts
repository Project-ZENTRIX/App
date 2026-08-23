import { Module } from "@nestjs/common";
import { SupabaseModule } from "../common/supabase/supabase.module.js";
import { AuthController } from "./auth.controller.js";
import { AuthCoreService } from "./auth-core.service.js";
import { AuthLicenseService } from "./auth-license.service.js";
import { MeController } from "./me.controller.js";

@Module({
    imports: [SupabaseModule],
    controllers: [AuthController, MeController],
    providers: [AuthCoreService, AuthLicenseService],
    exports: [AuthCoreService, AuthLicenseService],
})
export class AuthModule {}
