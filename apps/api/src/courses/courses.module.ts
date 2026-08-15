import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module.js";
import { CoursesController } from "./courses.controller.js";
import { CoursesSeedService } from "./courses.seed.js";
import { CoursesService } from "./courses.service.js";

@Module({
    imports: [PrismaModule],
    controllers: [CoursesController],
    providers: [CoursesService, CoursesSeedService],
})
export class CoursesModule {}
