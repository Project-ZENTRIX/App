import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module.js";
import { AuthModule } from "./auth/auth.module.js";
import { AchievementsModule } from "./achievements/achievements.module.js";
import { CoursesModule } from "./courses/courses.module.js";
import { CommerceModule } from "./commerce/commerce.module.js";
import { ProgressModule } from "./progress/progress.module.js";
import { RunsModule } from "./runs/runs.module.js";
import { SubmissionsModule } from "./submissions/submissions.module.js";
import { LicensesModule } from "./licenses/licenses.module.js";
import { DevicesModule } from "./devices/devices.module.js";
import { AdminModule } from "./admin/admin.module.js";
import { WebhooksModule } from "./webhooks/webhooks.module.js";

@Module({
    imports: [
        PrismaModule,
        AuthModule,
        AchievementsModule,
        CoursesModule,
        CommerceModule,
        ProgressModule,
        RunsModule,
        SubmissionsModule,
        LicensesModule,
        DevicesModule,
        AdminModule,
        WebhooksModule,
    ],
})
export class AppModule {}
