import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import {
    chapterSeedData,
    contentAssetSeedData,
    courseSeedData,
    lessonSeedData,
    taskSeedData,
} from "./courses.seed-data.js";

function cloneRecords<T>(records: readonly T[]) {
    return records.map((record) => ({ ...record }));
}

function cloneCourseRecords() {
    return courseSeedData.map((record) => ({
        ...record,
        tags: [...record.tags],
        supportedLanguages: [...record.supportedLanguages],
    }));
}

export async function seedCourseCatalog(prisma: PrismaService) {
    const courseCount = await prisma.course.count();
    if (courseCount > 0) {
        return { seeded: false as const };
    }

    await prisma.$transaction(async (tx) => {
        await tx.course.createMany({ data: cloneCourseRecords() });
        await tx.chapter.createMany({ data: cloneRecords(chapterSeedData) });
        await tx.lesson.createMany({ data: cloneRecords(lessonSeedData) });
        await tx.task.createMany({ data: cloneRecords(taskSeedData) });
        await tx.contentAsset.createMany({ data: cloneRecords(contentAssetSeedData) });
    });

    return { seeded: true as const };
}

@Injectable()
export class CoursesSeedService implements OnModuleInit {
    constructor(private readonly prisma: PrismaService) {}

    async onModuleInit() {
        await seedCourseCatalog(this.prisma);
    }
}
