import { Body, Controller, Get, Headers, Param, Post } from "@nestjs/common";
import { SubmissionsService } from "./submissions.service.js";

@Controller()
export class SubmissionsController {
    constructor(private readonly submissionsService: SubmissionsService) {}

    @Post("submissions")
    createSubmission(
        @Headers("authorization") authorization: string | undefined,
        @Body()
        body: {
            taskId: string;
            runId?: string | null;
            code?: string | null;
            language?: string | null;
        }
    ) {
        return this.submissionsService.createSubmission(authorization, body);
    }

    @Get("submissions")
    listSubmissions(@Headers("authorization") authorization: string | undefined) {
        return this.submissionsService.listSubmissions(authorization);
    }

    @Get("submissions/:submissionId")
    getSubmission(@Param("submissionId") submissionId: string, @Headers("authorization") authorization: string | undefined) {
        return this.submissionsService.getSubmission(submissionId, authorization);
    }
}
