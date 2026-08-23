import { Module } from "@nestjs/common";
import { SupabaseModule } from "../common/supabase/supabase.module.js";
import { CoursesController } from "./courses.controller.js";
import { CoursesSeedService } from "./courses.seed.js";
import { CoursesService } from "./courses.service.js";

@Module({
    imports: [SupabaseModule],
    controllers: [CoursesController],
    providers: [CoursesService, CoursesSeedService],
    exports: [CoursesService],
})
export class CoursesModule {}
