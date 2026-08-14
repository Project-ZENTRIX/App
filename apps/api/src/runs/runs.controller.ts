import { Body, Controller, Get, Headers, Param, Post } from "@nestjs/common";
import { RunsService } from "./runs.service.js";

@Controller()
export class RunsController {
    constructor(private readonly runsService: RunsService) {}

    @Post("runs")
    createRun(
        @Headers("authorization") authorization: string | undefined,
        @Body() body: { taskId: string; input?: string | null }
    ) {
        return this.runsService.createRun(authorization, body);
    }

    @Get("runs")
    listRuns(@Headers("authorization") authorization: string | undefined) {
        return this.runsService.listRuns(authorization);
    }

    @Get("runs/:runId")
    getRun(@Param("runId") runId: string, @Headers("authorization") authorization: string | undefined) {
        return this.runsService.getRun(runId, authorization);
    }

    @Get("runs/:runId/logs")
    getRunLogs(@Param("runId") runId: string, @Headers("authorization") authorization: string | undefined) {
        return this.runsService.getRunLogs(runId, authorization);
    }

    @Get("judgements/:judgementId")
    getJudgement(@Param("judgementId") judgementId: string) {
        return this.runsService.getJudgement(judgementId);
    }
}
