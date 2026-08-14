import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module.js";
import { RunsController } from "./runs.controller.js";
import { RunsService } from "./runs.service.js";

@Module({
    imports: [PrismaModule],
    controllers: [RunsController],
    providers: [RunsService],
})
export class RunsModule {}
