import { Type } from "class-transformer";
import { IsIn, IsOptional, IsString, Max, Min } from "class-validator";

export class CourseQueryDto {
    @IsOptional()
    @IsString()
    keyword?: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsString()
    language?: string;

    @IsOptional()
    @IsString()
    difficulty?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsIn(["featured", "latest", "popular"])
    sort?: "featured" | "latest" | "popular";

    @IsOptional()
    @Type(() => Number)
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @Min(1)
    @Max(100)
    pageSize?: number = 10;
}
