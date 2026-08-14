import { Body, Controller, Get, Headers, Param, Post } from "@nestjs/common";
import { ProgressService } from "./progress.service.js";

@Controller("progress")
export class ProgressController {
    constructor(private readonly progressService: ProgressService) {}

    @Get("overview")
    getOverview(@Headers("authorization") authorization?: string) {
        return this.progressService.getOverview(authorization);
    }

    @Get("enrollments")
    listEnrollments(@Headers("authorization") authorization?: string) {
        return this.progressService.listEnrollments(authorization);
    }

    @Get("courses/:courseId")
    getCourseProgress(@Param("courseId") courseId: string, @Headers("authorization") authorization?: string) {
        return this.progressService.getCourseProgress(courseId, authorization);
    }

    @Get("lessons/:lessonId")
    getLessonProgress(@Param("lessonId") lessonId: string, @Headers("authorization") authorization?: string) {
        return this.progressService.getLessonProgress(lessonId, authorization);
    }

    @Get("events")
    listEvents(@Headers("authorization") authorization?: string) {
        return this.progressService.listEvents(authorization);
    }

    @Post("events")
    createEvent(
        @Body()
        body: {
            courseId?: string | null;
            lessonId?: string | null;
            taskId?: string | null;
            eventType: string;
            payload?: Record<string, unknown> | null;
        },
        @Headers("authorization") authorization?: string
    ) {
        return this.progressService.createEvent(authorization, body);
    }
}
