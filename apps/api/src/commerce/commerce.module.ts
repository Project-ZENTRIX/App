import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module.js";
import { CommerceController } from "./commerce.controller.js";
import { CommerceService } from "./commerce.service.js";

@Module({
    imports: [PrismaModule],
    controllers: [CommerceController],
    providers: [CommerceService],
})
export class CommerceModule {}
