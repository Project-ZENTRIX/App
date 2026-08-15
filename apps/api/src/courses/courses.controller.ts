import { Controller, Get, Param, Query } from "@nestjs/common";
import { CourseQueryDto } from "./dto/course-query.dto.js";
import { CoursesService } from "./courses.service.js";

@Controller()
export class CoursesController {
    constructor(private readonly coursesService: CoursesService) {}

    @Get("courses")
    listCourses(@Query() query: CourseQueryDto) {
        return this.coursesService.listCourses(query);
    }

    @Get("courses/:courseId")
    getCourse(@Param("courseId") courseId: string) {
        return this.coursesService.getCourse(courseId);
    }

    @Get("courses/:courseId/chapters")
    getCourseChapters(@Param("courseId") courseId: string) {
        return this.coursesService.getCourseChapters(courseId);
    }

    @Get("chapters/:chapterId/lessons")
    getChapterLessons(@Param("chapterId") chapterId: string) {
        return this.coursesService.getChapterLessons(chapterId);
    }

    @Get("lessons/:lessonId")
    getLesson(@Param("lessonId") lessonId: string) {
        return this.coursesService.getLesson(lessonId);
    }

    @Get("tasks/:taskId")
    getTask(@Param("taskId") taskId: string) {
        return this.coursesService.getTask(taskId);
    }

    @Get("content-assets/:assetId")
    getContentAsset(@Param("assetId") assetId: string) {
        return this.coursesService.getContentAsset(assetId);
    }

    @Get("courses/:courseId/releases")
    getCourseReleases(@Param("courseId") courseId: string) {
        return this.coursesService.getCourseReleases(courseId);
    }

    @Get("courses/:courseId/versions")
    getCourseVersions(@Param("courseId") courseId: string) {
        return this.coursesService.getCourseVersions(courseId);
    }
}
