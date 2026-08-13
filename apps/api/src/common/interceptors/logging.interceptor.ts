import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from "@nestjs/common";
import { tap } from "rxjs";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler) {
        const request = context.switchToHttp().getRequest<{ method?: string; originalUrl?: string }>();
        const method = request.method ?? "UNKNOWN";
        const url = request.originalUrl ?? "UNKNOWN";
        const startedAt = Date.now();

        return next.handle().pipe(
            tap({
                next: () => {
                    this.logger.log(`${method} ${url} ${Date.now() - startedAt}ms`);
                },
                error: (error: unknown) => {
                    const message = error instanceof Error ? error.message : "Unknown error";
                    this.logger.error(`${method} ${url} failed in ${Date.now() - startedAt}ms: ${message}`);
                },
            })
        );
    }
}
