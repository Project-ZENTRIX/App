import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { LicensesController } from "./licenses.controller.js";

@Module({
    imports: [AuthModule],
    controllers: [LicensesController],
})
export class LicensesModule {}
