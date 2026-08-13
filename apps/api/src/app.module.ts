import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module.js";
import { AuthModule } from "./auth/auth.module.js";
import { CoursesModule } from "./courses/courses.module.js";

@Module({
    imports: [PrismaModule, AuthModule, CoursesModule],
})
export class AppModule {}
